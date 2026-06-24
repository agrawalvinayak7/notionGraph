import { task } from "@trigger.dev/sdk";
import { syncWorkspaceForUser } from "../lib/sync";

// Background job: sync a user's Notion workspace into nodes + edges.
//
// NOTE: the app currently calls `syncWorkspaceForUser` synchronously from
// /api/sync (fast, no worker needed). This task is the **deploy / large-workspace
// option** — to use it, switch /api/sync back to triggering this task and run the
// Trigger.dev worker (`npx trigger.dev@latest dev` locally; `deploy` in prod).
// It can reuse a pre-created `sync_runs` id via `syncRunId` for status polling.
export const syncWorkspace = task({
  id: "sync-workspace",
  maxDuration: 600, // 10 min ceiling for large workspaces
  run: async (payload: { userId: string; syncRunId?: string }) => {
    return syncWorkspaceForUser(payload.userId, payload.syncRunId);
  },
});
