import { Router } from "express";
import { WalletController } from "../controllers/wallet";
import { requireAuth } from "../middleware/auth";
import { requireServiceAuth } from "../middleware/requireServiceAuth";
const   router = Router();
const walletController = new WalletController();

router.get("/:userId",requireAuth, walletController.getWalletStatus);
router.post("/debit", requireServiceAuth, walletController.debitWallet);
router.post("/credit", requireServiceAuth, walletController.creditWallet);
router.post("/topup", requireAuth, walletController.topupWallet);

export default router;