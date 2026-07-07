"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Search } from "lucide-react";

type BlogSearchFormProps = {
  initialQuery?: string;
  actionPath?: string;
  placeholder: string;
  label: string;
  submitLabel: string;
};

export function BlogSearchForm({
  initialQuery = "",
  actionPath = "/blog",
  placeholder,
  label,
  submitLabel,
}: BlogSearchFormProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    const url = trimmed
      ? `${actionPath}?q=${encodeURIComponent(trimmed)}`
      : actionPath;
    router.push(url);
  }

  return (
    <form
      onSubmit={onSubmit}
      role="search"
      aria-label={label}
      className="mx-auto w-full max-w-xl"
    >
      <div className="flex overflow-hidden rounded-lg border border-white/20 bg-white/10 shadow-sm backdrop-blur-sm focus-within:border-[#A8C117]/60 focus-within:ring-2 focus-within:ring-[#A8C117]/30">
        <label htmlFor="blog-search" className="sr-only">
          {label}
        </label>
        <input
          id="blog-search"
          name="q"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/60 focus:outline-none"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-2 bg-[#A8C117] px-4 py-3 text-sm font-semibold text-[#052638] transition hover:bg-[#b8d12a]"
        >
          <Search className="h-4 w-4" aria-hidden />
          <span>{submitLabel}</span>
        </button>
      </div>
    </form>
  );
}
