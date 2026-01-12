import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
  project: "proj_doagyqmhchqakmcoamij",
  runtime: "node",
  logLevel: "log",
  // Massimo 2 ore di esecuzione per task (per Ultra Summary lunghi)
  maxDuration: 7200,
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  dirs: ["src/trigger"],
});
