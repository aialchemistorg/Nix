# NIX

A cross-platform Node.js command-line tool designed for modern developers.  
Built with simplicity, speed, and portability in mind — install once and use anywhere.

---

## 🧭 Table of Contents
- [Overview](#-overview)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Usage](#-usage)
- [Development Setup](#-development-setup)
- [Build & Distribution](#-build--distribution)
- [Support](#-support)
- [License](#-license)

---

## 📦 Overview

**nix** is a Node.js-based command-line utility built for global usage.  
Once installed, it can be executed from any terminal on **Windows, macOS, or Linux** without manual linking.

---

## 🔩 Features

- Cross-platform executable (Node 18+)
- Fully portable — no dependencies after packaging
- Structured modular code in `/src`
- Global install support with `npm link`
- Easily extendable architecture

---

## 🧱 Project Structure

```

nix/
├── bin/                 # Executable entry script
├── dist/                # Compiled distributable builds
├── node_modules/        # Dependencies
├── src/                 # Source files
│   ├── commands/        # CLI command handlers
│   └── utils/           # Helper utilities
├── package.json         # Project metadata
├── package-lock.json    # Dependency lockfile
└── README.md            # Documentation

````

---

## ⚙️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/nix.git
cd nix
````

### 2. Install Dependencies

```bash
npm install
```

### 3. Make It Executable Globally

#### Option 1 — Local Development

Link the command globally:

```bash
npm link
```

Example Command:

```bash
nix init
nix add .
```

---

## 🏗️ Build & Distribution

To compile into standalone binaries (for Linux, macOS, and Windows):

```bash
pkg . --targets node20-linux-x64,node20-macos-x64,node20-win-x64
```

> Note: Ensure your `package.json` contains `"bin": "./bin/nix"` and main entry points are properly defined.

---

## 🧩 Tech Stack

* **Language:** JavaScript (Node.js)
* **Runtime:** Node 20+
* **Bundler:** pkg
* **Platform:** Cross-platform (Linux, macOS, Windows)

---

## 🧑‍💻 Support

For issues, discussions, or contributions, open a [GitHub Issue](https://github.com/<your-username>/nix/issues) or contact the maintainer.

---

## 📄 License

This project is licensed under the **MIT License** — feel free to modify and distribute.

---

### 🧠 Author

**[Sayman Lal](https://github.com/saymanlal)**
Founder, Archeon Solutions | Developer | Open Source Enthusiast

---

> “Build tools that empower — not restrict.”
> — *nix Philosophy*
