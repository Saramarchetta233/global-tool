import {
  defineConfig
} from "../../chunk-4L57EEW6.mjs";
import "../../chunk-WZGQJWAS.mjs";
import {
  init_esm
} from "../../chunk-FUV6SSYK.mjs";

// trigger.config.ts
init_esm();
var trigger_config_default = defineConfig({
  project: "proj_doagyqmhchqakmcoamij",
  runtime: "node",
  logLevel: "log",
  // Massimo 2 ore di esecuzione per task (per Ultra Summary lunghi)
  maxDuration: 7200,
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1e3,
      maxTimeoutInMs: 1e4,
      factor: 2,
      randomize: true
    }
  },
  dirs: ["src/trigger"],
  build: {}
});
var resolveEnvVars = void 0;
export {
  trigger_config_default as default,
  resolveEnvVars
};
//# sourceMappingURL=trigger.config.mjs.map
