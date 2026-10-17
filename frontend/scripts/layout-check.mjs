// Responsive check across many widths: horizontal overflow, elements pushed off-screen,
// side-by-side blocks that overlap or sit closer than MIN_GAP, and decorations covering text.
// Usage: pnpm dev (in another terminal), then `pnpm layout-check [baseUrl]`
import { chromium } from "playwright";

const base = process.argv[2] || "http://localhost:3000";
const MIN_GAP = 24;
const widths = [320, 360, 375, 414, 480, 540, 600, 620, 700, 768, 820, 900, 960, 1024, 1100, 1180, 1280, 1440, 1920];

// Pairs of selectors whose elements must not overlap when they share a row.
// CSS-module pages (login) use [class*=name] because class names are hashed.
const checks = {
  "/": [
    [".heroCopy > *", ".heroArt .photoFrame, .heroArt .quoteCard"],
    [".visit > div", ".visit > a"],
    ["footer > a", "footer > p"], ["footer > p", "footer > span"],
    [".community > div", ".momentCard"],
    [".siteHeader .brand", ".headerActions"],
  ],
  "/login": [
    ["[class*=introCopy] > *", "[class*=formBox] > *"],
    ["[class*=quote]", "[class*=pattern], [class*=pattern] i"],
    ["[class*=introCopy] h1, [class*=introCopy] > p", "[class*=pattern], [class*=pattern] i"],
  ],
};

const browser = await chromium.launch();
let problems = 0;
for (const [path, pairs] of Object.entries(checks)) {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(new URL(path, base).href, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const found = await page.evaluate(({ pairs, minGap }) => {
      const out = [];
      const vw = document.documentElement.clientWidth;
      const overflow = document.documentElement.scrollWidth - vw;
      if (overflow > 0) out.push(`horizontal overflow ${overflow}px`);
      const box = (el) => el.getBoundingClientRect();
      const label = (el) => String(el.className || el.tagName).split(" ")[0].replace(/^.*__/, "").slice(0, 20);
      for (const [left, right] of pairs) {
        for (const a of document.querySelectorAll(left)) for (const b of document.querySelectorAll(right)) {
          if (a === b || a.contains(b) || b.contains(a)) continue;
          const r1 = box(a), r2 = box(b);
          if (!r1.width || !r2.width) continue;
          const sameRow = r1.top < r2.bottom && r2.top < r1.bottom;
          const gap = Math.max(r2.left - r1.right, r1.left - r2.right);
          if (sameRow && gap < minGap) out.push(`${label(a)} ~ ${label(b)}: gap ${Math.round(gap)}px`);
        }
      }
      for (const el of document.querySelectorAll("body *")) {
        const r = box(el);
        if (r.width && (r.right > vw + 0.5 || r.left < -0.5) && getComputedStyle(el).position !== "fixed") { out.push(`off-screen ${label(el)} [${Math.round(r.left)}..${Math.round(r.right)}]`); break; }
      }
      return [...new Set(out)];
    }, { pairs, minGap: MIN_GAP });
    if (found.length) { problems += found.length; console.log(`✗ ${path} @${width}: ${found.join(" | ")}`); }
    await page.close();
  }
}
await browser.close();
console.log(`\nChecked ${Object.keys(checks).length} pages × ${widths.length} widths (${problems} problem${problems === 1 ? "" : "s"})`);
process.exitCode = problems ? 1 : 0;
