import { Router } from "express";
import {PaymentServiceController} from "../controllers/paymentService";

const paymentController = new PaymentServiceController();
const router = Router();

router.post("/confirm", paymentController.confirmPayment);
router.post("/send-otp", paymentController.sendOtp);
router.post("/signUp/confirm", paymentController.confirmSignUp);

export default router;