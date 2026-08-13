import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/authRoutes.ts";
import userRoutes from "./routes/userRoutes.ts";
import publicationRoutes from "./routes/publicationRoutes.ts";
import shoppingCartRoutes from "./routes/shoppingCartRoutes.ts";
import shoppingCartItemRoutes from "./routes/shoppingCartItemRoutes.ts";
import purchaseRoutes from "./routes/purchaseRoutes.ts"

const app = express();

const port = Number(process.env.PORT) || 3000;

app.use(
  helmet(),
);

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(
  express.json({
    limit: "10kb",
  }),
);

app.use(cookieParser());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10000,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/auth", authLimiter, authRoutes);
app.use("/user", authLimiter, userRoutes);
app.use("/publication", authLimiter, publicationRoutes);
app.use("/shopCart", authLimiter, shoppingCartRoutes);
app.use("/cartItem", authLimiter, shoppingCartItemRoutes);
app.use("/purchase", authLimiter, purchaseRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "EventTicket API",
  });
});

app.listen(port, () => {
  console.log(`API running on port ${port}`);
});