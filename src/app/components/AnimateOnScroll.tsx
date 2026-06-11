"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type AnimateOnScrollProps = {
  children: ReactNode;
  animation?: "fadeIn" | "fadeInUp" | "fadeInDown" | "fadeInLeft" | "fadeInRight" | "scaleIn";
  delay?: number;
  duration?: number;
  className?: string;
  threshold?: number;
  /** Above-the-fold content: visible immediately (avoids opacity-0 hurting LCP). */
  eager?: boolean;
};

export function AnimateOnScroll({
  children,
  animation = "fadeIn",
  delay = 0,
  duration = 600,
  className = "",
  threshold = 0.1,
  eager = false,
}: AnimateOnScrollProps) {
  const [isVisible, setIsVisible] = useState(eager);
  const [ready, setReady] = useState(eager);
  const ref = useRef<HTMLDivElement>(null);
  const hasBeenVisible = useRef(eager);

  useEffect(() => {
    if (eager) {
      hasBeenVisible.current = true;
      setIsVisible(true);
      setReady(true);
      return;
    }

    const node = ref.current;
    if (!node) {
      setReady(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasBeenVisible.current) {
          hasBeenVisible.current = true;
          setIsVisible(true);
        }
        setReady(true);
        if (!entry.isIntersecting && !hasBeenVisible.current) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin: "200px 0px 200px 0px",
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, eager]);

  const concealed = ready && !isVisible;

  const animationClasses = {
    fadeIn: concealed ? "opacity-0" : "opacity-100",
    fadeInUp: concealed ? "opacity-0 translate-y-8" : "opacity-100 translate-y-0",
    fadeInDown: concealed ? "opacity-0 -translate-y-8" : "opacity-100 translate-y-0",
    fadeInLeft: concealed ? "opacity-0 -translate-x-8" : "opacity-100 translate-x-0",
    fadeInRight: concealed ? "opacity-0 translate-x-8" : "opacity-100 translate-x-0",
    scaleIn: concealed ? "opacity-0 scale-95" : "opacity-100 scale-100",
  };

  const motionStyle =
    delay > 0 || duration !== 600
      ? ({
          "--aos-delay": `${delay}ms`,
          "--aos-duration": `${duration}ms`,
        } as CSSProperties)
      : undefined;

  return (
    <div
      ref={ref}
      className={`aos-transition ease-out ${concealed ? "aos-pending" : ""} ${animationClasses[animation]} ${className}`}
      style={motionStyle}
    >
      {children}
    </div>
  );
}
