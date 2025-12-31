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
    
    gsap.from(chars, {
      opacity: 0,
      y: 20,
      rotateX: -90,
      stagger: duration,
      duration: 0.5,
      delay: delay / 1000, // Convert to seconds if input is ms, assuming ms based on user example
      ease: 'back.out(1.7)',
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className={`split-text-container ${className}`}>
      {text.split('').map((char, index) => (
        <span 
          key={index} 
          className="split-char inline-block"
          style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}
        >
          {char}
        </span>
      ))}
    </div>
  );
};

export default SplitText;
