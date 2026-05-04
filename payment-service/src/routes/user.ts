import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { requireAuth } from "../middleware/auth";
import { requireServiceAuth } from "../middleware/requireServiceAuth";
const router = Router();
const controller = new UserController();

router.post("/verify", requireAuth, controller.verifyUsers);
router.post("/confirmSignUp", requireServiceAuth, controller.registrationWebhook);

export default router;