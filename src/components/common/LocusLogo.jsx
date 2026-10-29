import React from 'react'

// Official LOCUS Logo Component
export default function LocusLogo({ size = 'default' }) {
  const isSmall = size === 'small'
  return (
    <div className="flex items-center cursor-pointer select-none">
      <img
        src="/logo.png"
        alt="LOCUS - COEP Venue Booking System"
        className={`${isSmall ? 'h-10' : 'h-12 sm:h-14'} w-auto object-contain`}
      />
    </div>
  )
}
