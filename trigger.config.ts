import { defineConfig } from "@trigger.dev/sdk";

// Trigger.dev project config. The project ref is a public identifier (not a
// secret); the secret lives in TRIGGER_SECRET_KEY in .env. Background tasks
// live in src/trigger/. See docs/TECH_STACK.md §6.
export default defineConfig({
  project: "proj_jmywrwolpgkqdghjtlll",
  runtime: "node",
  logLevel: "log",
  maxDuration: 300, // 5 min cap per run; sync jobs tune this later
  dirs: ["./src/trigger"],
});
