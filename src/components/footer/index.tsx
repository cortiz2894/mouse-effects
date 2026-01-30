'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Twitter, Instagram, Youtube, Github } from 'lucide-react'

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
  { icon: Github, href: 'https://github.com', label: 'GitHub' },
]

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 px-6 md:px-10 py-5 flex justify-between items-center bg-gradient-to-t from-black/80 to-transparent">
      <div className="flex items-baseline gap-2 text-white/50 text-[11px] font-mono">
        
        <Link
          href="https://cortiz.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-80 transition-opacity"
          aria-label="Visit Cortiz portfolio"
        >
          <Image
            src="/logo-cortiz.svg"
            alt="Cortiz"
            width={50}
            height={20}
            className="opacity-50 hover:opacity-100 transition-opacity"
          />
        </Link>
        <span>{currentYear} </span>
      </div>

      <div className="flex items-center gap-4">
        {socialLinks.map(({ icon: Icon, href, label }) => (
          <Link
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="text-white/50 hover:text-white hover:scale-110 transition-all"
          >
            <Icon size={18} />
          </Link>
        ))}
      </div>
    </footer>
  )
}

export default Footer
