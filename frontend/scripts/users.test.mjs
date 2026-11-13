import { test } from "node:test";
import assert from "node:assert/strict";
import { accountStatus, generatePassword } from "../src/features/users/account.ts";

test("generatePassword returns 12 unambiguous characters and differs each time", () => {
  const first = generatePassword();
  assert.equal(first.length, 12);
  assert.match(first, /^[A-HJ-NP-Za-km-z2-9]+$/);
  assert.notEqual(first, generatePassword());
});

test("accountStatus prefers disabled, then a future lock, then active", () => {
  const now = new Date("2026-11-13T08:00:00Z");
  const user = { isActive: true, lockedUntil: null };
  assert.deepEqual(accountStatus(user, now), { kind: "active", label: "Đang hoạt động" });
  assert.deepEqual(accountStatus({ ...user, isActive: false, lockedUntil: "2026-11-13T08:10:00Z" }, now), { kind: "disabled", label: "Đã vô hiệu hóa" });
  assert.equal(accountStatus({ ...user, lockedUntil: "2026-11-13T08:10:00Z" }, now).kind, "locked");
  assert.match(accountStatus({ ...user, lockedUntil: "2026-11-13T08:10:00Z" }, now).label, /^Tạm khóa đến \d{2}:\d{2}$/);
  assert.equal(accountStatus({ ...user, lockedUntil: "2026-11-13T07:59:00Z" }, now).kind, "active");
});
