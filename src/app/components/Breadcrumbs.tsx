import { BreadcrumbSchema } from "./BreadcrumbSchema";
import TrackedLink from "./TrackedLink";

export function Breadcrumbs({
  items,
}: {
  items: { name: string; href: string }[];
}) {
  return (
    <>
      {items && items.length > 0 && <BreadcrumbSchema items={items} />}
      <nav
        className="py-3 w-full text-center bg-[#052638] border-b border-[#0c3c57]"
        aria-label="Breadcrumb navigation"
      >
        <div className="max-w-7xl mx-auto px-6">
          <ol className="flex items-center justify-start gap-2 text-slate-200 text-sm">
            {items.map((item, i) => (
              <li key={`${item.href}-${i}`} className="flex items-center">
                <TrackedLink
                  href={item.href || "#"}
                  title={`Breadcrumb: ${item.name}`}
                  trackTitle={item.name}
                  trackLocation="breadcrumb"
                  className="hover:underline hover:text-white transition-colors"
                >
                  {item.name}
                </TrackedLink>
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
