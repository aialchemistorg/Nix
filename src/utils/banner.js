export async function showBanner(title = "WELCOME TO NIX", animated = false) {
    const purple = "\x1b[35m";
    const magenta = "\x1b[95m";
    const white = "\x1b[97m";
    const bold = "\x1b[1m";
    const reset = "\x1b[0m";
  
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  
    const nix3D = [
      "███╗   ██╗██╗██╗  ██╗",
      "████╗  ██║██║╚██╗██╔╝",
      "██╔██╗ ██║██║ ╚███╔╝ ",
      "██║╚██╗██║██║ ██╔██╗ ",
      "██║ ╚████║██║██╔╝ ██╗",
      "╚═╝  ╚═══╝╚═╝╚═╝  ╚═╝",
    ];
  
    console.log("\n");
  
    if (animated) {
      for (const line of nix3D) {
        console.log(`${purple}${bold}${line}${reset}`);
        await sleep(60);
      }
      await sleep(200);
    } else {
      for (const line of nix3D) {
        console.log(`${purple}${bold}${line}${reset}`);
      }
    }
  
    console.log(`${magenta}${bold}\n           ⚙️  ${title} ⚙️${reset}`);
    console.log(`${white}${bold}\n──────────────────────────────────────────────${reset}\n`);
  
    // Save cursor position below banner
    process.stdout.write("\x1b[s");
  }
  
  export function moveBelowBanner() {
    process.stdout.write("\x1b[u");
    process.stdout.write("\x1b[1B");
  }
  