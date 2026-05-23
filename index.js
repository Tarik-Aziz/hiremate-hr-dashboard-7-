import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// We check if node_modules exists, and also check if express is actually installed
const needsInstall = !fs.existsSync(path.join(__dirname, "node_modules")) || 
                     !fs.existsSync(path.join(__dirname, "node_modules", "express"));

if (needsInstall) {
  console.log("=====================================================================");
  console.log("📦 [Auto-Installer] node_modules or dependencies are missing!");
  console.log("⚡ Running 'npm install' automatically to set up the environment...");
  console.log("=====================================================================\n");
  
  try {
    execSync("npm install", { stdio: "inherit", cwd: __dirname });
    console.log("\n=====================================================================");
    console.log("✅ [Auto-Installer] Dependencies installed successfully!");
    console.log("🚀 Launching HireMate HR Dashboard Server...");
    console.log("=====================================================================\n");
  } catch (err) {
    console.error("\n❌ [Auto-Installer] Failed to run 'npm install'.");
    console.error("Please run 'npm install' manually in your VS Code terminal first.");
    console.error(err);
    process.exit(1);
  }
}

// Dynamically import the rest of the application. 
// This prevents Node.js from trying to parse static imports of uninstalled packages upfront.
await import("./index-real.js");
