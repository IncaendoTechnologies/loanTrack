import compression from "compression";
import express from "express";
import { requireAuth } from "./middleware/auth";
import loanRoutes from "./routes/loan";
import userRoutes from "./routes/user";
import transaction from "./routes/transaction";
const app = express();

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const elapsed = Date.now() - start;
    if (req.path.startsWith("/loans") || req.path.startsWith("/users")) {
      console.log(`API ${req.method} ${req.originalUrl} => ${res.statusCode} (${elapsed}ms)`);
    }
  });
  next();
});

app.use(compression());

app.use((req, res, next) => {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";
  res.header("Access-Control-Allow-Origin", allowedOrigin);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/loans", requireAuth, loanRoutes);
app.use("/users", requireAuth, userRoutes);
app.use("/transactions", requireAuth, transaction);

export default app;