#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import init from "./commands/init.js";
import add from "./commands/add.js";
import commit from "./commands/commit.js";
import log from "./commands/log.js";
import status from "./commands/status.js"; // 🆕 added

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const [,, cmd, ...args] = process.argv;

switch (cmd) {
  case "init":
    init();
    break;

  case "add":
    if (!args[0]) {
      console.log("Usage: nix add <filename>");
      process.exit(1);
    }
    add(args[0]);
    break;

  case "commit": {
    const msgIndex = args.indexOf("-m");
    if (msgIndex === -1 || !args[msgIndex + 1]) {
      console.log('Usage: nix commit -m "message"');
      process.exit(1);
    }
    commit(args[msgIndex + 1]);
    break;
  }

  case "log":
    log();
    break;

  case "status":
    status();
    break;

  default:
    console.log(`\nUsage: nix <command>\n`);
    console.log(`Commands:
  init              Initialize a new Nix repo
  add <file>        Stage file for commit
  commit -m "msg"   Commit staged files
  log               Show commit history
  status            Show staged/unstaged/untracked files\n`);
}
