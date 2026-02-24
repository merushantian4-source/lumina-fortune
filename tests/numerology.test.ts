import assert from "node:assert/strict";
import { destinyNumberFromBirthdate } from "../lib/numerology";

function run() {
  assert.equal(destinyNumberFromBirthdate("1990-12-25"), 2);
  assert.equal(destinyNumberFromBirthdate("2001-01-01"), 5);
  assert.equal(destinyNumberFromBirthdate("1988-08-08"), 6);
  assert.equal(destinyNumberFromBirthdate("1975-11-30"), 9);

  for (const sample of ["1990-12-25", "2026-01-01", "1964-02-29"]) {
    const value = destinyNumberFromBirthdate(sample);
    assert.ok(value >= 1 && value <= 9, `${sample} => ${value}`);
  }

  assert.throws(() => destinyNumberFromBirthdate("1990/12/25"));
  assert.throws(() => destinyNumberFromBirthdate("1990-1-2"));
}

run();
console.log("numerology.test.ts: OK");

