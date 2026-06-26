import { cpSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const uvPath = join(dirname(require.resolve("@nebula-services/ultraviolet/lib/index.cjs")), "..");
const staticDir = join(process.cwd(), "static", "uv");

mkdirSync(staticDir, { recursive: true });

const uvFiles = ["uv.bundle.js", "uv.handler.js", "uv.sw.js"];
for (const f of uvFiles) {
  const src = join(uvPath, "dist", f);
  if (existsSync(src)) {
    cpSync(src, join(staticDir, f));
    console.log(`Copied ${f}`);
  } else {
    console.warn(`Warning: ${src} not found`);
  }
}
console.log("UV static files installed.");
