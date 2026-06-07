import express from "express";
import { 
  getMyPayments, 
  getAllPayments, 
  updatePaymentStatus, 
  getPaymentMethods,
  simulateSuccessPayment
} from "../controllers/paymentController.js";
import { authenticateToken, authorizeRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/my", authenticateToken, authorizeRole(["học viên"]), getMyPayments);
router.get("/methods", getPaymentMethods);
router.get("/", authenticateToken, authorizeRole(["quản trị viên"]), getAllPayments);
router.put("/:id/status", authenticateToken, authorizeRole(["quản trị viên"]), updatePaymentStatus);

router.post("/:id/simulate-success", authenticateToken, authorizeRole(["học viên"]), simulateSuccessPayment);

export default router;
