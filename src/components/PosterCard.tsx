import Link from "next/link";

/**
 * The reference site's recurring "poster-style scheme card": dark navy top
 * panel with a bold title, a circular icon badge overlapping the panel's
 * bottom edge, then a white lower panel with title/description/CTA. The
 * source site's own logo mark inside the navy panel is intentionally
 * omitted, everything else about the pattern is reproduced.
 */
export function PosterCard({
  href,
  isExternal,
  icon,
  posterTitle,
  categoryLabel,
  tagline,
}: {
  href: string;
  isExternal?: boolean;
  icon: string;
  posterTitle: string;
  categoryLabel: string;
  tagline: string;
}) {
  const className =
    "group block rounded-lg overflow-hidden border border-govgray-300 bg-white hover:shadow-lg transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-govblue-700";

  const inner = (
    <>
      <div className="relative bg-govblue-900 text-white text-center pt-6 pb-9 px-3">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-govorange-500">
          {categoryLabel}
        </span>
        <p className="mt-1 font-extrabold text-lg leading-tight">{posterTitle}</p>
        <span
          aria-hidden="true"
          className="absolute -bottom-5 left-1/2 -translate-x-1/2 h-10 w-10 rounded-full bg-govorange-500 text-white flex items-center justify-center text-lg shadow"
        >
          {icon}
        </span>
      </div>
      <div className="pt-7 pb-4 px-4 text-center">
        <p className="text-xs text-govgray-700/80 line-clamp-2">{tagline}</p>
        <span className="mt-3 inline-block rounded bg-govorange-500 group-hover:bg-govorange-600 text-white text-xs font-semibold px-4 py-1.5 transition-colors">
          {isExternal ? "Visit site" : "Read more"}
        </span>
      </div>
    </>
  );

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {inner}
    </Link>
  );
}
