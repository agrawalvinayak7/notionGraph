import { task } from "@trigger.dev/sdk";
import { syncWorkspaceForUser } from "../lib/sync";

// Background job: sync a user's Notion workspace into nodes + edges.
// The app pre-creates a `sync_runs` row (status "queued") and passes its id so
// status can be polled. Runs on the Trigger.dev worker — locally that means
// `npx trigger.dev@latest dev` must be running.
export const syncWorkspace = task({
  id: "sync-workspace",
  maxDuration: 600, // 10 min ceiling for large workspaces
  run: async (payload: { userId: string; syncRunId?: string }) => {
    return syncWorkspaceForUser(payload.userId, payload.syncRunId);
  },
});
