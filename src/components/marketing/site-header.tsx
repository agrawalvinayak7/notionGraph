import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { Wordmark } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export async function SiteHeader() {
  const { userId } = await auth();
  const signedIn = Boolean(userId);

  return (
    <header className="animate-fade border-border/60 bg-background/70 sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" aria-label="NotionGraph home">
          <Wordmark />
        </Link>
        <nav className="flex items-center gap-2">
          {signedIn ? (
            <>
              <Link
                href="/graph"
                className={cn(buttonVariants({ size: "sm" }), "glow-primary")}
              >
                Open graph
              </Link>
              <UserButton />
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className={cn(buttonVariants({ size: "sm" }), "glow-primary")}
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
