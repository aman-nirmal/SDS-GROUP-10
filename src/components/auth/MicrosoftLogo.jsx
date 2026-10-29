import React from 'react'

export function MicrosoftLogo({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 1H10V10H1V1Z" fill="#F25022" />
      <path d="M11 1H20V10H11V1Z" fill="#7FBA00" />
      <path d="M1 11H10V20H1V11Z" fill="#00A4EF" />
      <path d="M11 11H20V20H11V11Z" fill="#FFB900" />
    </svg>
  )
}

export function OutlookLogo({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14.5 3H21.5C22.0523 3 22.5 3.44772 22.5 4V20C22.5 20.5523 22.0523 21 21.5 21H14.5V3Z" fill="#0078D4" />
      <path d="M14.5 12L22.5 7V17L14.5 12Z" fill="#005A9E" />
      <path d="M1.5 6C1.5 4.89543 2.39543 4 3.5 4H14.5V20H3.5C2.39543 20 1.5 19.1046 1.5 18V6Z" fill="#0078D4" />
      <circle cx="8" cy="12" r="3.5" fill="white" />
      <circle cx="8" cy="12" r="2" fill="#0078D4" />
    </svg>
  )
}

export default MicrosoftLogo
