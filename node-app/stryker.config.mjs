
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  testRunner: "vitest",
  concurrency: 1,

  mutate: ["src/services/approvalService.ts"],

  vitest: {
  configFile: "vitest.config.ts",
  related: true
},

  checkers: ["typescript"],
  tsconfigFile: "tsconfig.json",

  reporters: ["clear-text", "html", "progress"],

  coverageAnalysis: "perTest"
};

export default config;
