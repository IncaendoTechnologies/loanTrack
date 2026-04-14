import { Router } from "express";
import * as loanController from "../controllers/loan";

const router = Router();

router.post("/", loanController.createLoan);
router.get("/", loanController.getAllLoans);
router.get("/:id", loanController.getLoan);
router.patch("/:id/close", loanController.closeLoan);
router.delete("/:id", loanController.deleteLoan);

export default router;