"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

type MagneticButtonProps = {
  children: React.ReactNode;
  href?: string;
  className?: string;
  variant?: "primary" | "outline";
  target?: string;
  rel?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
};

export default function MagneticButton({ children, href, className = "", variant = "primary", target, rel, type, disabled, onClick, ...props }: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement | HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const shouldReduceMotion = useReducedMotion();

  const handleMouse = (e: React.MouseEvent) => {
    if (shouldReduceMotion) return;
    if (!ref.current) return;
    
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  const baseStyles = "relative inline-flex items-center justify-center px-8 py-3 rounded-full font-medium transition-colors interactive overflow-hidden";
  const variants = {
    primary: "bg-accent text-white hover:bg-secondary shadow-glow-strong",
    outline: "glass text-white hover:glass-hover",
  };

  const content = (
    <>
      <span className="relative z-10 inline-flex items-center justify-center">{children}</span>
      {variant === "primary" && (
        <span className="absolute inset-0 rounded-full shadow-glow pointer-events-none" />
      )}
    </>
  );

  if (href) {
    return (
      <motion.a
        href={href}
        target={target}
        rel={rel}
        ref={ref as any}
        onMouseMove={handleMouse}
        onMouseLeave={reset}
        animate={{ x: position.x, y: position.y }}
        transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
        className={`${baseStyles} ${variants[variant]} ${className}`}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={ref as any}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      type={type}
      disabled={disabled}
      onClick={onClick}
    >
      {content}
    </motion.button>
  );
}
