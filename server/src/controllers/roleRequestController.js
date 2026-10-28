import { dataStore } from '../services/dataStore.js'

export async function getAllRoleRequests(req, res, next) {
  try {
    const requests = await dataStore.getRoleRequests()
    return res.json({ success: true, count: requests.length, requests })
  } catch (err) {
    next(err)
  }
}

export async function createRoleRequest(req, res, next) {
  try {
    const { applicantName, applicantEmail, currentRole, requestedRole, department, justification } = req.body
    if (!applicantEmail || !requestedRole) {
      return res.status(400).json({ success: false, error: 'Email and requestedRole are required.' })
    }
    const request = await dataStore.createRoleRequest({
      applicantName,
      applicantEmail,
      currentRole,
      requestedRole,
      department,
      justification
    })
    return res.status(201).json({ success: true, request })
  } catch (err) {
    next(err)
  }
}

export async function updateRoleRequestStatus(req, res, next) {
  try {
    const { status, reviewedBy } = req.body
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required.' })
    }
    const updated = await dataStore.updateRoleRequest(req.params.id, status, reviewedBy || 'Administrator')
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Role request not found.' })
    }
    return res.json({ success: true, request: updated })
  } catch (err) {
    next(err)
  }
}
