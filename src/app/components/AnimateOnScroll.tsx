"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

type AnimateOnScrollProps = {
  children: ReactNode;
  animation?: "fadeIn" | "fadeInUp" | "fadeInDown" | "fadeInLeft" | "fadeInRight" | "scaleIn";
  delay?: number;
  duration?: number;
  className?: string;
  threshold?: number;
};

export function AnimateOnScroll({
  children,
  animation = "fadeIn",
  delay = 0,
  duration = 600,
  className = "",
  threshold = 0.1,
}: AnimateOnScrollProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Disconnect after animation triggers to improve performance
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
      observer.disconnect();
    };
  }, [threshold]);

  const animationClasses = {
    fadeIn: isVisible ? "opacity-100" : "opacity-0",
    fadeInUp: isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
    fadeInDown: isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8",
    fadeInLeft: isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8",
    fadeInRight: isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8",
    scaleIn: isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95",
  };

  return (
    <div
      ref={ref}
      className={`transition-all ease-out ${animationClasses[animation]} ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        willChange: !isVisible ? 'transform, opacity' : 'auto',
      }}
    >
      {children}
    </div>
  );
}

