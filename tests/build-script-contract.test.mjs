import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("Windows build keeps the public timezone while using a D-local no-timezone overlay", async () => {
  const source = await readFile("scripts/build-site.ps1", "utf8");
  assert.match(source, /\.test-output\\local-jekyll\.yml/iu);
  assert.match(source, /WriteAllText[\s\S]*timezone:\s*false/iu);
  assert.match(source, /ConfigFiles[\s\S]*--config\s+\$ConfigFiles/iu);
  assert.match(source, /\.local-tools\\gems\\bin\\bundle/iu);
  assert.match(source, /GeneratedRobots[\s\S]*Remove-Item/iu);
  assert.doesNotMatch(source, /C:\\/iu);
});
