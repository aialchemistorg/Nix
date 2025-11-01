import fs from "fs";
import path from "path";
import crypto from "crypto";
import { showBanner, moveBelowBanner } from "../utils/banner.js";

// Spinner animation while scanning
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

// Animated line printer
async function printLines(lines, delay = 70) {
  for (const line of lines) {
    console.log(line);
    await new Promise((r) => setTimeout(r, delay));
  }
}

// Hashing helper
function hashFile(file) {
  const data = fs.readFileSync(file);
  return crypto.createHash("sha1").update(data).digest("hex");
}

// Recursively get all project files (ignoring .nix & node_modules)
function getAllFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (entry === ".nix" || entry === "node_modules") continue;
      files.push(...getAllFiles(fullPath));
    } else {
      files.push(path.relative(process.cwd(), fullPath));
    }
  }
  return files;
}

// Main Status Command
export default async function status() {
  // Clear the entire terminal before showing banner
  console.clear();

  const purple = "\x1b[35m";
  const magenta = "\x1b[95m";
  const cyan = "\x1b[96m";
  const white = "\x1b[97m";
  const bold = "\x1b[1m";
  const reset = "\x1b[0m";

  const nixDir = path.join(process.cwd(), ".nix");
  const indexFile = path.join(nixDir, "index.json");

  if (!fs.existsSync(nixDir)) {
    console.log(`${magenta}${bold}✖ Not a Nix repository. Run 'nix init' first.${reset}`);
    return;
  }

  await showBanner("NIX STATUS DASHBOARD", false);
  moveBelowBanner();

  const stopSpinner = startSpinner("Analyzing project state");
  const tracked = fs.existsSync(indexFile)
    ? JSON.parse(fs.readFileSync(indexFile, "utf8"))
    : [];

  const allFiles = getAllFiles(process.cwd());
  const staged = [];
  const unstaged = [];
  const untracked = [];

  for (const file of allFiles) {
    const trackedEntry = tracked.find((t) => t.path === file);
    if (!trackedEntry) {
      untracked.push(file);
    } else {
      const currentHash = hashFile(file);
      if (currentHash !== trackedEntry.hash) unstaged.push(file);
      else staged.push(file);
    }
  }

  await new Promise((r) => setTimeout(r, 900));
  stopSpinner();

  const total = staged.length + unstaged.length + untracked.length;

  const summaryHeader = [
    `${magenta}${bold}\n──────────────────────────────────────────────${reset}`,
    `${purple}${bold}📊 WORKSPACE SUMMARY${reset}`,
    `${magenta}${bold}──────────────────────────────────────────────${reset}`,
    `${white}${bold}Total Files Scanned:${reset} ${magenta}${total}${reset}`,
    `${white}${bold}Staged:${reset} ${purple}${staged.length}${reset} | ${white}${bold}Unstaged:${reset} ${magenta}${unstaged.length}${reset} | ${white}${bold}Untracked:${reset} ${cyan}${untracked.length}${reset}\n`,
  ];
  await printLines(summaryHeader, 70);

  if (staged.length) {
    await printLines([
      `${purple}${bold}📁 STAGED FILES${reset}`,
      `${staged.map(f => `${white}  ↳ ${f}${reset}`).join("\n")}\n`,
    ], 20);
  }

  if (unstaged.length) {
    await printLines([
      `${magenta}${bold}⚙️  UNSTAGED CHANGES${reset}`,
      `${unstaged.map(f => `${white}  ↳ ${f}${reset}`).join("\n")}\n`,
    ], 20);
  }

  if (untracked.length) {
    await printLines([
      `${cyan}${bold}🆕 UNTRACKED FILES${reset}`,
      `${untracked.map(f => `${white}  ↳ ${f}${reset}`).join("\n")}\n`,
    ], 20);
  }

  if (!staged.length && !unstaged.length && !untracked.length) {
    await printLines([
      `${white}${bold}✔ Working directory clean.${reset}\n`,
    ], 60);
  }

  const footer = [
    `${magenta}${bold}──────────────────────────────────────────────${reset}`,
    `${purple}${bold}💡 Next Steps:${reset}`,
    `${white}- Use ${magenta}nix add <file>${reset} to stage new files.`,
    `${white}- Use ${magenta}nix commit -m "msg"${reset} to save changes.`,
    `${magenta}${bold}──────────────────────────────────────────────${reset}\n`,
  ];
  await printLines(footer, 70);
}
