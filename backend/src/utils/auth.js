import { store, sanitizeUser } from "../services/store.js";

export const getUserFromHeader = (req) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return null;
  }

  return store.users.find((user) => user.id === userId) ?? null;
};

export const requireAuth = (req, res, next) => {
  const user = getUserFromHeader(req);

  if (!user) {
    return res.status(401).json({ message: "Authentication required." });
  }

  req.user = sanitizeUser(user);
  next();
};

export const requireAdmin = (req, res, next) => {
  const user = getUserFromHeader(req);

  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Administrator access required." });
  }

  req.user = sanitizeUser(user);
  next();
};
