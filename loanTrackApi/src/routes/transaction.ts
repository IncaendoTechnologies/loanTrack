import { Router } from "express";
import TransactionController from "../controllers/transaction";

const router = Router();

// No need to create instance since methods are static
router.post("/", TransactionController.createTransaction);
router.get("/", TransactionController.getAllTransactions);

export default router;