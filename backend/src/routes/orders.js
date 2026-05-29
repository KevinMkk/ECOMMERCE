import express from "express";
import { requireAdmin, requireAuth } from "../utils/auth.js";
import { generateId, saveStore, store } from "../services/store.js";

const router = express.Router();

const markOrderPaid = (order, userId, paymentIntentId = order.paymentIntentId) => {
  order.status = "Confirmed";
  order.paymentStatus = "Paid";
  order.paymentIntentId = paymentIntentId;
  order.timeline.unshift({
    status: "Payment confirmed",
    at: new Date().toISOString()
  });
  store.carts[userId] = [];
  saveStore();
  return order;
};

router.post("/checkout", requireAuth, async (req, res, next) => {
  try {
    const cart = store.carts[req.user.id] ?? [];
    const selectedProductIds = Array.isArray(req.body.selectedProductIds)
      ? req.body.selectedProductIds
      : [];

    if (cart.length === 0) {
      return res.status(400).json({ message: "Cart is empty." });
    }

    const itemsToCheckout = selectedProductIds.length
      ? cart.filter((item) => selectedProductIds.includes(item.productId))
      : cart;

    if (itemsToCheckout.length === 0) {
      return res.status(400).json({ message: "No selected cart items found for checkout." });
    }

    const orderItems = itemsToCheckout.map((item) => {
      const product = store.products.find((entry) => entry.id === item.productId);
      return {
        productId: item.productId,
        name: product?.name ?? "Unknown",
        quantity: item.quantity,
        price: product?.price ?? 0
      };
    });

    const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = {
      id: generateId("ord"),
      userId: req.user.id,
      customerName: req.user.name,
      items: orderItems,
      total,
      paymentMethod: req.body.paymentMethod ?? "Simulated payment",
      shippingAddress: req.body.shippingAddress ?? "Digital delivery / local pickup",
      status: "Confirmed",
      paymentStatus: "Paid",
      paymentIntentId: null,
      clientSecret: null,
      createdAt: new Date().toISOString(),
      timeline: [
        {
          status: "Order placed",
          at: new Date().toISOString()
        },
        {
          status: "Payment confirmed",
          at: new Date().toISOString()
        }
      ]
    };

    store.orders.unshift(order);
    store.carts[req.user.id] = cart.filter((item) => !itemsToCheckout.some((selectedItem) => selectedItem.productId === item.productId));
    saveStore();
    return res.status(201).json(order);
  } catch (error) {
    return next(error);
  }
});

router.get("/", requireAuth, (req, res) => {
  const items =
    req.user.role === "admin"
      ? store.orders
      : store.orders.filter((order) => order.userId === req.user.id);

  return res.json(items);
});

router.post("/:orderId/confirm-payment", requireAuth, async (req, res, next) => {
  try {
    const order = store.orders.find((o) => o.id === req.params.orderId && o.userId === req.user.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (order.paymentStatus === "Paid") {
      return res.json(order);
    }

    if (order.status !== "Processing") {
      return res.status(400).json({ message: "Order already processed." });
    }

    markOrderPaid(order, req.user.id, req.body.paymentIntentId ?? order.paymentIntentId);

    return res.json(order);
  } catch (error) {
    return next(error);
  }
});

router.patch("/:orderId/status", requireAdmin, (req, res) => {
  const order = store.orders.find((entry) => entry.id === req.params.orderId);
  if (!order) {
    return res.status(404).json({ message: "Order not found." });
  }

  const nextStatus = req.body.status;
  if (!nextStatus) {
    return res.status(400).json({ message: "Status is required." });
  }

  order.status = nextStatus;
  order.timeline.unshift({
    status: nextStatus,
    at: new Date().toISOString()
  });

  saveStore();
  return res.json(order);
});

export default router;
