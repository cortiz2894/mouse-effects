'use client'

import { Leva } from 'leva'
import { Youtube, Github } from 'lucide-react'
import Link from 'next/link'

const YOUTUBE_URL = 'https://youtube.com/@laserdrift'
const GITHUB_URL = 'https://github.com/cortiz2894/mouse-effects'

const LevaControls = () => {
  

  return (
    <>
      {/* Floating Action Buttons */}
      <div className="fixed bottom-24 right-6 z-[60] flex flex-col gap-3 items-end justify-end">
        {/* YouTube Tutorial */}
        <Link
          href={YOUTUBE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-full
            bg-white/10 backdrop-blur-md border border-white/20
            text-white/60 hover:bg-red-500/20 hover:border-red-500/30 hover:text-white
            transition-all duration-200 group"
          aria-label="Watch tutorial on YouTube"
        >
          <Youtube size={16} className="group-hover:text-red-400 transition-colors" />
          <span className="text-xs uppercase font-medium">Tutorial</span>
        </Link>

        {/* GitHub Source */}
        <Link
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-full
            bg-white/10 backdrop-blur-md border border-white/20
            text-white/60 hover:bg-white/20 hover:border-white/30 hover:text-white
            transition-all duration-200"
          aria-label="View source code on GitHub"
        >
          <Github size={16} />
          <span className="text-xs uppercase font-medium">Source Code</span>
        </Link>
      </div>

      {/* Leva Panel */}
      <Leva
        hidden={false}
        collapsed={false}
        flat={true}
        titleBar={false}
        theme={{
          colors: {
            elevation1: 'rgba(0, 0, 0, 0.8)',
            elevation2: 'rgba(20, 20, 20, 0.9)',
            elevation3: 'rgba(30, 30, 30, 0.9)',
            accent1: 'rgba(255, 255, 255, 0.8)',
            accent2: 'rgba(255, 255, 255, 0.6)',
            accent3: 'rgba(255, 255, 255, 0.4)',
            highlight1: 'rgba(255, 255, 255, 0.1)',
            highlight2: 'rgba(255, 255, 255, 0.15)',
            highlight3: 'rgba(255, 255, 255, 0.05)',
            vivid1: 'rgba(255, 255, 255, 0.9)',
            folderWidgetColor: 'rgba(255, 255, 255, 0.5)',
            folderTextColor: 'rgba(255, 255, 255, 0.8)',
            toolTipBackground: 'rgba(0, 0, 0, 0.9)',
            toolTipText: 'rgba(255, 255, 255, 0.8)',
          },
          radii: {
            xs: '4px',
            sm: '6px',
            lg: '10px',
          },
          space: {
            xs: '4px',
            sm: '8px',
            md: '12px',
            rowGap: '8px',
            colGap: '8px',
          },
          fonts: {
            mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
            sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          },
          fontSizes: {
            root: '11px',
            toolTip: '10px',
          },
          sizes: {
            rootWidth: '380px',
            controlWidth: '160px',
            scrubberWidth: '10px',
            scrubberHeight: '16px',
            rowHeight: '28px',
            folderTitleHeight: '28px',
            checkboxSize: '14px',
            joystickWidth: '100px',
            joystickHeight: '100px',
            colorPickerWidth: '160px',
            colorPickerHeight: '100px',
            monitorHeight: '60px',
            titleBarHeight: '0px',
          },
          borderWidths: {
            root: '1px',
            input: '1px',
            focus: '1px',
            hover: '1px',
            active: '1px',
            folder: '1px',
          },
          fontWeights: {
            label: 'normal',
            folder: '500',
            button: '500',
          },
        }}
      />

      <style jsx global>{`
        .leva-c-kWgxhW {
          top: 80px !important;
          right: 16px !important;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3) !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4) !important;
        }

        .leva-c-hwBXYF {
          background: transparent !important;
        }

        /* Folder titles */
        .leva-c-dmsJDs {
          color: rgba(255, 255, 255, 0.7) !important;
          font-size: 10px !important;
          letter-spacing: 0.05em !important;
          text-transform: uppercase !important;
        }

        /* Input backgrounds */
        .leva-c-fOioiK,
        .leva-c-ghmMDy {
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        .leva-c-fOioiK:hover,
        .leva-c-ghmMDy:hover {
          background: rgba(255, 255, 255, 0.1) !important;
        }

        /* Labels */
        .leva-c-bduBLq {
          color: rgba(255, 255, 255, 0.5) !important;
        }

        /* Number inputs */
        .leva-c-iLvoBD {
          color: rgba(255, 255, 255, 0.8) !important;
        }

        /* Slider track */
        .leva-c-gIiawV {
          background: rgba(255, 255, 255, 0.1) !important;
        }

        /* Slider fill */
        .leva-c-jKwuOp {
          background: rgba(255, 255, 255, 0.4) !important;
        }

        /* Scrubber */
        .leva-c-bHmYqY {
          background: rgba(255, 255, 255, 0.8) !important;
        }
      `}</style>
    </>
  )
}

export default LevaControls
