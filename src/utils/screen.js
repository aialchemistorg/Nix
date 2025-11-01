// Clears only the screen below where nix init began — not the entire terminal history
export function clearNixScreen() {
    process.stdout.write("\x1b[2J\x1b[H");
  }
  