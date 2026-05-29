import express from "express";
import { generateId, sanitizeUser, saveStore, store } from "../services/store.js";

const router = express.Router();

router.post("/register", (req, res) => {
  const { name, email, password, role = "customer" } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return res.status(400).json({ message: "Enter a valid email address." });
  }

  if (!["customer", "admin"].includes(role)) {
    return res.status(400).json({ message: "Invalid role." });
  }

  const existingUser = store.users.find((user) => user.email.toLowerCase() === normalizedEmail);
  if (existingUser) {
    return res.status(409).json({ message: "Email is already registered." });
  }

  const newUser = {
    id: generateId("u"),
    name: String(name).trim(),
    email: normalizedEmail,
    password,
    role
  };

  store.users.push(newUser);
  saveStore();
  return res.status(201).json({
    message: "Registration successful.",
    user: sanitizeUser(newUser),
    token: newUser.id
  });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = String(email).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return res.status(400).json({ message: "Enter a valid email address." });
  }

  const user = store.users.find(
    (entry) => entry.email.toLowerCase() === normalizedEmail && entry.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  return res.json({
    message: "Login successful.",
    user: sanitizeUser(user),
    token: user.id
  });
});

export default router;
