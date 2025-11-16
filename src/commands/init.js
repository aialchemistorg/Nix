import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { showBanner, moveBelowBanner } from "../utils/banner.js";

export default async function init() {
  const dir = path.join(process.cwd(), ".nix");
  const commitsDir = path.join(dir, "commits");
  const indexFile = path.join(dir, "index.json");

  // 1. Prevent re-init
  if (fs.existsSync(dir)) {
    console.log("\x1b[33m⚠️  Repository already initialized.\x1b[0m");
    return;
  }

  // 2. Create Nix directory structure
  fs.mkdirSync(commitsDir, { recursive: true });
  fs.writeFileSync(indexFile, JSON.stringify([], null, 2));

  // 3. (REMOVED: hiding folders in VSCode)

  // 4. Sync with .nixspot ignore list
  const nixspotFile = path.join(process.cwd(), ".nixspot");
  try {
    let nixspotList = [];
    if (fs.existsSync(nixspotFile)) {
      nixspotList = fs.readFileSync(nixspotFile, "utf8")
        .split("\n")
        .filter(Boolean);
    }
    for (const folder of [".nix", ".vscode"]) {
      if (!nixspotList.includes(folder)) nixspotList.push(folder);
    }
    fs.writeFileSync(nixspotFile, nixspotList.join("\n") + "\n");
  } catch {}

  // 5. (REMOVED: Windows hidden attribute)

  // 6. Banner
  console.clear();
  await showBanner("WELCOME TO NIX", true);
  moveBelowBanner();

  // 7. Success info
  const purple = "\x1b[35m";
  const magenta = "\x1b[95m";
  const white = "\x1b[97m";
  const bold = "\x1b[1m";
  const reset = "\x1b[0m";

  console.log(`${magenta}${bold}→${reset} ${white}Normal folder   ${magenta}→${reset}  ${purple}Nix Project${reset}`);
  console.log(`${magenta}${bold}→${reset} ${white}Your project is now tracked by ${purple}Nix${reset}`);
  console.log(`${magenta}${bold}→${reset} ${white}An AI-powered commit-based rewarding system${reset}\n`);
}
