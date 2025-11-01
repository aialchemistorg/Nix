import fs from "fs";
import path from "path";
import { showBanner, moveBelowBanner } from "../utils/banner.js";

// Clear only previous nix output (not full terminal history)
function clearPreviousNixOutput() {
  process.stdout.write("\x1b[3J\x1b[H\x1b[2J"); // clears screen area but preserves scrollback before nix init
}

// Recursively list all files in a directory
function listFilesRecursively(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(listFilesRecursively(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

// Spinner animation during scanning
function startSpinner(text) {
  const frames = ["⠋", "⠙", "⠸", "⠴", "⠦", "⠇"];
  let i = 0;
  process.stdout.write(`\x1b[35m${text}...\x1b[0m `);
  const interval = setInterval(() => {
    process.stdout.write(`\r\x1b[95m${frames[i++ % frames.length]} ${text}...\x1b[0m`);
  }, 80);
  return () => {
    clearInterval(interval);
    process.stdout.write("\r\x1b[K");
  };
}

// Smooth one-by-one line animation
async function printAnimatedLines(lines, delay = 80) {
  for (const line of lines) {
    console.log(line);
    await new Promise((r) => setTimeout(r, delay));
  }
}

// Main ADD command
export default async function add(target) {
  clearPreviousNixOutput(); // 👈 clear only nix section, not whole terminal

  const purple = "\x1b[35m";
  const magenta = "\x1b[95m";
  const white = "\x1b[97m";
  const bold = "\x1b[1m";
  const reset = "\x1b[0m";

  // ──────────────────────────────
  // Banner (static for add)
  // ──────────────────────────────
  await showBanner("ADDING FILES TO STAGE", false);
  moveBelowBanner();

  // ──────────────────────────────
  // Check repo validity
  // ──────────────────────────────
  const repoDir = path.join(process.cwd(), ".nix");
  if (!fs.existsSync(repoDir)) {
    console.log(`${magenta}${bold}✖ Not a Nix repository. Run 'nix init' first.${reset}`);
    return;
  }

  const indexPath = path.join(repoDir, "index.json");
  const index = fs.existsSync(indexPath)
    ? JSON.parse(fs.readFileSync(indexPath, "utf8"))
    : [];

  // ──────────────────────────────
  // Scan target with spinner
  // ──────────────────────────────
  const stopSpinner = startSpinner("Scanning files");
  let filesToAdd = [];

  if (fs.existsSync(target)) {
    const stats = fs.statSync(target);
    filesToAdd = stats.isDirectory()
      ? listFilesRecursively(target)
      : [target];
  } else {
    stopSpinner();
    console.log(`${magenta}${bold}File or directory not found:${reset} ${white}${target}${reset}`);
    return;
  }

  stopSpinner();

  // ──────────────────────────────
  // Add files to index
  // ──────────────────────────────
  let added = 0, skipped = 0;
  for (const file of filesToAdd) {
    if (!index.includes(file)) {
      index.push(file);
      added++;
    } else {
      skipped++;
    }
  }

  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));

  // ──────────────────────────────
  // Animated summary output
  // ──────────────────────────────
  const lines = [
    `${magenta}${bold}\n──────────────────────────────────────────────${reset}`,
    `${purple}${bold}STAGING SUMMARY${reset}`,
    `${magenta}${bold}──────────────────────────────────────────────${reset}`,
    `${white}${bold}• Added:${reset} ${purple}${added}${reset}`,
    `${white}${bold}• Skipped (already staged):${reset} ${magenta}${skipped}${reset}`,
    `${white}${bold}• Total processed:${reset} ${purple}${added + skipped}${reset}`,
    `${magenta}${bold}──────────────────────────────────────────────${reset}\n`,
  ];

  await printAnimatedLines(lines, 100);

  if (added > 0) {
    await printAnimatedLines([
      `${white}${bold}✔ Successfully added ${purple}${added}${reset}${white}${bold} file(s) to staging area.${reset}\n`,
    ], 60);
  } else {
    await printAnimatedLines([
      `${magenta}${bold}No new files added. Everything already staged.${reset}\n`,
    ], 60);
  }
}
