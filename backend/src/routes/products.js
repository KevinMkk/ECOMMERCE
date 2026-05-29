import express from "express";
import { requireAdmin } from "../utils/auth.js";
import { generateId, saveStore, store } from "../services/store.js";

const router = express.Router();

router.get("/", (req, res) => {
  const { search = "", category, minPrice, maxPrice } = req.query;
  const searchText = String(search).toLowerCase();

  const items = store.products.filter((product) => {
    const matchesSearch =
      !searchText ||
      product.name.toLowerCase().includes(searchText) ||
      product.brand.toLowerCase().includes(searchText) ||
      product.description.toLowerCase().includes(searchText);
    const matchesCategory = !category || product.category === category;
    const matchesMin = !minPrice || product.price >= Number(minPrice);
    const matchesMax = !maxPrice || product.price <= Number(maxPrice);
    return matchesSearch && matchesCategory && matchesMin && matchesMax;
  });

  res.json({
    categories: store.categories,
    count: items.length,
    items
  });
});

router.get("/:productId", (req, res) => {
  const product = store.products.find((item) => item.id === req.params.productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found." });
  }

  return res.json(product);
});

router.post("/", requireAdmin, (req, res) => {
  const { name, category, brand, price, stock, rating = 0, description = "", image = "" } = req.body;

  if (!name || !category || !brand || price == null || stock == null) {
    return res.status(400).json({ message: "Missing required product fields." });
  }

  const product = {
    id: generateId("p"),
    name,
    category,
    brand,
    price: Number(price),
    stock: Number(stock),
    rating: Number(rating),
    description,
    image
  };

  if (!store.categories.includes(category)) {
    store.categories.push(category);
  }

  store.products.push(product);
  saveStore();
  return res.status(201).json(product);
});

router.put("/:productId", requireAdmin, (req, res) => {
  const product = store.products.find((item) => item.id === req.params.productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found." });
  }

  Object.assign(product, req.body);
  if (req.body.price != null) {
    product.price = Number(req.body.price);
  }
  if (req.body.stock != null) {
    product.stock = Number(req.body.stock);
  }
  if (req.body.rating != null) {
    product.rating = Number(req.body.rating);
  }

  saveStore();
  return res.json(product);
});

router.delete("/:productId", requireAdmin, (req, res) => {
  const index = store.products.findIndex((item) => item.id === req.params.productId);
  if (index === -1) {
    return res.status(404).json({ message: "Product not found." });
  }

  const [removed] = store.products.splice(index, 1);
  saveStore();
  return res.json(removed);
});

export default router;
