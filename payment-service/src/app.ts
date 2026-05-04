import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import paymentRoutes from "./routes/payment";
import userRoutes from "./routes/user";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/v1/payments", paymentRoutes);
app.use("/v1/users", userRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});