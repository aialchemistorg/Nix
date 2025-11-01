import fs from "fs";
import path from "path";
import crypto from "crypto";
import { showBanner, moveBelowBanner } from "../utils/banner.js";

// Clear only Nix’s section (not the full terminal history)
function clearPreviousNixOutput() {
  process.stdout.write("\x1b[3J\x1b[H\x1b[2J"); // clears visible area but not scrollback before nix init
}

// Recursive file copy (excluding .nix/.git)
function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const file of fs.readdirSync(src)) {
      if (file === ".nix" || file === ".git") continue;
      const srcPath = path.join(src, file);
      const destPath = path.join(dest, file);
      copyRecursive(srcPath, destPath);
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

// Spinner animation
function startSpinner(text) {
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠴", "⠦", "⠧", "⠇"];
  let i = 0;
  process.stdout.write(`\x1b[35m${text}...\x1b[0m`);
  const interval = setInterval(() => {
    process.stdout.write(`\r\x1b[95m${frames[i++ % frames.length]} ${text}...\x1b[0m`);
  }, 80);
  return () => {
    clearInterval(interval);
    process.stdout.write("\r\x1b[K");
  };
}

// Smooth animated output
async function printAnimated(lines, delay = 90) {
  for (const line of lines) {
    console.log(line);
    await new Promise((r) => setTimeout(r, delay));
  }
}

export default async function commit(message) {
  clearPreviousNixOutput(); // clear only the previous nix section

  const purple = "\x1b[35m";
  const magenta = "\x1b[95m";
  const white = "\x1b[97m";
  const bold = "\x1b[1m";
  const reset = "\x1b[0m";

  await showBanner("CREATING COMMIT", false);
  moveBelowBanner();

  const dir = path.join(process.cwd(), ".nix");
  const commitsDir = path.join(dir, "commits");
  const logPath = path.join(dir, "log.json");

  if (!fs.existsSync(dir)) {
    console.log(`${magenta}${bold}✖ Not a Nix repo. Run 'nix init' first.${reset}`);
    return;
  }

  // Begin animated process
  const stopSpinner1 = startSpinner("Preparing commit workspace");
  await new Promise((r) => setTimeout(r, 600));
  stopSpinner1();

  const commitId = crypto.randomBytes(4).toString("hex");
  const commitPath = path.join(commitsDir, commitId);
  fs.mkdirSync(commitPath, { recursive: true });

  const stopSpinner2 = startSpinner("Copying project files");
  copyRecursive(process.cwd(), commitPath);
  await new Promise((r) => setTimeout(r, 900));
  stopSpinner2();

  const stopSpinner3 = startSpinner("Logging commit data");
  const logs = fs.existsSync(logPath)
    ? JSON.parse(fs.readFileSync(logPath, "utf8"))
    : [];

  logs.push({
    id: commitId,
    message: message || "No commit message",
    date: new Date().toISOString(),
  });

  fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
  await new Promise((r) => setTimeout(r, 800));
  stopSpinner3();

  // Animated summary output
  const lines = [
    `${magenta}${bold}\n──────────────────────────────────────────────${reset}`,
    `${purple}${bold}📝 COMMIT SUMMARY${reset}`,
    `${magenta}${bold}──────────────────────────────────────────────${reset}`,
    `${white}${bold}• Commit ID:${reset} ${purple}${commitId}${reset}`,
    `${white}${bold}• Message:${reset} ${magenta}${message || "No commit message"}${reset}`,
    `${white}${bold}• Date:${reset} ${purple}${new Date().toLocaleString()}${reset}`,
    `${magenta}${bold}──────────────────────────────────────────────${reset}\n`,
    `${white}${bold}✔ Commit successfully created and saved!${reset}\n`,
  ];

  await printAnimated(lines, 100);
}
