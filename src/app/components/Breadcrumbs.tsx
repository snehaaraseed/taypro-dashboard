import Link from "next/link";

export function Breadcrumbs({
  items,
}: {
  items: { name: string; href: string }[];
}) {
  return (
    <nav className="py-3 px-4 w-full text-center">
      <ol className="flex items-center justify-start gap-2 text-[#f3f6ee] text-sm">
        {items.map((item, i) => (
          <li key={item.href} className="flex items-center">
            <Link
              href={item.href}
              title="Breadcrumb"
              className="hover:underline"
            >
              {item.name}
            </Link>
            {i < items.length - 1 && <span className="mx-2">&raquo;</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
