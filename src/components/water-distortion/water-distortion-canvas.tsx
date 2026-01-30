"use client"

import { Canvas } from "@react-three/fiber"
import { RippleEffect } from "./ripple-effect"

export interface EffectSettings {
  intensity: number
  scale: number
  viscosity: number
  decay: number
  distortionStrength: number
  aberration: number
  lightIntensity: number
  specularPower: number
}

interface WaterDistortionCanvasProps {
  images: string[]
  settings: EffectSettings
}

export function WaterDistortionCanvas({ images, settings }: WaterDistortionCanvasProps) {
  return (
    <div className="w-full h-screen bg-black">
      <Canvas
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        camera={{
          position: [0, 0, 5],
          fov: 50,
          near: 0.1,
          far: 100,
        }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#0a0a0a"]} />
        <RippleEffect images={images} settings={settings} />
      </Canvas>
    </div>
  )
}
