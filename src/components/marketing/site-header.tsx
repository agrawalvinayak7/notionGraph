import Link from "next/link";
import { Wordmark } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  return (
    <header className="animate-fade border-border/60 bg-background/70 sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" aria-label="NotionGraph home">
          <Wordmark />
        </Link>
        <nav className="flex items-center gap-2">
          <a
            href="https://github.com/agrawalvinayak7/notionGraph"
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            GitHub
          </a>
          <Link
            href="/connect"
            className={cn(buttonVariants({ size: "sm" }), "glow-primary")}
          >
            Connect Notion
          </Link>
        </nav>
      </div>
    </header>
  );
}
