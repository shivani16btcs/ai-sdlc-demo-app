import { spawnSync } from "node:child_process";

const isWindows = process.platform === "win32";
const npmExecutable = isWindows ? "npm.cmd" : "npm";

for (const args of [["run", "build"], ["test"]]) {
  const command = `npm ${args.join(" ")}`;
  const executable = isWindows ? process.env.ComSpec ?? "cmd.exe" : npmExecutable;
  const commandArgs = isWindows
    ? ["/d", "/s", "/c", `${npmExecutable} ${args.join(" ")}`]
    : args;
  const result = spawnSync(executable, commandArgs, {
    cwd: process.cwd(),
    encoding: "utf8",
    windowsHide: true,
  });

  if (result.stdout) {
    process.stderr.write(result.stdout);
  }

  if (result.stderr) {
    process.stderr.write(result.stderr);
  }

  if (result.error || result.status !== 0) {
    const detail = result.error?.message ?? `exit code ${result.status}`;
    process.stdout.write(
      `${JSON.stringify({
        decision: "block",
        reason: `${command} failed (${detail}); fix the checks before completing the implementation-agent turn.`,
      })}\n`,
    );
    process.exitCode = 0;
    break;
  }
}

if (process.exitCode !== 0) {
  process.stdout.write("{}\n");
}
