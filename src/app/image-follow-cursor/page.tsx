"use client"

import { useRef } from "react"
import { useControls, folder } from "leva"
import CursorImageEffect from "@/components/image-follow-cursor"
import PageHeader from "@/components/page-header"

const images = ["/follow-cursor/img-1.png", "/follow-cursor/img-2.png", "/follow-cursor/img-3.png", "/follow-cursor/img-4.png", "/follow-cursor/img-5.png", "/follow-cursor/img-6.png", "/follow-cursor/img-7.png"]

export default function ImageFollowCursorPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const excludeRef = useRef<HTMLDivElement>(null)

  const settings = useControls("Image Follow", {
    Effect: folder({
      imageWidth: { value: 190, min: 50, max: 400, step: 10 },
      imageHeight: { value: 190, min: 50, max: 400, step: 10 },
      minDistance: { value: 125, min: 50, max: 300, step: 10 },
    }, { collapsed: true }),
  })

  return (
    <main
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden"
    >
      <CursorImageEffect
        triggerRef={containerRef as React.RefObject<HTMLElement>}
        excludeRef={excludeRef as React.RefObject<HTMLElement>}
        images={images}
        imageWidth={settings.imageWidth}
        imageHeight={settings.imageHeight}
        minDistance={settings.minDistance}
      />

      {/* Overlay UI */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center">
        <div ref={excludeRef} className="pointer-events-auto">
          <PageHeader
            title="Image Follow Cursor"
            subtitle="Move your cursor around the screen"
          />
        </div>
      </div>
    </main>
  )
}
