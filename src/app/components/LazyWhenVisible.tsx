"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type LazyWhenVisibleProps = {
  children: ReactNode;
  /** Tailwind min-height class while waiting for intersection (e.g. min-h-[280px]) */
  placeholderClassName?: string;
  /** @deprecated Prefer placeholderClassName — avoids inline minHeight styles */
  minHeight?: number | string;
  className?: string;
  rootMargin?: string;
};

/**
 * Mount children only when near the viewport, defers JS chunks and lazy images below the fold.
 */
const DEFAULT_PLACEHOLDER = "min-h-[240px]";

export default function LazyWhenVisible({
  children,
  placeholderClassName,
  minHeight,
  className = "",
  rootMargin = "280px 0px",
}: LazyWhenVisibleProps) {
  const hiddenPlaceholder = placeholderClassName ?? DEFAULT_PLACEHOLDER;
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
    <div
      ref={ref}
      className={`${className} ${visible ? "" : hiddenPlaceholder}`.trim()}
    >
      {visible ? children : null}
    </div>
  );
}
