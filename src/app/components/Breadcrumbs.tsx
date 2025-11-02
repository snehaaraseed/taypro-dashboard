import Link from "next/link";
import { BreadcrumbListSchema } from "./StructuredData";

export function Breadcrumbs({
  items,
}: {
  items: { name: string; href: string }[];
}) {
  return (
    <>
      {items && items.length > 0 && <BreadcrumbListSchema items={items} />}
      <nav
        className="py-3 w-full text-center"
        aria-label="Breadcrumb navigation"
      >
        <div className="max-w-7xl mx-auto px-6">
          <ol className="flex items-center justify-start gap-2 text-[#f3f6ee] text-sm">
          {items.map((item, i) => (
            <li key={`${item.href}-${i}`} className="flex items-center">
              <Link
                href={item.href || "#"}
                title={`Breadcrumb: ${item.name}`}
                className="hover:underline"
              >
                {item.name}
              </Link>
              {i < items.length - 1 && (
                <span className="mx-2" aria-hidden="true">
                  &raquo;
                </span>
              )}
            </li>
          ))}
        </ol>
        </div>
      </nav>
    </>
  );
}
