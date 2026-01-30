"use client"

import { useRef, useMemo, useEffect } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

// ============================================
// SHADERS FOR FLUID SIMULATION (PING-PONG)
// ============================================

// Vertex shader for fullscreen quad
const quadVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

// Fragment shader for fluid simulation with ripple injection
const fluidUpdateShader = `
  uniform sampler2D uPrevState;
  uniform sampler2D uCurrentState;
  uniform vec2 uResolution;
  uniform float uViscosity;
  uniform float uDecay;

  // Ripple uniforms
  uniform vec2 uMouse;
  uniform vec2 uPrevMouse;
  uniform float uRadius;
  uniform float uIntensity;
  uniform float uMouseVelocity;

  varying vec2 vUv;

  void main() {
    vec2 texel = 1.0 / uResolution;

    // Sample neighboring pixels for wave propagation
    float current = texture2D(uCurrentState, vUv).r;
    float prev = texture2D(uPrevState, vUv).r;

    float left = texture2D(uCurrentState, vUv + vec2(-texel.x, 0.0)).r;
    float right = texture2D(uCurrentState, vUv + vec2(texel.x, 0.0)).r;
    float top = texture2D(uCurrentState, vUv + vec2(0.0, texel.y)).r;
    float bottom = texture2D(uCurrentState, vUv + vec2(0.0, -texel.y)).r;

    // Wave equation with viscosity
    float neighbors = (left + right + top + bottom) * 0.25;
    float wave = neighbors * 2.0 - prev;
    wave = mix(current, wave, uViscosity);
    wave *= uDecay;

    // Add ripple at mouse position
    if (uMouseVelocity > 0.0001) {
      vec2 mousePos = uMouse;
      float dist = distance(vUv, mousePos);

      // Create soft circular ripple
      float ripple = smoothstep(uRadius, 0.0, dist);
      ripple = pow(ripple, 2.0);

      // Trail effect - sample along path from prev to current mouse
      vec2 prevMousePos = uPrevMouse;
      for(float i = 0.0; i < 8.0; i++) {
        float t = i / 8.0;
        vec2 trailPos = mix(prevMousePos, mousePos, t);
        float d = distance(vUv, trailPos);
        float trailRipple = smoothstep(uRadius * 0.7, 0.0, d);
        ripple = max(ripple, pow(trailRipple, 2.0));
      }

      // Add ripple with velocity-based intensity
      float finalRipple = ripple * uIntensity * min(uMouseVelocity * 10.0, 1.0);
      wave += finalRipple;
    }

    gl_FragColor = vec4(wave, wave, wave, 1.0);
  }
`

// ============================================
// SHADERS FOR IMAGE RENDERING WITH WATER EFFECT
// ============================================

const imageVertexShader = `
  varying vec2 vUv;
  varying vec2 vScreenUv;
  uniform vec2 uViewportSize;

  void main() {
    vUv = uv;

    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vScreenUv = (worldPos.xy + uViewportSize * 0.5) / uViewportSize;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const imageFragmentShader = `
  uniform sampler2D uTexture;
  uniform sampler2D uDisplacement;
  uniform float uDistortionStrength;
  uniform float uAberration;
  uniform float uLightIntensity;
  uniform float uSpecularPower;
  uniform vec2 uResolution;
  uniform float uImageAspect;
  uniform float uPlaneAspect;

  varying vec2 vUv;
  varying vec2 vScreenUv;

  // Cover fit - maintains aspect ratio while filling the plane
  vec2 coverUv(vec2 uv, float imageAspect, float planeAspect) {
    vec2 ratio = vec2(
      min(planeAspect / imageAspect, 1.0),
      min(imageAspect / planeAspect, 1.0)
    );
    return vec2(
      uv.x * ratio.x + (1.0 - ratio.x) * 0.5,
      uv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );
  }

  vec3 calculateNormal(vec2 uv, float strength) {
    vec2 texel = 1.0 / uResolution;

    float left = texture2D(uDisplacement, uv + vec2(-texel.x, 0.0)).r;
    float right = texture2D(uDisplacement, uv + vec2(texel.x, 0.0)).r;
    float top = texture2D(uDisplacement, uv + vec2(0.0, texel.y)).r;
    float bottom = texture2D(uDisplacement, uv + vec2(0.0, -texel.y)).r;

    vec3 normal;
    normal.x = (left - right) * strength;
    normal.y = (bottom - top) * strength;
    normal.z = 1.0;

    return normalize(normal);
  }

  void main() {
    // Apply aspect ratio correction (cover fit)
    vec2 coveredUv = coverUv(vUv, uImageAspect, uPlaneAspect);

    // Get displacement value
    float displacement = texture2D(uDisplacement, vScreenUv).r;

    // Calculate normal for lighting and refraction
    vec3 normal = calculateNormal(vScreenUv, 50.0);

    // Calculate how much the normal deviates from flat (used to mask lighting)
    float normalDeviation = length(normal.xy);

    // Refraction-based distortion using normal
    vec2 refraction = normal.xy * uDistortionStrength;
    vec2 distortedUv = coveredUv + refraction;

    // Clamp UVs
    distortedUv = clamp(distortedUv, 0.001, 0.999);

    // Chromatic aberration based on displacement
    float aberrationAmount = uAberration * (abs(normal.x) + abs(normal.y));

    vec4 colorR = texture2D(uTexture, distortedUv + vec2(aberrationAmount, 0.0));
    vec4 colorG = texture2D(uTexture, distortedUv);
    vec4 colorB = texture2D(uTexture, distortedUv - vec2(aberrationAmount, 0.0));

    vec3 color = vec3(colorR.r, colorG.g, colorB.b);

    // Only apply lighting where there are actual ripples (normal deviation > 0)
    // Use smoothstep to create a soft threshold
    float rippleMask = smoothstep(0.01, 0.1, normalDeviation);

    // Specular lighting (water highlights) - only on ripples
    vec3 lightDir = normalize(vec3(0.5, 0.5, 1.0));
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    vec3 halfDir = normalize(lightDir + viewDir);

    float specular = pow(max(dot(normal, halfDir), 0.0), uSpecularPower);
    specular *= uLightIntensity * rippleMask;

    // Add specular highlight only on ripples
    color += vec3(specular);

    // Subtle fresnel effect - only on ripples
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.0);
    color += vec3(fresnel * uLightIntensity * 0.1 * rippleMask);

    gl_FragColor = vec4(color, 1.0);
  }
`

// ============================================
// EFFECT SETTINGS INTERFACE
// ============================================

interface EffectSettings {
  intensity: number
  scale: number
  viscosity: number
  decay: number
  distortionStrength: number
  aberration: number
  lightIntensity: number
  specularPower: number
}

// ============================================
// MAIN COMPONENT
// ============================================

export function RippleEffect({
  images,
  settings
}: {
  images: string[]
  settings: EffectSettings
}) {
  const { gl, viewport, size } = useThree()
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const prevMouseRef = useRef({ x: 0.5, y: 0.5 })
  const mouseVelocityRef = useRef(0)

  // Resolution for fluid simulation
  const RESOLUTION = 512

  // Ping-pong render targets for fluid simulation
  const renderTargets = useMemo(() => {
    const options = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
    }
    return [
      new THREE.WebGLRenderTarget(RESOLUTION, RESOLUTION, options),
      new THREE.WebGLRenderTarget(RESOLUTION, RESOLUTION, options),
      new THREE.WebGLRenderTarget(RESOLUTION, RESOLUTION, options),
    ]
  }, [])

  // Index for ping-pong
  const pingPongRef = useRef(0)

  // Fullscreen quad for fluid simulation
  const quadGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(2, 2)
    return geo
  }, [])

  // Scene and camera for off-screen rendering
  const offscreenScene = useMemo(() => new THREE.Scene(), [])
  const offscreenCamera = useMemo(() => {
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    return cam
  }, [])

  // Material for fluid update (includes ripple injection)
  const fluidUpdateMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: quadVertexShader,
      fragmentShader: fluidUpdateShader,
      uniforms: {
        uPrevState: { value: null },
        uCurrentState: { value: null },
        uResolution: { value: new THREE.Vector2(RESOLUTION, RESOLUTION) },
        uViscosity: { value: settings.viscosity },
        uDecay: { value: settings.decay },
        // Ripple uniforms
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uPrevMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uRadius: { value: settings.scale },
        uIntensity: { value: settings.intensity },
        uMouseVelocity: { value: 0 },
      },
    })
  }, [])

  // Quad mesh reference
  const quadMeshRef = useRef<THREE.Mesh | null>(null)

  // Setup quad mesh
  useEffect(() => {
    const mesh = new THREE.Mesh(quadGeometry, fluidUpdateMaterial)
    quadMeshRef.current = mesh
    offscreenScene.add(mesh)

    return () => {
      offscreenScene.remove(mesh)
    }
  }, [quadGeometry, fluidUpdateMaterial, offscreenScene])

  // Track image aspect ratios
  const imageAspectsRef = useRef<number[]>(images.map(() => 1))

  // Load textures and get their aspect ratios
  const textures = useMemo(() => {
    const loader = new THREE.TextureLoader()
    return images.map((src, index) => {
      const tex = loader.load(src, (loadedTex) => {
        // Get image dimensions when loaded
        const image = loadedTex.image as HTMLImageElement
        if (image) {
          imageAspectsRef.current[index] = image.naturalWidth / image.naturalHeight
        }
      })
      tex.minFilter = THREE.LinearFilter
      tex.magFilter = THREE.LinearFilter
      return tex
    })
  }, [images])

  // Create image materials
  const imageMaterials = useMemo(() => {
    return textures.map(
      (texture, index) =>
        new THREE.ShaderMaterial({
          vertexShader: imageVertexShader,
          fragmentShader: imageFragmentShader,
          uniforms: {
            uTexture: { value: texture },
            uDisplacement: { value: renderTargets[0].texture },
            uViewportSize: { value: new THREE.Vector2(viewport.width, viewport.height) },
            uDistortionStrength: { value: settings.distortionStrength },
            uAberration: { value: settings.aberration },
            uLightIntensity: { value: settings.lightIntensity },
            uSpecularPower: { value: settings.specularPower },
            uResolution: { value: new THREE.Vector2(RESOLUTION, RESOLUTION) },
            uImageAspect: { value: imageAspectsRef.current[index] },
            uPlaneAspect: { value: 1.0 },
          },
        })
    )
  }, [textures, renderTargets, viewport.width, viewport.height])

  // Track mouse movement (normalized 0-1)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX / window.innerWidth
      mouseRef.current.y = 1.0 - e.clientY / window.innerHeight
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0]
        mouseRef.current.x = touch.clientX / window.innerWidth
        mouseRef.current.y = 1.0 - touch.clientY / window.innerHeight
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("touchmove", handleTouchMove)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("touchmove", handleTouchMove)
    }
  }, [])

  // Calculate image layout (moved before useFrame so it's available)
  const imageLayout = useMemo(() => {
    const isMobile = size.width < 768

    if (isMobile) {
      const imageSize = Math.min(viewport.width * 0.85, viewport.height * 0.28)
      const gap = 0.25
      const totalHeight = imageSize * 3 + gap * 2
      const startY = totalHeight / 2 - imageSize / 2

      return images.map((_, i) => ({
        position: [0, startY - i * (imageSize + gap), 0] as [number, number, number],
        size: [imageSize, imageSize] as [number, number],
      }))
    }

    const gap = 0.35
    const maxImageSize = (viewport.width - gap * 4) / 3
    const imageSize = Math.min(maxImageSize, viewport.height * 0.7)
    const totalWidth = imageSize * 3 + gap * 2
    const startX = -totalWidth / 2 + imageSize / 2

    return images.map((_, i) => ({
      position: [startX + i * (imageSize + gap), 0, 0] as [number, number, number],
      size: [imageSize, imageSize] as [number, number],
    }))
  }, [viewport, images, size.width])

  // Main animation loop
  useFrame(() => {
    if (!quadMeshRef.current) return

    // Calculate mouse velocity
    const dx = mouseRef.current.x - prevMouseRef.current.x
    const dy = mouseRef.current.y - prevMouseRef.current.y
    const velocity = Math.sqrt(dx * dx + dy * dy)
    mouseVelocityRef.current = velocity

    // Update all uniforms
    fluidUpdateMaterial.uniforms.uViscosity.value = settings.viscosity
    fluidUpdateMaterial.uniforms.uDecay.value = settings.decay
    fluidUpdateMaterial.uniforms.uRadius.value = settings.scale
    fluidUpdateMaterial.uniforms.uIntensity.value = settings.intensity
    fluidUpdateMaterial.uniforms.uMouse.value.set(mouseRef.current.x, mouseRef.current.y)
    fluidUpdateMaterial.uniforms.uPrevMouse.value.set(prevMouseRef.current.x, prevMouseRef.current.y)
    fluidUpdateMaterial.uniforms.uMouseVelocity.value = velocity

    // Current ping-pong indices
    const current = pingPongRef.current
    const prev = (current + 2) % 3
    const next = (current + 1) % 3

    // Update fluid simulation (includes ripple injection)
    fluidUpdateMaterial.uniforms.uPrevState.value = renderTargets[prev].texture
    fluidUpdateMaterial.uniforms.uCurrentState.value = renderTargets[current].texture

    quadMeshRef.current.material = fluidUpdateMaterial

    gl.setRenderTarget(renderTargets[next])
    gl.render(offscreenScene, offscreenCamera)
    gl.setRenderTarget(null)

    // Update image materials with new displacement and aspect ratios
    imageMaterials.forEach((mat, index) => {
      mat.uniforms.uDisplacement.value = renderTargets[next].texture
      mat.uniforms.uViewportSize.value.set(viewport.width, viewport.height)
      mat.uniforms.uDistortionStrength.value = settings.distortionStrength
      mat.uniforms.uAberration.value = settings.aberration
      mat.uniforms.uLightIntensity.value = settings.lightIntensity
      mat.uniforms.uSpecularPower.value = settings.specularPower
      // Update aspect ratios
      mat.uniforms.uImageAspect.value = imageAspectsRef.current[index]
      const planeSize = imageLayout[index]?.size
      if (planeSize) {
        mat.uniforms.uPlaneAspect.value = planeSize[0] / planeSize[1]
      }
    })

    // Advance ping-pong
    pingPongRef.current = next

    // Store previous mouse position
    prevMouseRef.current.x = mouseRef.current.x
    prevMouseRef.current.y = mouseRef.current.y
  })

  // Cleanup
  useEffect(() => {
    return () => {
      renderTargets.forEach(rt => rt.dispose())
      quadGeometry.dispose()
      fluidUpdateMaterial.dispose()
      imageMaterials.forEach(mat => mat.dispose())
      textures.forEach(tex => tex.dispose())
    }
  }, [])

  return (
    <>
      {imageMaterials.map((material, i) => (
        <mesh key={i} position={imageLayout[i].position}>
          <planeGeometry args={[imageLayout[i].size[0], imageLayout[i].size[1], 1, 1]} />
          <primitive object={material} attach="material" />
        </mesh>
      ))}
    </>
  )
}
