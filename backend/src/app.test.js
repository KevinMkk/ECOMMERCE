import test from "node:test";
import assert from "node:assert/strict";
import { store } from "./services/store.js";

test("seed data loads products and users", () => {
  assert.ok(store.products.length >= 4);
  assert.ok(store.users.some((user) => user.role === "admin"));
});
