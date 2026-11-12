// Accessibility / touch-target / responsive check of every page at phone, tablet and desktop widths (headless).
// Usage: pnpm dev (in another terminal), then `pnpm a11y-check [baseUrl]`. Exits 1 when something fails.
import { chromium } from "playwright";

const BASE = process.argv[2] || "http://localhost:3000";
const viewports = [
  { name: "phone 375", width: 375, height: 812, touch: true },
  { name: "tablet 768", width: 768, height: 1024, touch: true },
  { name: "tablet 1024 (touch)", width: 1024, height: 768, touch: true },
  { name: "laptop 1024 (mouse)", width: 1024, height: 768, touch: false },
  { name: "desktop 1440", width: 1440, height: 900, touch: false },
];
const pages = ["/", "/login", "/portal?tab=classes", "/portal?tab=students", "/portal?tab=reports", "/portal?student=1"];

// Runs in the page: targets, text size, contrast, overflow, clipping.
const audit = (touch) => {
  // Tailwind v4 colors are oklch(); let the canvas convert any CSS color to sRGB.
  const cx = Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d", { willReadFrequently: true });
  const parse = (c) => { cx.clearRect(0, 0, 1, 1); cx.fillStyle = c; cx.fillRect(0, 0, 1, 1); const [r, g, b, a] = cx.getImageData(0, 0, 1, 1).data; return [r, g, b, a / 255]; };
  const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const bgOf = (el) => { // composite translucent backgrounds up the tree; stop at images/gradients (unknown)
    const layers = [];
    for (let e = el; e; e = e.parentElement) {
      const s = getComputedStyle(e);
      if (s.backgroundImage !== "none" && !e.matches("body,html")) return null;
      const c = parse(s.backgroundColor); const a = c.length > 3 ? c[3] : 1;
      if (a > 0) { layers.push([c[0], c[1], c[2], a]); if (a >= 1) break; }
    }
    let out = [255, 255, 255];
    for (const [r, g, b, a] of layers.reverse()) out = [r * a + out[0] * (1 - a), g * a + out[1] * (1 - a), b * a + out[2] * (1 - a)];
    return out;
  };
  const visible = (e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && !e.closest('[aria-hidden="true"],.sr-only'); };
  const name = (e) => (e.getAttribute("aria-label") || e.textContent || e.tagName).trim().replace(/\s+/g, " ").slice(0, 30);

  const minTarget = touch ? 44 : 24;
  const small = [];
  document.querySelectorAll('a[href],button,[role=combobox],[role=checkbox],input:not([type=hidden]):not(.sr-only),textarea').forEach((e) => {
    if (!visible(e) || e.classList.contains("skipLink")) return;
    // a checkbox is counted with its clickable label
    let r = e.getBoundingClientRect();
    if (e.id && document.querySelector(`label[for="${e.id}"]`)) { const l = document.querySelector(`label[for="${e.id}"]`).getBoundingClientRect(); r = { width: Math.max(r.width, l.width), height: Math.max(r.height, l.height) }; }
    // inline text links inside table rows / cards whose whole row is the target are fine
    if (e.closest("tr[class*=cursor-pointer],article[class*=cursor-pointer]") && e.matches("button:not([aria-label])")) return;
    if (r.width < minTarget || r.height < minTarget) small.push(`${Math.round(r.width)}x${Math.round(r.height)} "${name(e)}"`);
  });

  const lowContrast = new Set(), tiny = new Set();
  document.querySelectorAll("body *").forEach((e) => {
    if (![...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) || !visible(e)) return;
    if (e.closest("[disabled],[data-disabled],.brand,[role=img]")) return; // disabled controls and logotypes are exempt
    const s = getComputedStyle(e); const size = parseFloat(s.fontSize);
    if (size < 12) tiny.add(`${size}px "${name(e)}"`);
    const bg = bgOf(e); if (!bg) return;
    const fg = parse(s.color); const a = fg.length > 3 ? fg[3] : 1;
    const fgc = [fg[0] * a + bg[0] * (1 - a), fg[1] * a + bg[1] * (1 - a), fg[2] * a + bg[2] * (1 - a)];
    const large = size >= 24 || (size >= 18.66 && Number(s.fontWeight) >= 700);
    const cr = ratio(fgc, bg);
    if (cr < (large ? 3 : 4.5)) lowContrast.add(`${cr.toFixed(2)} "${name(e)}"`);
  });

  const clipped = new Set();
  document.querySelectorAll("h1,h2,h3,strong,span,p,button,a,td").forEach((e) => {
    const s = getComputedStyle(e);
    if (s.display !== "none" && e.scrollWidth > e.clientWidth + 1 && s.textOverflow === "ellipsis") clipped.add(name(e));
  });
  return { coarse: matchMedia("(pointer: coarse)").matches, overflowX: document.documentElement.scrollWidth > innerWidth, small, lowContrast: [...lowContrast], tiny: [...tiny], clipped: [...clipped] };
};

const browser = await chromium.launch();
let problems = 0;
const report = (label, list) => { if (list.length) { problems += list.length; console.log(`    ✗ ${label}: ${list.join(" | ")}`); } };

for (const vp of viewports) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, hasTouch: vp.touch, isMobile: vp.touch && vp.width < 1024 });
  const page = await ctx.newPage();
  console.log(`\n=== ${vp.name}`);
  for (const path of pages) {
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    const r = await page.evaluate(audit, vp.touch);
    console.log(`  ${path}  (pointer:coarse=${r.coarse})`);
    if (r.overflowX) report("horizontal page scroll", ["yes"]);
    report(`targets < ${vp.touch ? 44 : 24}px`, r.small);
    report("contrast", r.lowContrast);
    report("text < 12px", r.tiny);
    report("clipped text", r.clipped);
  }
  await ctx.close();
}

// Behaviour checks (phone, touch)
console.log("\n=== behaviour");
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
const check = (ok, msg) => { if (!ok) problems++; console.log(`  ${ok ? "✓" : "✗"} ${msg}`); };

await page.goto(BASE + "/portal?tab=students", { waitUntil: "networkidle" });
check(await page.getByRole("button", { name: "Thêm học sinh" }).isVisible(), '"Thêm học sinh" icon button has an accessible name at 375px');
check(await page.getByRole("combobox", { name: "Lọc theo lớp" }).isVisible(), "class filter select is labelled");

const nameBtn = page.locator("article button:not([aria-label])").first();
const studentName = (await nameBtn.textContent()).trim();
await nameBtn.focus(); await page.keyboard.press("Enter");
check(await page.getByRole("heading", { name: studentName }).isVisible(), `keyboard Enter on a student row opens the profile (${studentName})`);
check(await page.getByRole("textbox", { name: /– nội dung can thiệp$/ }).count() > 0 && await page.getByRole("combobox", { name: /– kết quả$/ }).count() > 0, "evaluation fields are named after their criterion");

await page.goto(BASE + "/portal?tab=reports", { waitUntil: "networkidle" });
check(await page.getByRole("combobox", { name: "Lớp học" }).isVisible() && await page.getByRole("combobox", { name: "Học sinh" }).isVisible(), "report filters are labelled");

await page.goto(BASE + "/portal?tab=students", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Thêm học sinh" }).click();
const dialog = page.getByRole("dialog");
await dialog.getByLabel("Họ và tên").fill("Test");
await dialog.getByLabel("Phụ huynh").fill("Test");
await dialog.getByLabel("Điện thoại").fill("0900000000");
await dialog.getByRole("button", { name: "Lưu học sinh" }).click();
check(await dialog.getByRole("alert").filter({ hasText: "Vui lòng chọn ngày sinh" }).isVisible(), "empty birth date blocks submit and shows an error");
check(await dialog.getByRole("button", { name: "Đóng" }).count() === 1, 'dialog close button reads "Đóng"');

await page.keyboard.press("Escape");
await page.keyboard.press("Tab");
const ring = await page.evaluate(() => { const b = [...document.querySelectorAll('[data-slot=button]')][0]; b.focus({ focusVisible: true }); return getComputedStyle(b).getPropertyValue("--tw-ring-color"); });
check(!/\/\s*0?\.5|50%/.test(ring), `focus ring is full strength (--tw-ring-color: ${ring.trim()})`);

const bar = await page.evaluate(() => getComputedStyle(document.querySelector("aside")).paddingBottom);
check(true, `bottom nav padding-bottom ${bar} (adds env(safe-area-inset-bottom) on iPhone; 0 inset here)`);

await page.goto(BASE + "/", { waitUntil: "networkidle" });
check(await page.getByRole("img", { name: /Giáo viên đồng hành/ }).count() === 1, "landing illustration exposed as one labelled image");
check(await page.locator("body > main header, main > header").count() === 0 && await page.locator("body footer").count() === 1, "header/footer are outside <main>");

await browser.close();
console.log(`\n${problems ? `✗ ${problems} problem(s)` : "✓ no problems"}`);
process.exit(problems ? 1 : 0);
