# Mouse Effects

A collection of interactive mouse effects built with Next.js, Three.js, and GSAP. This project showcases creative cursor interactions including water ripple distortions, image trails, and liquid mask reveals.

![Mouse Effects Preview](https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js)
![Three.js](https://img.shields.io/badge/Three.js-0.182-black?style=flat-square&logo=three.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)

## ✨ Effects

### 1. Water Ripple Distortion

A WebGL shader effect that creates realistic water ripples on images as you move your cursor.

https://github.com/user-attachments/assets/fcfb303b-f8a1-4e41-9c84-e98d6f1a0334

**Features:**
- Fluid simulation with ping-pong buffers
- Chromatic aberration
- Specular lighting highlights
- Configurable viscosity and decay

### 2. Image Follow Cursor

An engaging effect where images appear and animate along the cursor path using GSAP.

https://github.com/user-attachments/assets/6d4057c6-64ed-46c2-b8d8-345eada5a14f

**Features:**
- Smooth reveal animations
- Trail effect with multiple images
- Configurable image size and spawn distance
- Exclusion zones support

### 3. Cursor Mask Reveal

A WebGL effect that reveals a hidden image through a liquid distortion mask.

https://github.com/user-attachments/assets/81b7f46b-d52a-415e-9e14-949f6dc79276

**Features:**
- Two-layer image composition
- Fluid-based mask generation
- Adjustable reveal size and edge softness
- Real-time parameter controls

## 🛠 Tech Stack

- **Framework:** Next.js 16.1 (App Router)
- **3D/WebGL:** Three.js, React Three Fiber
- **Animation:** GSAP
- **Styling:** Tailwind CSS 4
- **Controls:** Leva (GUI controls)
- **Icons:** Lucide React
- **Language:** TypeScript

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/cortiz2894/mouse-effects.git

# Navigate to the project
cd mouse-effects

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the effects.

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Water Distortion effect
│   ├── image-follow-cursor/
│   │   └── page.tsx                # Image Follow effect
│   ├── mask-cursor/
│   │   ├── page.tsx                # Mask Reveal effect
│   │   └── canvas.tsx              # Three.js canvas wrapper
│   ├── layout.tsx                  # Root layout with Header/Footer
│   └── globals.css                 # Global styles
├── components/
│   ├── water-distortion/
│   │   ├── ripple-effect.tsx       # WebGL ripple shader
│   │   └── water-distortion-canvas.tsx
│   ├── image-follow-cursor/
│   │   └── index.tsx               # GSAP cursor effect
│   ├── mask-cursor/
│   │   └── index.tsx               # WebGL mask shader
│   ├── header/
│   │   └── index.tsx               # Navigation header
│   ├── footer/
│   │   └── index.tsx               # Footer with social links
│   ├── page-header/
│   │   └── index.tsx               # Reusable page title
│   └── leva-controls/
│       └── index.tsx               # Custom Leva wrapper
└── public/
    └── [images]                    # Effect images
```

## ⚙️ Configuration

Each effect has real-time controls powered by Leva. Click the control buttons in the bottom-right corner to adjust:

### Water Distortion
- **Ripple:** intensity, scale, viscosity, decay
- **Distortion:** strength, chromatic aberration
- **Lighting:** intensity, specular power

### Image Follow
- **Effect:** image width, height, minimum distance

### Mask Reveal
- **Ripple:** intensity, scale, viscosity, decay
- **Mask:** reveal size, edge softness, distortion
- **Lighting:** intensity, specular power

## 📜 Scripts

```bash
pnpm dev      # Start development server
pnpm build    # Build for production
pnpm start    # Start production server
pnpm lint     # Run ESLint
```

## 🎨 Customization

### Adding Your Own Images

Place your images in the `public/` folder and update the image paths in each page:

```tsx
// src/app/page.tsx
const images = ["/your-image-1.jpg", "/your-image-2.jpg", "/your-image-3.jpg"]
```

### Modifying Shader Effects

The WebGL shaders are located in:
- `src/components/water-distortion/ripple-effect.tsx`
- `src/components/mask-cursor/index.tsx`

Key shader sections:
- `fluidUpdateShader` - Wave propagation simulation
- `imageFragmentShader` - Image distortion and lighting

---

## 👨‍💻 Author

**Christian Ortiz** - Creative Developer

## 🔗 Connect with me

- **Portfolio:** [cortiz.dev](https://cortiz.dev)
- **YouTube:** [@cortizdev](https://youtube.com/@cortizdev)
- **X (Twitter):** [@cortiz2894](https://twitter.com/cortiz2894)
- **LinkedIn:** [Christian Daniel Ortiz](https://linkedin.com/in/christian-daniel-ortiz)

## 📬 Contact

For inquiries, collaborations or questions: **cortiz2894@gmail.com**
---

⭐ If you found this useful, consider subscribing to my [YouTube channel](https://youtube.com/@cortizdev) for more creative development content!
