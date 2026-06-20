import { task } from "@trigger.dev/sdk";

/**
 * A trivial task to confirm the Trigger.dev wiring works end to end.
 * Run the worker with `npx trigger.dev@latest dev`, then trigger it from the
 * dashboard or code. Real sync jobs (initial-sync, incremental-sync) land in
 * Phase 3 — see docs/ROADMAP.md.
 */
export const healthCheck = task({
  id: "health-check",
  run: async (payload: { name?: string }) => {
    return {
      ok: true,
      message: `NotionGraph background jobs are live${
        payload.name ? `, ${payload.name}` : ""
      }.`,
      at: new Date().toISOString(),
    };
  },
});
