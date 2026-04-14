import { Router } from "express";
import * as userController from "../controllers/user";

const router = Router();

router.post("/", userController.createUser);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUserById);

export default router;
