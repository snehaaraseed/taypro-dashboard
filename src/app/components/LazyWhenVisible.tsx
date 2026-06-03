"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type LazyWhenVisibleProps = {
  children: ReactNode;
  /** Placeholder height to limit layout shift before content mounts */
  minHeight?: number | string;
  className?: string;
  rootMargin?: string;
};

/**
 * Mount children only when near the viewport, defers JS chunks and lazy images below the fold.
 */
export default function LazyWhenVisible({
  children,
  minHeight = 240,
  className = "",
  rootMargin = "280px 0px",
}: LazyWhenVisibleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || visible) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [visible, rootMargin]);

  return (
    <div ref={ref} className={className} style={{ minHeight: visible ? undefined : minHeight }}>
      {visible ? children : null}
    </div>
  );
}
