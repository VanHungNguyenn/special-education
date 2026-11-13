import { test } from "node:test";
import assert from "node:assert/strict";
import { ApiError, request } from "../src/lib/api/http-client.ts";

const respond = (status, body) => async () => new Response(body === undefined ? null : JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

test("request sends JSON with same-origin credentials under /api/v1", async () => {
  let seen;
  const fetcher = async (url, init) => { seen = { url, init }; return new Response(JSON.stringify({ ok: true }), { status: 200 }); };
  assert.deepEqual(await request("/auth/login", { method: "POST", body: { email: "a@b.vn" }, fetcher }), { ok: true });
  assert.equal(seen.url, "/api/v1/auth/login");
  assert.equal(seen.init.method, "POST");
  assert.equal(seen.init.credentials, "same-origin");
  assert.equal(seen.init.headers["content-type"], "application/json");
  assert.equal(seen.init.body, JSON.stringify({ email: "a@b.vn" }));
});

test("request turns the backend error envelope into an ApiError", async () => {
  const body = { error: { code: "EMAIL_TAKEN", message: "Email đã được dùng cho tài khoản khác.", details: [{ field: "email", message: "x" }] } };
  await assert.rejects(request("/users", { method: "POST", body: {}, fetcher: respond(409, body) }), (error) => {
    assert.ok(error instanceof ApiError);
    assert.equal(error.status, 409);
    assert.equal(error.code, "EMAIL_TAKEN");
    assert.equal(error.message, "Email đã được dùng cho tài khoản khác.");
    assert.deepEqual(error.details, [{ field: "email", message: "x" }]);
    return true;
  });
});

test("request falls back to a generic Vietnamese message for non-JSON errors", async () => {
  const fetcher = async () => new Response("<html>Bad Gateway</html>", { status: 502 });
  await assert.rejects(request("/health", { fetcher }), { status: 502, code: "UNKNOWN_ERROR", message: "Đã có lỗi xảy ra, vui lòng thử lại sau." });
});

test("request resolves undefined for 204", async () => {
  assert.equal(await request("/auth/logout", { method: "POST", fetcher: respond(204) }), undefined);
});

test("request maps network failures to NETWORK_ERROR", async () => {
  const fetcher = async () => { throw new TypeError("fetch failed"); };
  await assert.rejects(request("/auth/me", { fetcher }), { status: 0, code: "NETWORK_ERROR" });
});
