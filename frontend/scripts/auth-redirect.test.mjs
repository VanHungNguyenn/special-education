import { test } from "node:test";
import assert from "node:assert/strict";
import { safeNext } from "../src/features/auth/redirect.ts";

test("safeNext keeps internal paths with their query", () => {
  assert.equal(safeNext("/portal?tab=reports"), "/portal?tab=reports");
  assert.equal(safeNext("/portal"), "/portal");
});

test("safeNext falls back to /portal for missing or external targets", () => {
  for (const next of [null, "", "https://evil.com", "//evil.com", "/\\evil.com", "portal", "javascript:alert(1)"]) assert.equal(safeNext(next), "/portal");
});
