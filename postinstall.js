import { cpSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const staticDir = join(process.cwd(), "static", "uv");
mkdirSync(staticDir, { recursive: true });

// Try multiple possible locations for UV dist files
const uvBaseCandidates = [
  join(process.cwd(), "node_modules", "@nebula-services", "ultraviolet", "dist"),
  join(process.cwd(), "node_modules", "@nebula-services", "ultraviolet"),
  join(process.cwd(), "node_modules", "ultraviolet-static", "dist"),
];

let uvBase = null;
for (const candidate of uvBaseCandidates) {
  if (existsSync(candidate)) {
    const files = readdirSync(candidate);
    if (files.some(f => f.includes("uv.bundle"))) {
      uvBase = candidate;
      break;
    }
  }
}

if (!uvBase) {
  console.warn("Warning: Could not find UV dist files. Proxy may not work.");
  process.exit(0);
}

const uvFiles = ["uv.bundle.js", "uv.handler.js", "uv.sw.js"];
for (const f of uvFiles) {
  const src = join(uvBase, f);
  if (existsSync(src)) {
    cpSync(src, join(staticDir, f));
    console.log(`Copied ${f} -> static/uv/${f}`);
  } else {
    console.warn(`Warning: ${src} not found`);
  }
}
console.log("UV static files installed.");
