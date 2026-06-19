import { cn } from "@/lib/utils";

/**
 * The NotionGraph mark: three connected nodes forming a tiny constellation.
 * Pairs with the wordmark in <Wordmark />.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn("size-6", className)}
      aria-hidden="true"
    >
      <path
        d="M6 7.5 L17.5 5 M6 7.5 L11 18 M17.5 5 L11 18"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        opacity="0.45"
      />
      <circle cx="6" cy="7.5" r="2.4" className="fill-node-page" />
      <circle cx="17.5" cy="5" r="2" className="fill-node-database" />
      <circle cx="11" cy="18" r="2.2" className="fill-node-row" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-[15px] font-semibold tracking-tight",
        className,
      )}
    >
      <LogoMark className="drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
      <span>
        Notion<span className="text-muted-foreground">Graph</span>
      </span>
    </span>
  );
}
