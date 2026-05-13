import type { HTMLAttributes, ReactNode } from "react";

type ContainerSize = "default" | "narrow" | "wide";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: ContainerSize;
  children: ReactNode;
}

const sizeClasses: Record<ContainerSize, string> = {
  default: "max-w-7xl",
  narrow: "max-w-5xl",
  wide: "max-w-screen-2xl",
};

export function Container({
  size = "default",
  className = "",
  children,
  ...rest
}: ContainerProps) {
  const widthClass = sizeClasses[size];
  return (
    <div
      className={`${widthClass} mx-auto w-full px-4 sm:px-6 lg:px-8 ${className}`.trim()}
      {...rest}
    >
      {children}
    </div>
  );
}

export default Container;
