"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ConfirmAction({
  label,
  confirmText,
  endpoint,
  successText,
  redirectTo,
}: {
  label: string;
  confirmText: string;
  endpoint: string;
  successText: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch(endpoint, { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Action failed");
      }
      toast.success(successText);
      if (redirectTo) router.push(redirectTo);
      else router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
      setLoading(false);
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground text-sm">{confirmText}</span>
        <Button
          size="sm"
          variant="destructive"
          onClick={run}
          disabled={loading}
        >
          {loading && <Loader2 className="size-3.5 animate-spin" />}
          Yes, do it
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setConfirming(false)}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button size="sm" variant="destructive" onClick={() => setConfirming(true)}>
      {label}
    </Button>
  );
}
