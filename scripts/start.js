const { spawn } = require("child_process");

const port = process.env.PORT || 3000;
const child = spawn("npx", ["next", "start", "-p", String(port)], {
  stdio: "inherit",
});
child.on("exit", (code) => process.exit(code ?? 0));
