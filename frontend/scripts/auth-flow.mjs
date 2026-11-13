import { chromium } from "playwright";
import { CHECK_EMAIL, CHECK_PASSWORD } from "./login.mjs";

const base = process.argv[2] || "http://localhost:3000";
const browser = await chromium.launch();
let problems = 0;
const check = (ok, message) => { if (!ok) problems++; console.log(`  ${ok ? "✓" : "✗"} ${message}`); };

try {
  const health = await fetch(new URL("/api/v1/health", base), { signal: AbortSignal.timeout(10_000) }).then((response) => response.status, () => 0);
  if (health !== 200) throw new Error(`/api/v1/health trả về ${health || "không kết nối được"}: backend có đang chạy không?`);

  const context = await browser.newContext({ viewport: { width: 1280, height: 860 } });
  const page = await context.newPage();
  const path = () => { const url = new URL(page.url()); return url.pathname + url.search; };

  await page.goto(new URL("/portal?tab=reports", base).href);
  check(path() === "/login?next=%2Fportal%3Ftab%3Dreports", `chưa đăng nhập thì /portal chuyển về ${path()}`);

  await page.fill("#email", CHECK_EMAIL);
  await page.fill("#password", CHECK_PASSWORD);
  await page.getByLabel("Ghi nhớ đăng nhập").uncheck();
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.waitForURL("**/portal?tab=reports", { timeout: 15_000 });
  check(true, `đăng nhập ${CHECK_EMAIL} quay về /portal?tab=reports`);

  const cookie = (await context.cookies()).find((item) => item.name === "sid");
  check(Boolean(cookie?.httpOnly) && cookie?.sameSite === "Lax" && cookie?.expires === -1, "cookie sid: HttpOnly, SameSite=Lax, hết khi đóng trình duyệt (không tích Ghi nhớ)");

  const me = await context.request.get(new URL("/api/v1/auth/me", base).href).then((response) => response.json());
  await page.reload();
  await page.getByText(me.fullName).first().waitFor({ timeout: 10_000 });
  check(path() === "/portal?tab=reports", `tải lại trang vẫn đăng nhập (${me.fullName})`);

  await page.locator("[data-slot=dropdown-menu-trigger]:visible").first().click();
  await page.getByRole("menuitem", { name: "Đăng xuất" }).click();
  await page.waitForURL("**/login", { timeout: 10_000 });
  check(true, "đăng xuất về /login");
  check((await context.request.get(new URL("/api/v1/auth/me", base).href)).status() === 401, "sau đăng xuất /api/v1/auth/me trả về 401");
  await page.goto(new URL("/portal", base).href);
  check(path().startsWith("/login"), "sau đăng xuất vào /portal bị chuyển về /login");
} catch (error) {
  problems++;
  console.log(`  ✗ ${error.message.split("\n")[0]}`);
} finally {
  await browser.close();
}

console.log(problems ? `\n✗ ${problems} problem(s)` : "\n✓ auth flow ok");
process.exit(problems ? 1 : 0);
