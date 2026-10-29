import React, { useState, useEffect } from 'react'

// 2-Frame Animated Flying Birds Component (Swaps bird1.png and bird2.png)
export default function FlyingBirds() {
  const [frame, setFrame] = useState(1)

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => (prev === 1 ? 2 : 1))
    }, 340) // natural wing-beat tempo
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="animate-birds-flight w-14 sm:w-16 lg:w-18 pointer-events-none select-none z-10">
      <img
        src={frame === 1 ? '/bird1.png' : '/bird2.png'}
        alt="Flying Birds"
        className="w-full h-auto object-contain"
      />
    </div>
  )
}
