import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("academic visual system is responsive, accessible, and A4 printable", async () => {
  const source = await readFile("_sass/_academic.scss", "utf8");
  for (const color of ["#132238", "#242a33", "#8f1d2c", "#faf7f2", "#ffffff", "#d8d1c7"]) {
    assert.match(source, new RegExp(color, "iu"));
  }
  assert.match(source, /grid-template-columns/iu);
  assert.match(source, /overflow-wrap:\s*anywhere/iu);
  assert.match(source, /:focus-visible/iu);
  assert.match(source, /@media\s*\(min-width:\s*48rem\)/iu);
  assert.match(source, /@media\s*\(min-width:\s*64rem\)/iu);
  assert.match(source, /prefers-reduced-motion:\s*reduce/iu);
  assert.match(source, /@media\s+print/iu);
  assert.match(source, /@page[\s\S]*size:\s*A4/iu);
  assert.match(source, /break-inside:\s*avoid/iu);
  assert.doesNotMatch(source, /linear-gradient|radial-gradient|@keyframes|https?:\/\//iu);
});
