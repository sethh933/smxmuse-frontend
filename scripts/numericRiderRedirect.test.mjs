import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { numericRiderDestination } from "../src/numericRiderRedirect.js";

test("legacy sections preserve filters and anchors", () => {
  for (const suffix of ["", "/results", "/points"]) {
    assert.equal(numericRiderDestination({ pathname: `/rider/1755${suffix}/`,
      search: "?discipline=MX&year=2025", hash: "#career" }, "1755", "Jett Lawrence"),
    `/rider/jett-lawrence-1755${suffix}?discipline=MX&year=2025#career`);
  }
});

test("unknown identities, mismatched riders, named pages and API paths never redirect", () => {
  for (const path of ["/rider/jett-lawrence-1755", "/rider/1755/profile", "/rider/1755/race-results", "/api/rider/1755", "/rider/746"]) {
    assert.equal(numericRiderDestination({ pathname: path }, "1755", "Jett Lawrence"), null);
  }
  for (const name of [undefined, "", "   "]) {
    assert.equal(numericRiderDestination({ pathname: "/rider/1755" }, "1755", name), null);
  }
});

test("hosting rules preserve rider identity and section without wildcard API interception", async () => {
  const raw = await readFile(new URL("../public/staticwebapp.config.json", import.meta.url), "utf8");
  assert.ok(Buffer.byteLength(raw) < 20000);
  const config = JSON.parse(raw);
  const rules = config.routes.filter(r => r.route.startsWith("/rider/"));
  assert.equal(rules.length, 15);
  assert.equal(new Set(rules.map(r => r.route)).size, rules.length);
  for (const rule of rules) {
    const source = rule.route.match(/^\/rider\/(\d+)(\/(?:results|points))?\/index\.html$/);
    assert.ok(source);
    assert.equal(rule.statusCode, 301);
    assert.ok(rule.redirect.endsWith(`-${source[1]}${source[2] || ""}`));
    assert.ok(!rule.redirect.includes("*"));
  }
  assert.equal(config.navigationFallback.rewrite, "/spa-shell.html");
  assert.ok(config.routes.some(r => r.route === "/sitemap.xml"));
});
