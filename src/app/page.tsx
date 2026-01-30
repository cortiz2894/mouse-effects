"use client"

import dynamic from "next/dynamic"
import { useControls, folder } from "leva"

// Dynamically import the canvas component to avoid SSR issues with Three.js
const WaterDistortionCanvas = dynamic(
  () => import("@/components/water-distortion/water-distortion-canvas").then((mod) => mod.WaterDistortionCanvas),
  { ssr: false }
)

const images = ["/art-1.png", "/art-2.jpg", "/art-3.jpg"]

export default function Home() {
  const settings = useControls({
    Ripple: folder({
      intensity: { value: 0.64, min: 0, max: 1, step: 0.01 },
      scale: { value: 0.05, min: 0.05, max: 0.8, step: 0.01 },
      viscosity: { value: 0.89, min: 0.5, max: 0.99, step: 0.01 },
      decay: { value: 0.98, min: 0.8, max: 0.99, step: 0.01 },
    }),
    Distortion: folder({
      distortionStrength: { value: 0.04, min: 0, max: 0.1, step: 0.001 },
      aberration: { value: 0.003, min: 0, max: 0.02, step: 0.001 },
    }),
    Lighting: folder({
      lightIntensity: { value: 0.25, min: 0, max: 1, step: 0.01 },
      specularPower: { value: 8.1, min: 1, max: 10, step: 0.1 },
    }),
  })

  return (
    <main className="relative w-full h-screen overflow-hidden">
      <WaterDistortionCanvas images={images} settings={settings} />

      {/* Overlay UI */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between py-10">
        <header className="text-center">
          <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">
            Water Ripple Distortion
          </h1>
          <p className="mt-2 text-white/50 text-sm">
            Move your cursor over the images
          </p>
        </header>

        <footer className="text-white/30 text-xs">
          WebGL Shader Effect
        </footer>
      </div>
    </main>
  )
}
