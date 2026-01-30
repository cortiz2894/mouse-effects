"use client"

import dynamic from "next/dynamic"
import { useControls, folder } from "leva"
import PageHeader from "@/components/page-header"

// Dynamically import the canvas component to avoid SSR issues with Three.js
const WaterDistortionCanvas = dynamic(
  () => import("@/components/water-distortion/water-distortion-canvas").then((mod) => mod.WaterDistortionCanvas),
  { ssr: false }
)

const images = ["/art-2.jpg", "/art-7.png", "/art-1.png"]

export default function Home() {
  const settings = useControls("Water Distortion", {
    Ripple: folder({
      intensity: { value: 0.24, min: 0, max: 1, step: 0.01 },
      scale: { value: 0.03, min: 0.005, max: 0.1, step: 0.001 },
      viscosity: { value: 0.89, min: 0.5, max: 0.99, step: 0.01 },
      decay: { value: 0.98, min: 0.8, max: 0.99, step: 0.01 },
    }),
    Distortion: folder({
      distortionStrength: { value: 0.04, min: 0, max: 0.1, step: 0.001 },
      aberration: { value: 0.003, min: 0, max: 0.02, step: 0.001 },
    }),
    Lighting: folder({
      lightIntensity: { value: 0.09, min: 0, max: 0.3, step: 0.001 },
      specularPower: { value: 8.1, min: 1, max: 10, step: 0.1 },
    }),
  })

  return (
    <main className="relative w-full h-screen overflow-hidden">
      <WaterDistortionCanvas images={images} settings={settings} />

      {/* Overlay UI */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center">
        <PageHeader
          title="Water Ripple Distortion"
          subtitle="Move your cursor over the images"
        />
      </div>
    </main>
  )
}
