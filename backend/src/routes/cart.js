import express from "express";
import { requireAuth } from "../utils/auth.js";
import { saveStore, store } from "../services/store.js";

const router = express.Router();

const getCartResponse = (userId) => {
  const cartItems = store.carts[userId] ?? [];
  const items = cartItems
    .map((entry) => {
      const product = store.products.find((item) => item.id === entry.productId);
      return product ? { ...entry, product, subtotal: product.price * entry.quantity } : null;
    })
    .filter(Boolean);
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);
  return { items, total };
};

router.get("/", requireAuth, (req, res) => {
  res.json(getCartResponse(req.user.id));
});

router.post("/", requireAuth, (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = store.products.find((item) => item.id === productId);

  if (!product) {
    return res.status(404).json({ message: "Product not found." });
  }

  if (!store.carts[req.user.id]) {
    store.carts[req.user.id] = [];
  }

  const existing = store.carts[req.user.id].find((item) => item.productId === productId);
  if (existing) {
    existing.quantity += Number(quantity);
  } else {
    store.carts[req.user.id].push({ productId, quantity: Number(quantity) });
  }

  saveStore();
  return res.status(201).json(getCartResponse(req.user.id));
});

router.put("/:productId", requireAuth, (req, res) => {
  const quantity = Number(req.body.quantity);
  const items = store.carts[req.user.id] ?? [];
  const item = items.find((entry) => entry.productId === req.params.productId);

  if (!item) {
    return res.status(404).json({ message: "Cart item not found." });
  }

  item.quantity = quantity;
  store.carts[req.user.id] = items.filter((entry) => entry.quantity > 0);
  saveStore();
  return res.json(getCartResponse(req.user.id));
});

router.delete("/:productId", requireAuth, (req, res) => {
  const items = store.carts[req.user.id] ?? [];
  store.carts[req.user.id] = items.filter((entry) => entry.productId !== req.params.productId);
  saveStore();
  return res.json(getCartResponse(req.user.id));
});

export default router;
