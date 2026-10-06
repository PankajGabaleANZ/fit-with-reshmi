/** Inline list separated by a terracotta "·" (the design system's tag treatment).
 *  The dot trails each item, so a wrapped line never starts with a stray dot. */
export default function Tags({ items, className = "" }: { items: string[]; className?: string }) {
  return (
    <ul className={`flex flex-wrap items-center gap-y-2 text-[14px] text-muted ${className}`}>
      {items.map((t, i) => (
        <li key={t + i} className="flex items-center">
          {t}
          {i < items.length - 1 && (
            <span className="text-accent px-4" aria-hidden="true">
              ·
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
