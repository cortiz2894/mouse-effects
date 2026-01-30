"use client"

import { useRef, useMemo, useEffect } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

// ============================================
// SHADERS FOR FLUID SIMULATION (PING-PONG)
// ============================================

const quadVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

// Fluid simulation with ripple injection
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

      float ripple = smoothstep(uRadius, 0.0, dist);
      ripple = pow(ripple, 2.0);

      // Trail effect
      vec2 prevMousePos = uPrevMouse;
      for(float i = 0.0; i < 8.0; i++) {
        float t = i / 8.0;
        vec2 trailPos = mix(prevMousePos, mousePos, t);
        float d = distance(vUv, trailPos);
        float trailRipple = smoothstep(uRadius * 0.7, 0.0, d);
        ripple = max(ripple, pow(trailRipple, 2.0));
      }

      float finalRipple = ripple * uIntensity * min(uMouseVelocity * 10.0, 1.0);
      wave += finalRipple;
    }

    gl_FragColor = vec4(wave, wave, wave, 1.0);
  }
`

// ============================================
// SHADER FOR LIQUID MASK REVEAL
// ============================================

const maskVertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const maskFragmentShader = `
  uniform sampler2D uBaseTexture;
  uniform sampler2D uRevealTexture;
  uniform sampler2D uDisplacement;
  uniform float uDistortionStrength;
  uniform float uRevealSize;
  uniform float uEdgeSoftness;
  uniform float uLightIntensity;
  uniform float uSpecularPower;
  uniform vec2 uResolution;
  uniform float uBaseImageAspect;
  uniform float uRevealImageAspect;
  uniform float uPlaneAspect;

  varying vec2 vUv;

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
    // Get displacement value for mask
    float displacement = texture2D(uDisplacement, vUv).r;

    // Calculate normal for distortion and lighting
    vec3 normal = calculateNormal(vUv, 50.0);
    float normalDeviation = length(normal.xy);

    // Liquid distortion offset
    vec2 distortion = normal.xy * uDistortionStrength;

    // Apply aspect ratio correction
    vec2 baseUv = coverUv(vUv + distortion, uBaseImageAspect, uPlaneAspect);
    vec2 revealUv = coverUv(vUv + distortion, uRevealImageAspect, uPlaneAspect);

    // Clamp UVs
    baseUv = clamp(baseUv, 0.001, 0.999);
    revealUv = clamp(revealUv, 0.001, 0.999);

    // Sample both textures
    vec4 baseColor = texture2D(uBaseTexture, baseUv);
    vec4 revealColor = texture2D(uRevealTexture, revealUv);

    // Create mask from displacement with adjustable size and softness
    float mask = displacement * uRevealSize;
    mask = smoothstep(0.0, uEdgeSoftness, mask);
    mask = clamp(mask, 0.0, 1.0);

    // Mix between base and reveal based on mask
    vec3 color = mix(baseColor.rgb, revealColor.rgb, mask);

    // Add liquid highlights only on the distorted areas
    float rippleMask = smoothstep(0.01, 0.1, normalDeviation);

    vec3 lightDir = normalize(vec3(0.5, 0.5, 1.0));
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    vec3 halfDir = normalize(lightDir + viewDir);

    float specular = pow(max(dot(normal, halfDir), 0.0), uSpecularPower);
    specular *= uLightIntensity * rippleMask;

    color += vec3(specular);

    // Fresnel edge glow
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.0);
    color += vec3(fresnel * uLightIntensity * 0.15 * rippleMask);

    gl_FragColor = vec4(color, 1.0);
  }
`

// ============================================
// EFFECT SETTINGS INTERFACE
// ============================================

export interface MaskCursorSettings {
  intensity: number
  scale: number
  viscosity: number
  decay: number
  distortionStrength: number
  revealSize: number
  edgeSoftness: number
  lightIntensity: number
  specularPower: number
}

// ============================================
// MAIN COMPONENT
// ============================================

export function MaskCursorEffect({
  baseImage,
  revealImage,
  settings
}: {
  baseImage: string
  revealImage: string
  settings: MaskCursorSettings
}) {
  const { gl, viewport, size } = useThree()
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const prevMouseRef = useRef({ x: 0.5, y: 0.5 })
  const mouseVelocityRef = useRef(0)

  const RESOLUTION = 512

  // Ping-pong render targets
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

  const pingPongRef = useRef(0)

  // Offscreen scene for fluid simulation
  const quadGeometry = useMemo(() => new THREE.PlaneGeometry(2, 2), [])
  const offscreenScene = useMemo(() => new THREE.Scene(), [])
  const offscreenCamera = useMemo(() => {
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    return cam
  }, [])

  // Fluid update material
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
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uPrevMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uRadius: { value: settings.scale },
        uIntensity: { value: settings.intensity },
        uMouseVelocity: { value: 0 },
      },
    })
  }, [])

  const quadMeshRef = useRef<THREE.Mesh | null>(null)

  // Clear render targets on mount to avoid residual data from previous effects
  useEffect(() => {
    renderTargets.forEach(rt => {
      gl.setRenderTarget(rt)
      gl.clearColor()
    })
    gl.setRenderTarget(null)
  }, [gl, renderTargets])

  useEffect(() => {
    const mesh = new THREE.Mesh(quadGeometry, fluidUpdateMaterial)
    quadMeshRef.current = mesh
    offscreenScene.add(mesh)

    return () => {
      offscreenScene.remove(mesh)
    }
  }, [quadGeometry, fluidUpdateMaterial, offscreenScene])

  // Track image aspect ratios
  const baseImageAspectRef = useRef(1)
  const revealImageAspectRef = useRef(1)

  // Load textures
  const textures = useMemo(() => {
    const loader = new THREE.TextureLoader()

    const baseTex = loader.load(baseImage, (tex) => {
      const img = tex.image as HTMLImageElement
      if (img) baseImageAspectRef.current = img.naturalWidth / img.naturalHeight
    })
    baseTex.minFilter = THREE.LinearFilter
    baseTex.magFilter = THREE.LinearFilter

    const revealTex = loader.load(revealImage, (tex) => {
      const img = tex.image as HTMLImageElement
      if (img) revealImageAspectRef.current = img.naturalWidth / img.naturalHeight
    })
    revealTex.minFilter = THREE.LinearFilter
    revealTex.magFilter = THREE.LinearFilter

    return { base: baseTex, reveal: revealTex }
  }, [baseImage, revealImage])

  // Main material for the mask effect
  const maskMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: maskVertexShader,
      fragmentShader: maskFragmentShader,
      uniforms: {
        uBaseTexture: { value: textures.base },
        uRevealTexture: { value: textures.reveal },
        uDisplacement: { value: renderTargets[0].texture },
        uDistortionStrength: { value: settings.distortionStrength },
        uRevealSize: { value: settings.revealSize },
        uEdgeSoftness: { value: settings.edgeSoftness },
        uLightIntensity: { value: settings.lightIntensity },
        uSpecularPower: { value: settings.specularPower },
        uResolution: { value: new THREE.Vector2(RESOLUTION, RESOLUTION) },
        uBaseImageAspect: { value: baseImageAspectRef.current },
        uRevealImageAspect: { value: revealImageAspectRef.current },
        uPlaneAspect: { value: 1 },
      },
    })
  }, [textures, renderTargets])

  // Track mouse
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

  // Calculate plane size to fill viewport
  const planeSize = useMemo(() => {
    return {
      width: viewport.width,
      height: viewport.height,
      aspect: viewport.width / viewport.height
    }
  }, [viewport.width, viewport.height])

  // Animation loop
  useFrame(() => {
    if (!quadMeshRef.current) return

    // Calculate mouse velocity
    const dx = mouseRef.current.x - prevMouseRef.current.x
    const dy = mouseRef.current.y - prevMouseRef.current.y
    const velocity = Math.sqrt(dx * dx + dy * dy)
    mouseVelocityRef.current = velocity

    // Update fluid uniforms
    fluidUpdateMaterial.uniforms.uViscosity.value = settings.viscosity
    fluidUpdateMaterial.uniforms.uDecay.value = settings.decay
    fluidUpdateMaterial.uniforms.uRadius.value = settings.scale
    fluidUpdateMaterial.uniforms.uIntensity.value = settings.intensity
    fluidUpdateMaterial.uniforms.uMouse.value.set(mouseRef.current.x, mouseRef.current.y)
    fluidUpdateMaterial.uniforms.uPrevMouse.value.set(prevMouseRef.current.x, prevMouseRef.current.y)
    fluidUpdateMaterial.uniforms.uMouseVelocity.value = velocity

    // Ping-pong indices
    const current = pingPongRef.current
    const prev = (current + 2) % 3
    const next = (current + 1) % 3

    // Update fluid simulation
    fluidUpdateMaterial.uniforms.uPrevState.value = renderTargets[prev].texture
    fluidUpdateMaterial.uniforms.uCurrentState.value = renderTargets[current].texture

    quadMeshRef.current.material = fluidUpdateMaterial

    gl.setRenderTarget(renderTargets[next])
    gl.render(offscreenScene, offscreenCamera)
    gl.setRenderTarget(null)

    // Update mask material
    maskMaterial.uniforms.uDisplacement.value = renderTargets[next].texture
    maskMaterial.uniforms.uDistortionStrength.value = settings.distortionStrength
    maskMaterial.uniforms.uRevealSize.value = settings.revealSize
    maskMaterial.uniforms.uEdgeSoftness.value = settings.edgeSoftness
    maskMaterial.uniforms.uLightIntensity.value = settings.lightIntensity
    maskMaterial.uniforms.uSpecularPower.value = settings.specularPower
    maskMaterial.uniforms.uBaseImageAspect.value = baseImageAspectRef.current
    maskMaterial.uniforms.uRevealImageAspect.value = revealImageAspectRef.current
    maskMaterial.uniforms.uPlaneAspect.value = planeSize.aspect

    // Advance ping-pong
    pingPongRef.current = next

    // Store previous mouse
    prevMouseRef.current.x = mouseRef.current.x
    prevMouseRef.current.y = mouseRef.current.y
  })

  // Cleanup
  useEffect(() => {
    return () => {
      renderTargets.forEach(rt => rt.dispose())
      quadGeometry.dispose()
      fluidUpdateMaterial.dispose()
      maskMaterial.dispose()
      textures.base.dispose()
      textures.reveal.dispose()
    }
  }, [])

  return (
    <mesh>
      <planeGeometry args={[planeSize.width, planeSize.height, 1, 1]} />
      <primitive object={maskMaterial} attach="material" />
    </mesh>
  )
}

export default MaskCursorEffect
