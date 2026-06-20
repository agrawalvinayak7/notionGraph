import Link from "next/link";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ConnectPage() {
  return (
    <div className="bg-observatory flex min-h-full flex-col items-center justify-center px-6 py-16">
      <div className="animate-rise border-border bg-surface/80 w-full max-w-md rounded-xl border p-8 shadow-2xl backdrop-blur">
        <LogoMark className="size-8 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]" />

        <h1 className="mt-6 text-2xl font-semibold tracking-tight">
          Connect your Notion
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          We&apos;ll read your pages, databases, and the links between them to
          build your graph. You choose exactly what to share.
        </p>

        <ul className="mt-6 space-y-3 text-sm">
          <li className="flex items-start gap-3">
            <ShieldCheck className="text-success mt-0.5 size-4 shrink-0" />
            <span className="text-muted-foreground">
              <span className="text-foreground">Read-only.</span> We never edit
              or delete anything in your workspace.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <Lock className="text-success mt-0.5 size-4 shrink-0" />
            <span className="text-muted-foreground">
              <span className="text-foreground">Private.</span> Your access
              token is encrypted, and only you can see your graph.
            </span>
          </li>
        </ul>

        <Button size="lg" className="glow-primary mt-8 w-full" disabled>
          Authorize with Notion
        </Button>
        <p className="text-muted-foreground mt-3 text-center font-mono text-xs">
          Connection flow wires up in Phase 3
        </p>
      </div>

      <Link
        href="/"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mt-6")}
      >
        <ArrowLeft className="size-4" />
        Back home
      </Link>
    </div>
  );
}
