import { Router } from "express";
import { PaymentController } from "../controllers/PaymentController";
import { requireAuth } from "../middleware/auth";
import { requireServiceAuth } from "../middleware/requireServiceAuth";
const router = Router();
const controller = new PaymentController();

router.post("/initiate", requireAuth, controller.initiatePayment);
router.get("/:transactionId", requireAuth, controller.getTransaction);
router.post("/confirm",requireServiceAuth ,controller.confirmPayment);
router.post("/request-otp",requireServiceAuth, controller.requestOTP);


export default router;