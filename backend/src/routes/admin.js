import express from "express";
import { requireAdmin } from "../utils/auth.js";
import { sanitizeUser, store } from "../services/store.js";

const router = express.Router();

router.get("/dashboard", requireAdmin, (req, res) => {
  const revenue = store.orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = store.orders.filter((order) => order.status !== "Delivered").length;

  res.json({
    metrics: {
      users: store.users.length,
      products: store.products.length,
      orders: store.orders.length,
      revenue,
      pendingOrders
    },
    recentOrders: store.orders.slice(0, 5),
    lowStockProducts: store.products.filter((product) => product.stock <= 15)
  });
});

router.get("/users", requireAdmin, (req, res) => {
  res.json(store.users.map(sanitizeUser));
});

router.post("/users", requireAdmin, (req, res) => {
  const { name, email, password, role = "customer" } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }

  if (!["customer", "admin"].includes(role)) {
    return res.status(400).json({ message: "Invalid role." });
  }

  const existingUser = store.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(409).json({ message: "Email is already registered." });
  }

  const newUser = {
    id: generateId("u"),
    name,
    email,
    password,
    role
  };

  store.users.push(newUser);
  return res.status(201).json({
    message: "User created successfully.",
    user: sanitizeUser(newUser)
  });
});

router.put("/users/:userId", requireAdmin, (req, res) => {
  const user = store.users.find((u) => u.id === req.params.userId);
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const { name, email, role } = req.body;
  if (name) user.name = name;
  if (email) user.email = email;
  if (role && ["customer", "admin"].includes(role)) user.role = role;

  return res.json({
    message: "User updated successfully.",
    user: sanitizeUser(user)
  });
});

router.delete("/users/:userId", requireAdmin, (req, res) => {
  const index = store.users.findIndex((u) => u.id === req.params.userId);
  if (index === -1) {
    return res.status(404).json({ message: "User not found." });
  }

  const [removed] = store.users.splice(index, 1);
  return res.json({
    message: "User deleted successfully.",
    user: sanitizeUser(removed)
  });
});

export default router;
