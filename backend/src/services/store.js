import { productCategories, products as seedProducts, users as seedUsers } from "../data/seed.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const clone = (value) => JSON.parse(JSON.stringify(value));
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const runtimeStorePath = path.resolve(__dirname, "../data/runtime-store.json");

const loadRuntimeStore = () => {
  if (!fs.existsSync(runtimeStorePath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(runtimeStorePath, "utf8"));
  } catch {
    return null;
  }
};

const persistedStore = loadRuntimeStore();

export const store = {
  categories: persistedStore?.categories ?? clone(productCategories),
  products: persistedStore?.products ?? clone(seedProducts),
  users: persistedStore?.users ?? clone(seedUsers),
  carts: persistedStore?.carts ?? {},
  orders: persistedStore?.orders ?? []
};

export const generateId = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

export const sanitizeUser = (user) => {
  const { password, ...safeUser } = user;
  return safeUser;
};

export const saveStore = () => {
  fs.writeFileSync(runtimeStorePath, JSON.stringify(store, null, 2));
};
