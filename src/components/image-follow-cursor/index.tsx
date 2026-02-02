import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './styles.css';

const CursorImageEffect = ({
  triggerRef,
  excludeRef,
  images,
  imageWidth = 150,
  imageHeight = 130,
  minDistance = 150,
}: {
  triggerRef: React.RefObject<HTMLElement>;
  excludeRef: React.RefObject<HTMLElement>;

  images: string[];
  imageWidth?: number;
  imageHeight?: number;
  minDistance?: number;
}) => {
  const lastPosition = useRef<{ x: number; y: number } | null>(null);
  const imageIndex = useRef(0);

  useEffect(() => {
    const triggerElement = triggerRef.current;
    const excludeElement = excludeRef.current;

    if (!triggerElement || !excludeElement) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;

      // Check if the mouse is over the exclude element
      const excludeRect = excludeElement.getBoundingClientRect();
      if (
        x >= excludeRect.left &&
        x <= excludeRect.right &&
        y >= excludeRect.top &&
        y <= excludeRect.bottom
      ) {
        return; // Don't generate image if mouse is over the exclude element
      }

      if (
        lastPosition.current &&
        Math.sqrt((x - lastPosition.current.x) ** 2 + (y - lastPosition.current.y) ** 2) <
          minDistance
      ) {
        return;
      }

      const direction = { x: 0, y: 0 };

      if (lastPosition.current) {
        const deltaX = x - lastPosition.current.x;
        const deltaY = y - lastPosition.current.y;

        direction.x = deltaX > 0 ? 1 : -1;
        direction.y = deltaY > 0 ? 1 : -1;
      }

      lastPosition.current = { x, y };

      // Create Image Container
      const imageContainer = document.createElement('div');
      imageContainer.className = 'cursor-image';
      imageContainer.style.top = `${y - imageHeight / 2}px`;
      imageContainer.style.left = `${x - imageWidth / 2}px`;
      imageContainer.style.width = `${imageWidth}px`;
      imageContainer.style.height = `${imageHeight}px`;

      // Select next image in sequence
      const currentImage = images[imageIndex.current];
      imageIndex.current = (imageIndex.current + 1) % images.length;
      const imageElement = document.createElement('img');
      imageElement.src = currentImage;
      imageElement.alt = 'Cursor Effect';
      imageElement.className = 'cursor-image__img';

      imageContainer.appendChild(imageElement);
      triggerElement.appendChild(imageContainer);

      const initialX = -130 * direction.x;
      const initialY = -70 * direction.y;

      gsap.set(imageContainer, {
        scale: 0,
        x: initialX,
        y: initialY,
        opacity: 0,
      });

      gsap
        .timeline()
        .to(imageContainer, {
          opacity: 1,
          duration: 0.7,
          scale: 1,
          ease: 'power3.out'
        })
        .to(
          imageContainer,
          {
            x: 0,
            y: 0,
            duration: 0.6,
            ease: 'power3.out',
          },
          '<',
        )
        .to(imageContainer, {
          opacity: 0,
          duration: 0.4,
          scale: 0.3,
          onComplete: () => {
            triggerElement.removeChild(imageContainer);
          },
        },"<+0.6");
    };

    triggerElement.addEventListener('mousemove', handleMouseMove);

    return () => {
      triggerElement.removeEventListener('mousemove', handleMouseMove);
    };
  }, [triggerRef, images, imageWidth, imageHeight, minDistance, excludeRef]);

  return null;
};

export default CursorImageEffect;
