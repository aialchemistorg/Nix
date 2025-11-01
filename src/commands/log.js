import fs from "fs";
import path from "path";
import { showBanner, moveBelowBanner } from "../utils/banner.js";

const purple = "\x1b[35m";
const magenta = "\x1b[95m";
const cyan = "\x1b[96m";
const white = "\x1b[97m";
const bold = "\x1b[1m";
const dim = "\x1b[2m";
const reset = "\x1b[0m";

// Smooth animated printing
async function printLines(lines, delay = 60) {
  for (const line of lines) {
    console.log(line);
    await new Promise((r) => setTimeout(r, delay));
  }
}

export default async function log() {
  await showBanner("NIX COMMIT HISTORY", true);
  moveBelowBanner();

  const logPath = path.join(process.cwd(), ".nix/log.json");

  if (!fs.existsSync(logPath)) {
    const emptyMsg = [
      `${magenta}${bold}──────────────────────────────────────────────${reset}`,
      `${white}${bold}⚠ No commits yet!${reset}`,
      `${dim}Your Nix timeline is waiting for its first story...${reset}`,
      `${magenta}${bold}──────────────────────────────────────────────${reset}\n`,
    ];
    await printLines(emptyMsg, 90);
    return;
  }

  const logs = JSON.parse(fs.readFileSync(logPath, "utf8"));
  logs.sort((a, b) => new Date(b.date) - new Date(a.date)); // latest first

  if (logs.length === 0) {
    console.log(`${magenta}${bold}No commits recorded yet.${reset}`);
    return;
  }

  const header = [
    `${magenta}${bold}──────────────────────────────────────────────${reset}`,
    `${purple}${bold}📜 COMMIT LOGS (${logs.length} total)${reset}`,
    `${magenta}${bold}──────────────────────────────────────────────${reset}\n`,
  ];
  await printLines(header, 70);

  // Animated commit entries
  for (const [i, log] of logs.entries()) {
    const time = new Date(log.date).toLocaleString();
    const lines = [
      `${cyan}${bold}#${logs.length - i}${reset}  ${white}${log.message}${reset}`,
      `${dim}   → ${log.id}${reset}`,
      `${magenta}   🕒 ${time}${reset}\n`,
    ];
    await printLines(lines, 50);
  }

  const footer = [
    `${magenta}${bold}──────────────────────────────────────────────${reset}`,
    `${purple}${bold}💡 Tip:${reset} Use ${white}nix show <id>${reset} to view details of a commit.`,
    `${magenta}${bold}──────────────────────────────────────────────${reset}\n`,
  ];
  await printLines(footer, 80);
}
