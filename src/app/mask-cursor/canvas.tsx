"use client"

import { Canvas } from "@react-three/fiber"
import { MaskCursorEffect, type MaskCursorSettings } from "@/components/mask-cursor"

interface MaskCursorCanvasProps {
  baseImage: string
  revealImage: string
  settings: MaskCursorSettings
}

export function MaskCursorCanvas({ baseImage, revealImage, settings }: MaskCursorCanvasProps) {
  return (
    <div className="w-full h-screen">
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
        <MaskCursorEffect
          baseImage={baseImage}
          revealImage={revealImage}
          settings={settings}
        />
      </Canvas>
    </div>
  )
}
