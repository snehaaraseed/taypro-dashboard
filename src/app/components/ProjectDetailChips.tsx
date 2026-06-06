"use client";

import Link from "next/link";
import { getCategoryHrefForDetailTag } from "@/lib/cms/project-categories";

type ProjectDetailChipsProps = {
  items: string[];
  className?: string;
  linkClassName?: string;
  spanClassName?: string;
  linkTitle?: string;
  /** When false, category tags render as text (use inside an outer card link). */
  linkCategories?: boolean;
};

export function ProjectDetailChips({
  items,
  className = "",
  linkClassName = "hover:underline hover:text-[#c3d958] transition-colors duration-300",
  spanClassName = "",
  linkTitle = "Solar Project",
  linkCategories = true,
}: ProjectDetailChipsProps) {
  return (
    <div className={className}>
      {items.map((item, index) => {
        const href = linkCategories ? getCategoryHrefForDetailTag(item) : null;
        if (href) {
          return (
            <Link
              key={`${item}-${index}`}
              href={href}
              title={linkTitle}
              className={linkClassName}
            >
              {item}
            </Link>
          );
        }
        return (
          <span key={`${item}-${index}`} className={spanClassName}>
            {item}
          </span>
        );
      })}
    </div>
  );
}
