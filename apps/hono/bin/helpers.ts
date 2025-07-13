export const bunx = async (args: string[]) => {
  const proc = Bun.spawn(["bunx", ...args], {
    stdout: "inherit",
    stderr: "inherit",
    stdin: "inherit",
  });

  const code = await proc.exited;
  if (code !== 0) {
    console.error(`Command failed with exit code ${code}`);
    process.exit(code);
  } else {
    console.log("Command completed successfully.");
  }
}

export const bun = async (args: string[]) => {
  const proc = Bun.spawn(["bun", ...args], {
    stdout: "inherit",
    stderr: "inherit",
    stdin: "inherit",
  });

  const code = await proc.exited;
  if (code !== 0) {
    console.error(`Command failed with exit code ${code}`);
    process.exit(code);
  } else {
    console.log("Command completed successfully.");
  }
}
