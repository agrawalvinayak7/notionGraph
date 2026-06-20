import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getOrCreateCurrentUser } from "@/lib/user";
import { supabaseAdmin } from "@/lib/supabase/admin";

const ERRORS: Record<string, string> = {
  state_mismatch: "Security check failed. Please try connecting again.",
  missing_code: "Notion didn't return an authorization code. Try again.",
  exchange_failed: "Couldn't complete the connection with Notion. Try again.",
  access_denied: "You declined the Notion authorization.",
};

export default async function ConnectPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const errorMessage = error
    ? (ERRORS[error] ?? "Something went wrong. Please try again.")
    : null;

  // Is this user already connected?
  const user = await getOrCreateCurrentUser();
  const { data: connection } = user
    ? await supabaseAdmin
        .from("notion_connections")
        .select("workspace_name, workspace_id, created_at")
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null };

  return (
    <div className="bg-background flex min-h-full flex-col items-center justify-center px-6 py-16">
      <div className="animate-rise border-border bg-surface/80 w-full max-w-md rounded-xl border p-8 shadow-2xl backdrop-blur">
        <LogoMark className="size-8 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]" />

        {connection ? (
          <>
            <div className="mt-6 flex items-center gap-2">
              <CheckCircle2 className="text-success size-5" />
              <h1 className="text-2xl font-semibold tracking-tight">
                Notion connected
              </h1>
            </div>
            <p className="text-muted-foreground mt-2 text-sm">
              Connected to{" "}
              <span className="text-foreground font-medium">
                {connection.workspace_name ?? "your workspace"}
              </span>
              . Your graph will build from this workspace.
            </p>

            <Link
              href="/graph"
              className={cn(
                buttonVariants({ size: "lg" }),
                "glow-primary mt-8 w-full",
              )}
            >
              Go to your graph
              <ArrowRight className="size-4" />
            </Link>
            <a
              href="/api/notion/start"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "mt-2 w-full",
              )}
            >
              Re-connect a different workspace
            </a>
          </>
        ) : (
          <>
            <h1 className="mt-6 text-2xl font-semibold tracking-tight">
              Connect your Notion
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              We&apos;ll read your pages, databases, and the links between them
              to build your graph. You choose exactly what to share.
            </p>

            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <ShieldCheck className="text-success mt-0.5 size-4 shrink-0" />
                <span className="text-muted-foreground">
                  <span className="text-foreground">Read-only.</span> We never
                  edit or delete anything in your workspace.
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

            {errorMessage && (
              <p className="border-destructive/30 bg-destructive/10 text-destructive mt-6 rounded-md border px-3 py-2 text-sm">
                {errorMessage}
              </p>
            )}

            <a
              href="/api/notion/start"
              className={cn(
                buttonVariants({ size: "lg" }),
                "glow-primary mt-8 w-full",
              )}
            >
              Authorize with Notion
            </a>
          </>
        )}
      </div>

      <Link
        href="/graph"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mt-6")}
      >
        <ArrowLeft className="size-4" />
        Back to graph
      </Link>
    </div>
  );
}
