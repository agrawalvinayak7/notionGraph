import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const SECTIONS = [
  {
    title: "Notion connection",
    body: "Workspace details, last sync time, and disconnect — available once the connection flow ships (Phase 3).",
  },
  {
    title: "Sync",
    body: "Re-sync now and view recent sync history (Phase 5).",
  },
  {
    title: "Appearance",
    body: "Theme is dark by default; a light-mode toggle lands in Phase 5.",
  },
  {
    title: "Account",
    body: "Managed by Clerk — profile and sign-out arrive when auth is wired (Phase 1).",
  },
];

export default function SettingsPage() {
  return (
    <div className="bg-background min-h-full px-6 py-12">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          href="/graph"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "-ml-2",
          )}
        >
          <ArrowLeft className="size-4" />
          Back to graph
        </Link>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your connection, sync, and account.
        </p>

        <div className="border-border bg-surface/60 mt-8 space-y-px overflow-hidden rounded-xl border">
          {SECTIONS.map((s, i) => (
            <div key={s.title}>
              {i > 0 && <Separator />}
              <div className="p-5">
                <h2 className="text-sm font-medium">{s.title}</h2>
                <p className="text-muted-foreground mt-1 text-sm">{s.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-destructive/30 bg-destructive/5 mt-8 rounded-xl border p-5">
          <h2 className="text-destructive text-sm font-medium">Danger zone</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Deleting your data removes your graph and disconnects Notion. Wires
            up in Phase 5.
          </p>
        </div>
      </div>
    </div>
  );
}
