// Visual check: full-page screenshots of the main routes at common breakpoints.
// Usage: pnpm dev (in another terminal), then `pnpm screenshot [baseUrl] [--pages=/,/login] [--widths=375,1440]`
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const args = process.argv.slice(2);
const option = (name) => args.find((arg) => arg.startsWith(`--${name}=`))?.split("=")[1];
const baseUrl = args.find((arg) => !arg.startsWith("--")) || "http://localhost:3000";
const pages = (option("pages") || "/,/login,/portal").split(",");
const widths = (option("widths") || "375,768,1440").split(",").map(Number);
const outDir = new URL("../screenshots/", import.meta.url);

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();
let problems = 0;

for (const width of widths) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
  for (const path of pages) {
    const page = await context.newPage();
    const errors = [];
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto(new URL(path, baseUrl).href, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);

    const name = path === "/" ? "home" : path.replace(/^\//, "").replace(/[^a-z0-9-]+/gi, "-");
    const file = new URL(`${name}-${width}.png`, outDir);
    await page.screenshot({ path: fileURLToPath(file), fullPage: true });

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    const notes = [];
    if (overflow > 0) notes.push(`horizontal overflow ${overflow}px`);
    if (errors.length) notes.push(`console errors: ${errors.join(" | ")}`);
    problems += notes.length;
    console.log(`${notes.length ? "✗" : "✓"} ${name}-${width}.png${notes.length ? `  — ${notes.join("; ")}` : ""}`);
    await page.close();
  }
  await context.close();
}

await browser.close();
console.log(`\nSaved to frontend/screenshots/ (${problems} problem${problems === 1 ? "" : "s"})`);
process.exitCode = problems ? 1 : 0;
