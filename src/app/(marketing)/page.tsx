import Link from "next/link";
import { ArrowRight, Network, RefreshCw, Search } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { HeroConstellation } from "@/components/marketing/hero-constellation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    icon: Network,
    title: "Connect Notion",
    body: "Authorize in seconds. We read your pages, databases, and the links between them — never editing a thing.",
  },
  {
    icon: Search,
    title: "Explore the graph",
    body: "Every page becomes a node, every link an edge. Pan, zoom, search, and follow your ideas wherever they connect.",
  },
  {
    icon: RefreshCw,
    title: "Stay in sync",
    body: "Your workspace keeps changing, so your graph does too — re-synced automatically in the background.",
  },
];

export default function LandingPage() {
  return (
    <div className="bg-observatory bg-grid flex min-h-full flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6">
        {/* Hero */}
        <section className="grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p
              className="animate-rise text-muted-foreground font-mono text-xs tracking-[0.2em] uppercase"
              style={{ animationDelay: "0.05s" }}
            >
              Obsidian-style graph · for Notion
            </p>

            <h1
              className="animate-rise mt-5 text-balance"
              style={{ animationDelay: "0.15s" }}
            >
              <span className="font-serif text-5xl leading-[1.05] tracking-tight md:text-6xl">
                See the <span className="text-gradient italic">shape</span> of
                your knowledge.
              </span>
            </h1>

            <p
              className="animate-rise text-muted-foreground mt-6 max-w-md text-base"
              style={{ animationDelay: "0.25s" }}
            >
              Notion stores your notes. NotionGraph reveals how they connect —
              an interactive, force-directed map of your entire workspace, so
              ideas stop hiding inside nested pages.
            </p>

            <div
              className="animate-rise mt-8 flex flex-wrap items-center gap-3"
              style={{ animationDelay: "0.35s" }}
            >
              <Link
                href="/connect"
                className={cn(buttonVariants({ size: "lg" }), "glow-primary")}
              >
                Connect your Notion
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/graph"
                className={buttonVariants({ size: "lg", variant: "ghost" })}
              >
                See a demo graph
              </Link>
            </div>
          </div>

          {/* Hero visual */}
          <div
            className="animate-fade relative aspect-square w-full"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="animate-float absolute inset-0">
              <HeroConstellation />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-border/60 border-t py-16">
          <h2 className="text-lg font-medium tracking-tight">How it works</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="border-border/70 bg-surface/60 hover:border-primary/40 rounded-lg border p-6 transition-colors"
              >
                <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-md">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-4 text-base font-medium">{title}</h3>
                <p className="text-muted-foreground mt-2 text-sm">{body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-border/60 border-t">
        <div className="text-muted-foreground mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-sm md:flex-row">
          <span>NotionGraph</span>
          <span className="font-mono text-xs">
            Built with Next.js · Supabase · Clerk
          </span>
        </div>
      </footer>
    </div>
  );
}
