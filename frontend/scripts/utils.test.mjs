// Unit tests for the small text helpers. Run: pnpm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { classInitial, fold, nameInitial, nameInitials } from "../src/lib/utils.ts";

test("nameInitial takes the given name (last word)", () => {
  assert.equal(nameInitial("Nguyễn Minh Anh"), "A");
  assert.equal(nameInitial("  Trần Gia Huy  "), "H");
  assert.equal(nameInitial(""), "");
});

test("classInitial skips the 'Lớp' prefix only when present", () => {
  assert.equal(classInitial("Lớp Mầm Xanh"), "M");
  assert.equal(classInitial("lớp ánh dương"), "Á");
  assert.equal(classInitial("A1"), "A");
  assert.equal(classInitial("Mầm Non"), "M");
});

test("fold makes search ignore case and Vietnamese accents", () => {
  assert.ok(fold("Nguyễn Minh Anh").includes(fold("nguyen minh")));
  assert.ok(fold("Đặng Đức").includes(fold("dang duc")));
  assert.ok(!fold("Lê Hà My").includes(fold("huy")));
});

test("nameInitials takes the last two words", () => {
  assert.equal(nameInitials("Nguyễn Hà Linh"), "HL");
  assert.equal(nameInitials("  An  "), "A");
  assert.equal(nameInitials(""), "");
});
