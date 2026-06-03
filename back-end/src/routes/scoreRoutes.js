import express from "express";
import { getMyScores, getScoresByClass, upsertScore, getEnrolledStudentsForScore } from "../controllers/scoreController.js";
import { authenticateToken, authorizeRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/my", authenticateToken, authorizeRole(["học viên"]), getMyScores);
router.get("/class/:classId", authenticateToken, authorizeRole(["quản trị viên"]), getScoresByClass);
router.get("/class/:classId/students", authenticateToken, authorizeRole(["quản trị viên"]), getEnrolledStudentsForScore);
router.post("/", authenticateToken, authorizeRole(["quản trị viên"]), upsertScore);

export default router;
