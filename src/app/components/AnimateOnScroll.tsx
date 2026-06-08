"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

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
  /** Gate concealment until after mount so SSR/hydration both render the visible state. */
  const [ready, setReady] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hasBeenVisible = useRef(eager);

  useLayoutEffect(() => {
    if (eager) {
      hasBeenVisible.current = true;
      setIsVisible(true);
      setReady(true);
      return;
    }

    const checkInitialVisibility = () => {
      if (ref.current && !hasBeenVisible.current) {
        const rect = ref.current.getBoundingClientRect();
        const isInViewport =
          rect.top < window.innerHeight &&
          rect.bottom > 0 &&
          rect.left < window.innerWidth &&
          rect.right > 0;

        if (isInViewport) {
          setIsVisible(true);
          hasBeenVisible.current = true;
          return true;
        }
      }
      return false;
    };

    setReady(true);

    if (checkInitialVisibility()) {
      return;
    }

    setIsVisible(false);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasBeenVisible.current) {
          setIsVisible(true);
          hasBeenVisible.current = true;
          // Keep observer active for re-entry scenarios
        }
      },
      { 
        threshold,
        // Use rootMargin to trigger earlier (200px before element enters viewport)
        rootMargin: "200px 0px 200px 0px"
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    // Also check on scroll events as a fallback for very fast scrolling
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      if (hasBeenVisible.current) return;
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        checkInitialVisibility();
      }, 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Also check on resize
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      clearTimeout(scrollTimeout);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (ref.current) {
        observer.unobserve(ref.current);
      }
      observer.disconnect();
    };
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

