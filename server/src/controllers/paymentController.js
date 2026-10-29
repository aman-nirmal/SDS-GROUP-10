import { config } from '../config/env.js'
import { dataStore } from '../services/dataStore.js'
import { supabase } from '../config/supabase.js'

const CASHFREE_BASE_URL = config.cashfreeEnv === 'sandbox'
  ? 'https://sandbox.cashfree.com/pg'
  : 'https://api.cashfree.com/pg'

/**
 * Helper to extract numeric amount from price strings like:
 * "₹1,180.00 / 1 hr (incl. 18% GST)" -> 1180
 * "₹2,950.00 / 1 hr (incl. GST)" -> 2950
 */
export function parseTariffAmount(rawPrice) {
  if (typeof rawPrice === 'number' && !isNaN(rawPrice)) {
    return rawPrice
  }
  if (typeof rawPrice === 'string') {
    // Match ₹1,180.00 or 1180 or 1,180
    const match = rawPrice.replace(/,/g, '').match(/(\d+(\.\d+)?)/)
    if (match) {
      return parseFloat(match[1])
    }
  }
  return 0
}

/**
 * Create a new Cashfree PG Order
 * POST /api/payments/create-order
 */
export async function createPaymentOrder(req, res, next) {
  try {
    const {
      venueId,
      venueName,
      rawTariff,
      tariff,
      amount: requestedAmount,
      applicantName,
      applicantEmail,
      applicantPhone,
      bookingDate,
      timeSlot,
      purpose
    } = req.body

    const calculatedAmount = requestedAmount
      ? parseFloat(requestedAmount)
      : parseTariffAmount(rawTariff || tariff)

    if (!calculatedAmount || calculatedAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment amount specified.'
      })
    }

    // Cashfree order ID requirements: alphanumeric with underscores/hyphens, max 50 chars
    const orderId = `LOCUS_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`

    // Clean customer details
    const cleanEmail = (applicantEmail || 'applicant@coeptech.ac.in').trim().toLowerCase()
    const cleanPhone = applicantPhone && applicantPhone.replace(/\D/g, '').length >= 10
      ? applicantPhone.replace(/\D/g, '').slice(-10)
      : '9876543210'

    const customerId = `CUST_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20) || 'COEP'}_${Date.now().toString().slice(-4)}`

    const payload = {
      order_id: orderId,
      order_amount: parseFloat(calculatedAmount.toFixed(2)),
      order_currency: 'INR',
      customer_details: {
        customer_id: customerId,
        customer_name: (applicantName || 'Campus Applicant').trim().slice(0, 50),
        customer_email: cleanEmail,
        customer_phone: cleanPhone
      },
      order_meta: {
        // Must be HTTPS for Cashfree production API
        return_url: 'https://locus.coeptech.ac.in/?order_id={order_id}&payment_status=completed'
      },
      order_note: `COEP Venue Reservation: ${venueName || 'Campus Space'} on ${bookingDate || 'Selected Date'} (${timeSlot || ''})`.slice(0, 100)
    }

    console.log(`[Cashfree] Initiating order ${orderId} for ₹${payload.order_amount} (${payload.order_note})`)

    const cfResponse = await fetch(`${CASHFREE_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'x-client-id': config.cashfreeAppId,
        'x-client-secret': config.cashfreeSecretKey,
        'x-api-version': config.cashfreeApiVersion,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = await cfResponse.json()

    if (!cfResponse.ok) {
      console.error('[Cashfree Error] Order creation failed:', data)
      return res.status(cfResponse.status).json({
        success: false,
        error: data.message || 'Cashfree payment gateway order initialization failed.',
        details: data
      })
    }

    console.log(`[Cashfree] Order created successfully. Session ID: ${data.payment_session_id?.slice(0, 20)}...`)

    return res.json({
      success: true,
      orderId: data.order_id,
      cfOrderId: data.cf_order_id,
      paymentSessionId: data.payment_session_id,
      orderAmount: data.order_amount,
      orderCurrency: data.order_currency,
      orderStatus: data.order_status,
      environment: config.cashfreeEnv
    })
  } catch (err) {
    console.error('[Cashfree Exception]', err)
    next(err)
  }
}

/**
 * Verify Order Payment Status with Cashfree
 * POST /api/payments/verify
 */
export async function verifyPayment(req, res, next) {
  try {
    const { orderId, bookingId } = req.body

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'Order ID is required to verify payment.'
      })
    }

    // 1. Fetch Order Status from Cashfree
    const orderRes = await fetch(`${CASHFREE_BASE_URL}/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'x-client-id': config.cashfreeAppId,
        'x-client-secret': config.cashfreeSecretKey,
        'x-api-version': config.cashfreeApiVersion
      }
    })

    const orderData = await orderRes.json()

    if (!orderRes.ok) {
      return res.status(orderRes.status).json({
        success: false,
        error: orderData.message || 'Failed to fetch order status from Cashfree.',
        details: orderData
      })
    }

    // 2. Fetch payments under this order
    let paymentsData = []
    try {
      const payRes = await fetch(`${CASHFREE_BASE_URL}/orders/${orderId}/payments`, {
        method: 'GET',
        headers: {
          'x-client-id': config.cashfreeAppId,
          'x-client-secret': config.cashfreeSecretKey,
          'x-api-version': config.cashfreeApiVersion
        }
      })
      if (payRes.ok) {
        paymentsData = await payRes.json()
      }
    } catch {
      // payments query optional
    }

    const isPaid = orderData.order_status === 'PAID'
    const successfulPayment = Array.isArray(paymentsData)
      ? paymentsData.find((p) => p.payment_status === 'SUCCESS')
      : null

    console.log(`[Cashfree Verify] Order ${orderId}: status=${orderData.order_status}, isPaid=${isPaid}`)

    // 3. If bookingId provided and payment is confirmed, update booking in dataStore
    if ((isPaid || successfulPayment) && bookingId) {
      try {
        const paymentRecord = {
          paymentStatus: 'Paid',
          paymentId: successfulPayment?.cf_payment_id || orderId,
          paymentGateway: 'Cashfree PG (Production)',
          paidAmount: orderData.order_amount,
          paidAt: new Date().toISOString(),
          paymentMethod: successfulPayment?.payment_method ? JSON.stringify(successfulPayment.payment_method) : 'Online (UPI/Cards/NetBanking)'
        }

        await dataStore.updateBooking(bookingId, paymentRecord)

        if (supabase) {
          await supabase.from('bookings').update(paymentRecord).eq('id', bookingId)
        }
      } catch (updateErr) {
        console.warn('[Payment Record Update Warning]', updateErr.message)
      }
    }

    return res.json({
      success: true,
      orderId: orderData.order_id,
      orderStatus: orderData.order_status,
      isPaid,
      amount: orderData.order_amount,
      currency: orderData.order_currency,
      paymentDetails: successfulPayment || null,
      order: orderData
    })
  } catch (err) {
    console.error('[Cashfree Verify Exception]', err)
    next(err)
  }
}

/**
 * Get Cashfree Order Status by ID
 * GET /api/payments/status/:orderId
 */
export async function getPaymentStatus(req, res, next) {
  try {
    const { orderId } = req.params

    const orderRes = await fetch(`${CASHFREE_BASE_URL}/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'x-client-id': config.cashfreeAppId,
        'x-client-secret': config.cashfreeSecretKey,
        'x-api-version': config.cashfreeApiVersion
      }
    })

    const orderData = await orderRes.json()

    if (!orderRes.ok) {
      return res.status(orderRes.status).json({
        success: false,
        error: orderData.message || 'Failed to check order status.',
        details: orderData
      })
    }

    return res.json({
      success: true,
      orderId: orderData.order_id,
      orderStatus: orderData.order_status,
      isPaid: orderData.order_status === 'PAID',
      amount: orderData.order_amount,
      currency: orderData.order_currency,
      order: orderData
    })
  } catch (err) {
    next(err)
  }
}
