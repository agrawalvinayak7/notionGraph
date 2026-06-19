import Link from "next/link";
import { RefreshCw, Search, Settings } from "lucide-react";
import { Wordmark } from "@/components/brand/logo";
import { HeroConstellation } from "@/components/marketing/hero-constellation";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Placeholder graph screen. The live force-directed canvas arrives in Phase 4
// (see docs/ROADMAP.md). The chrome here previews the real app shell.
export default function GraphPage() {
  return (
    <div className="flex h-dvh flex-col">
      {/* top bar */}
      <header className="border-border bg-surface/60 flex h-14 shrink-0 items-center justify-between border-b px-4 backdrop-blur">
        <Link href="/" aria-label="NotionGraph home">
          <Wordmark />
        </Link>
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground mr-2 hidden font-mono text-xs sm:inline">
            not yet synced
          </span>
          <Button variant="ghost" size="icon" disabled aria-label="Search">
            <Search className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" disabled aria-label="Re-sync">
            <RefreshCw className="size-4" />
          </Button>
          <Link
            href="/settings"
            aria-label="Settings"
            className={buttonVariants({ variant: "ghost", size: "icon" })}
          >
            <Settings className="size-4" />
          </Link>
        </div>
      </header>

      {/* canvas area */}
      <main className="bg-observatory relative flex flex-1 items-center justify-center overflow-hidden">
        <div className="animate-float pointer-events-none absolute inset-0 flex items-center justify-center opacity-40">
          <div className="aspect-square w-[min(70vh,70vw)]">
            <HeroConstellation />
          </div>
        </div>
        <div className="animate-rise relative z-10 max-w-sm text-center">
          <p className="text-muted-foreground font-mono text-xs tracking-[0.2em] uppercase">
            The graph
          </p>
          <h1 className="mt-3 font-serif text-3xl tracking-tight">
            Your constellation forms here
          </h1>
          <p className="text-muted-foreground mt-3 text-sm">
            Connect your Notion workspace and the live, interactive graph will
            render in this canvas.
          </p>
          <Link
            href="/connect"
            className={cn(buttonVariants(), "glow-primary mt-6")}
          >
            Connect Notion
          </Link>
        </div>
      </main>
    </div>
  );
}
