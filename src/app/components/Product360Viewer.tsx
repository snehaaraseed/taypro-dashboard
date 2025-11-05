"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Product360ViewerProps {
  imagePath: string; // Base path like "/360-degree-images/Model-A/MODEL-A"
  imageCount: number; // Total number of images (61 for Model-A)
  imagePrefix?: string; // Prefix before number, default: ""
  imageSuffix?: string; // Suffix after number, default: ".png"
  startIndex?: number; // Starting index (e.g., 100 for MODEL-A-0100)
  width?: number;
  height?: number;
  className?: string;
}

export default function Product360Viewer({
  imagePath,
  imageCount,
  imagePrefix = "",
  imageSuffix = ".png",
  startIndex = 100,
  width = 800,
  height = 600,
  className = "",
}: Product360ViewerProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const framePositionRef = useRef<number>(0); // Use decimal position for smooth transitions
  const animationFrameRef = useRef<number | null>(null);
  const isDraggingRef = useRef<boolean>(false); // Ref to track dragging state for animation loop
  const hasAutoRotatedRef = useRef<boolean>(false); // Track if auto-rotation has been triggered
  const autoRotateAnimationRef = useRef<number | null>(null);

  // Preload images
  useEffect(() => {
    const loadImages = async () => {
      const imagePromises: Promise<void>[] = [];
      
      for (let i = 0; i < imageCount; i++) {
        const frameNumber = startIndex + i;
        const paddedNumber = frameNumber.toString().padStart(4, "0");
        const imageUrl = `${imagePath}${imagePrefix}${paddedNumber}${imageSuffix}`;
        
        const img = new window.Image();
        const promise = new Promise<void>((resolve) => {
          img.onload = () => {
            setImagesLoaded((prev) => prev + 1);
            resolve();
          };
          img.onerror = () => resolve(); // Continue even if an image fails
        });
        img.src = imageUrl;
        imagePromises.push(promise);
      }
      
      await Promise.all(imagePromises);
      setIsLoading(false);
    };

    loadImages();
  }, [imagePath, imageCount, imagePrefix, imageSuffix, startIndex]);

  const getImageUrl = useCallback(
    (frameIndex: number) => {
      const frameNumber = startIndex + frameIndex;
      const paddedNumber = frameNumber.toString().padStart(4, "0");
      return `${imagePath}${imagePrefix}${paddedNumber}${imageSuffix}`;
    },
    [imagePath, imagePrefix, imageSuffix, startIndex]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    // Cancel auto-rotation if active
    if (autoRotateAnimationRef.current !== null) {
      cancelAnimationFrame(autoRotateAnimationRef.current);
      autoRotateAnimationRef.current = null;
    }
    
    setIsDragging(true);
    setStartX(e.clientX);
    // Ensure framePositionRef is synced with currentFrame
    framePositionRef.current = currentFrame;
  };

  const updateFrame = useCallback(() => {
    // Normalize frame position to be within [0, imageCount)
    while (framePositionRef.current < 0) {
      framePositionRef.current += imageCount;
    }
    while (framePositionRef.current >= imageCount) {
      framePositionRef.current -= imageCount;
    }
    
    // Update displayed frame (rounded to nearest integer, clamped to valid range)
    const roundedFrame = Math.max(0, Math.min(imageCount - 1, Math.round(framePositionRef.current)));
    setCurrentFrame((prev) => {
      // Only update if frame actually changed to avoid unnecessary re-renders
      if (prev !== roundedFrame) {
        return roundedFrame;
      }
      return prev;
    });
  }, [imageCount]);

  // Continuous update loop during dragging for smoother animation
  useEffect(() => {
    if (isDragging) {
      isDraggingRef.current = true;
      const updateLoop = () => {
        if (isDraggingRef.current) {
          updateFrame();
          animationFrameRef.current = requestAnimationFrame(updateLoop);
        }
      };
      animationFrameRef.current = requestAnimationFrame(updateLoop);
      
      return () => {
        isDraggingRef.current = false;
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      };
    } else {
      isDraggingRef.current = false;
    }
  }, [isDragging, updateFrame]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingRef.current) return;

      const deltaX = e.clientX - startX;
      const sensitivity = 0.1; // Reduced sensitivity for smoother rotation
      
      // Update decimal position for smooth transitions
      framePositionRef.current += deltaX * sensitivity;
      
      // Immediately update frame for responsive feedback
      updateFrame();
      
      setStartX(e.clientX);
    },
    [startX, updateFrame]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    // Cancel auto-rotation if active
    if (autoRotateAnimationRef.current !== null) {
      cancelAnimationFrame(autoRotateAnimationRef.current);
      autoRotateAnimationRef.current = null;
    }
    
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    // Ensure framePositionRef is synced with currentFrame
    framePositionRef.current = currentFrame;
  };

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDraggingRef.current) return;

      const deltaX = e.touches[0].clientX - startX;
      const sensitivity = 0.1; // Reduced sensitivity for smoother rotation
      
      // Update decimal position for smooth transitions
      framePositionRef.current += deltaX * sensitivity;
      
      // Immediately update frame for responsive feedback
      updateFrame();
      
      setStartX(e.touches[0].clientX);
    },
    [startX, updateFrame]
  );

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleTouchEnd);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleTouchEnd);
        
        // Cancel any pending animation frame
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      };
    }
  }, [isDragging, handleMouseMove, handleTouchMove]);

  // Auto-rotate once when scrolled into view
  useEffect(() => {
    if (isLoading || hasAutoRotatedRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAutoRotatedRef.current && !isDraggingRef.current) {
            hasAutoRotatedRef.current = true;
            
            // Start auto-rotation: 1 full rotation = imageCount frames
            const startPosition = framePositionRef.current;
            const targetPosition = startPosition + imageCount;
            const duration = 3000; // 3 seconds for 1 full rotation
            const startTime = Date.now();

            const animate = () => {
              // Stop if user starts dragging
              if (isDraggingRef.current) {
                autoRotateAnimationRef.current = null;
                return;
              }

              const elapsed = Date.now() - startTime;
              const progress = Math.min(elapsed / duration, 1);
              
              // Easing function for smooth acceleration/deceleration
              const easeInOut = progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;

              framePositionRef.current = startPosition + (targetPosition - startPosition) * easeInOut;
              
              // Normalize and update frame
              updateFrame();

              if (progress < 1 && !isDraggingRef.current) {
                autoRotateAnimationRef.current = requestAnimationFrame(animate);
              } else {
                // Ensure we end at the correct normalized position
                while (framePositionRef.current < 0) {
                  framePositionRef.current += imageCount;
                }
                while (framePositionRef.current >= imageCount) {
                  framePositionRef.current -= imageCount;
                }
                // Clamp final frame to valid range
                framePositionRef.current = Math.max(0, Math.min(imageCount - 1, framePositionRef.current));
                updateFrame();
                autoRotateAnimationRef.current = null;
              }
            };

            // Start animation after a small delay
            setTimeout(() => {
              if (!isDraggingRef.current) {
                autoRotateAnimationRef.current = requestAnimationFrame(animate);
              }
            }, 300);
          }
        });
      },
      {
        threshold: 0.3, // Trigger when 30% of the element is visible
        rootMargin: '0px',
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
      if (autoRotateAnimationRef.current !== null) {
        cancelAnimationFrame(autoRotateAnimationRef.current);
        autoRotateAnimationRef.current = null;
      }
    };
  }, [isLoading, imageCount, updateFrame]);

  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center bg-transparent rounded-lg ${className}`}
        style={{ minHeight: height, width: "100%", maxWidth: width }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A8C117] mx-auto mb-4"></div>
          <p className="text-gray-600">
            Loading 360° view... ({imagesLoaded}/{imageCount})
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width: "100%", maxWidth: width }}>
      <div
        ref={containerRef}
        className="relative w-full bg-transparent rounded-lg overflow-hidden cursor-grab active:cursor-grabbing select-none"
        style={{ 
          width: "100%", 
          height: "auto",
          aspectRatio: `${width} / ${height}`,
          maxWidth: "100%"
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <img
          src={getImageUrl(currentFrame)}
          alt={`360-degree view - Frame ${currentFrame + 1}`}
          className="w-full h-full object-contain transition-opacity duration-100"
          draggable={false}
          style={{ display: "block" }}
          key={currentFrame} // Force re-render for smooth transitions
        />
      </div>
    </div>
  );
}

