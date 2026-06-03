import express from "express";
import { getMyEnrollments, getAllEnrollments, createEnrollment, updateEnrollmentStatus } from "../controllers/enrollmentController.js";
import { authenticateToken, authorizeRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, authorizeRole(["học viên"]), getMyEnrollments);
router.get("/all", authenticateToken, authorizeRole(["quản trị viên"]), getAllEnrollments);
router.post("/", authenticateToken, authorizeRole(["học viên"]), createEnrollment);
router.put("/:id/status", authenticateToken, authorizeRole(["quản trị viên"]), updateEnrollmentStatus);

export default router;
