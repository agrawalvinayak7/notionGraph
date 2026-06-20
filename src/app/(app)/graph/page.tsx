import Link from "next/link";
import { Settings } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Wordmark } from "@/components/brand/logo";
import { GraphView } from "@/components/graph/graph-view";
import { buttonVariants } from "@/components/ui/button";

export default function GraphPage() {
  return (
    <div className="flex h-dvh flex-col">
      {/* top bar */}
      <header className="border-border bg-surface/60 flex h-14 shrink-0 items-center justify-between border-b px-4 backdrop-blur">
        <Link href="/" aria-label="NotionGraph home">
          <Wordmark />
        </Link>
        <div className="flex items-center gap-1.5">
          <Link
            href="/settings"
            aria-label="Settings"
            className={buttonVariants({ variant: "ghost", size: "icon" })}
          >
            <Settings className="size-4" />
          </Link>
          <div className="ml-1.5 flex items-center">
            <UserButton />
          </div>
        </div>
      </header>

      {/* the graph (loads data, syncs, renders) */}
      <GraphView />
    </div>
  );
}
