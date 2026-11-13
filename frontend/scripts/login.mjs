export const CHECK_EMAIL = process.env.CHECK_EMAIL || "quanly@demo.local";
export const CHECK_PASSWORD = process.env.CHECK_PASSWORD || "demo2026";

const fail = (reason) => {
  console.error(`✗ Không đăng nhập được: ${reason}\n  Backend có đang chạy không, và đã chạy \`pnpm db:seed:demo\` trong backend/ chưa? (Đổi tài khoản bằng CHECK_EMAIL / CHECK_PASSWORD.)`);
  process.exit(1);
};

export const logIn = async (context, base) => {
  let response;
  try {
    response = await context.request.post(new URL("/api/v1/auth/login", base).href, { data: { email: CHECK_EMAIL, password: CHECK_PASSWORD }, timeout: 15_000 });
  } catch (error) {
    fail(`không gọi được ${base}/api/v1/auth/login (${error.message.split("\n")[0]})`);
  }
  if (!response.ok()) fail(`${CHECK_EMAIL} nhận HTTP ${response.status()} ${(await response.text()).slice(0, 200)}`);
};
