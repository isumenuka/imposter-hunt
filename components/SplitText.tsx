import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
}

const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = "",
  delay = 0,
  duration = 0.05
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;

    const chars = containerRef.current.querySelectorAll('.split-char');

    // Removed rotateX to fix blur issue, using scale instead for a smooth entrance
    gsap.from(chars, {
      opacity: 0,
      y: 30,
      scale: 0.5,
      stagger: duration,
      duration: 0.6,
      delay: delay / 1000,
      ease: 'back.out(1.7)',
      // Force hardware acceleration and crisp rendering
      force3D: true,
      clearProps: 'transform',
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className={`split-text-container ${className}`}>
      {text.split('').map((char, index) => (
        <span
          key={index}
          className="split-char inline-block bg-clip-text text-transparent bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400"
          style={{
            whiteSpace: char === ' ' ? 'pre' : 'normal',
            // Ensure crisp rendering
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            backfaceVisibility: 'hidden',
            perspective: 1000,
            transformStyle: 'preserve-3d',
          }}
        >
          {char}
        </span>
      ))}
    </div>
  );
};

export default SplitText;
