import { Router } from "express";
import { PaymentController } from "../controllers/PaymentController";

const router = Router();
const controller = new PaymentController();

router.post("/initiate", controller.initiatePayment);
router.get("/:transactionId", controller.getTransaction);
router.post("/confirm", controller.confirmPayment);


export default router;