"use client"

import dynamic from "next/dynamic"
import { useControls, folder } from "leva"
import PageHeader from "@/components/page-header"

// Dynamic import to avoid SSR issues with Three.js
const MaskCursorCanvas = dynamic(
  () => import("./canvas").then((mod) => mod.MaskCursorCanvas),
  { ssr: false }
)

export default function MaskCursorPage() {
  const settings = useControls("Mask Reveal", {
    Ripple: folder({
      intensity: { value: 0.73, min: 0.5, max: 1, step: 0.01 },
      scale: { value: 0.1, min: 0.05, max: 0.25, step: 0.01 },
      viscosity: { value: 0.59, min: 0.5, max: 0.75, step: 0.01 },
      decay: { value: 0.96, min: 0.8, max: 0.99, step: 0.01 },
    }),
    Mask: folder({
      revealSize: { value: 1.9, min: 0.5, max: 10, step: 0.1 },
      edgeSoftness: { value: 0.1, min: 0.01, max: 1, step: 0.01 },
      distortionStrength: { value: 0.002, min: 0, max: 0.01, step: 0.001 },
    }),
    Lighting: folder({
      lightIntensity: { value: 0, min: 0, max: 0.3, step: 0.01 },
      specularPower: { value: 1, min: 1, max: 10, step: 0.1 },
    }),
  })

  return (
    <main className="relative w-full h-screen overflow-hidden">
      <MaskCursorCanvas
        baseImage="/art-render-final.png"
        revealImage="/art-wire-final.png"
        settings={settings}
      />

      {/* Overlay UI */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center">
        <PageHeader
          title="Liquid Mask Reveal"
          subtitle="Move your cursor to reveal the hidden image"
        />
      </div>
    </main>
  )
}
