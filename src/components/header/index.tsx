'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
  { href: '/', label: 'Water Distortion' },
  { href: '/image-follow-cursor', label: 'Image Follow' },
  { href: '/mask-cursor', label: 'Mask Reveal' },
]

const Header = () => {
  const pathname = usePathname()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 md:px-10 py-5 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
      <Link
        href="/"
        className="text-white font-semibold text-sm tracking-wider hover:opacity-80 transition-opacity"
      >
        MOUSE EFFECTS
      </Link>

      <nav className="flex items-center gap-1 md:gap-2">
        {navLinks.map(({ href, label }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`
                px-3 py-1.5 rounded-full text-xs font-medium transition-all
                ${isActive
                  ? 'bg-white/20 text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/10'
                }
              `}
            >
              {label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}

export default Header
