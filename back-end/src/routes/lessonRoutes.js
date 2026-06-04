import express from "express";
import {
  getLessonsByClass,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  addLessonVideo,
  deleteLessonVideo,
  addLessonMaterial,
  deleteLessonMaterial,
} from "../controllers/lessonController.js";
import { authenticateToken, authorizeRole } from "../middlewares/authMiddleware.js";
import { uploadMaterial } from "../middlewares/upload.js";

const router = express.Router();

router.get("/class/:classId", authenticateToken, getLessonsByClass);

router.get("/:id", authenticateToken, getLessonById);

router.post("/", authenticateToken, authorizeRole(["quản trị viên"]), createLesson);
router.put("/:id", authenticateToken, authorizeRole(["quản trị viên"]), updateLesson);
router.delete("/:id", authenticateToken, authorizeRole(["quản trị viên"]), deleteLesson);

router.post("/:lessonId/videos", authenticateToken, authorizeRole(["quản trị viên"]), addLessonVideo);
router.delete("/videos/:id", authenticateToken, authorizeRole(["quản trị viên"]), deleteLessonVideo);

router.post(
  "/:lessonId/materials",
  authenticateToken,
  authorizeRole(["quản trị viên"]),
  uploadMaterial.single("material"),
  addLessonMaterial
);
router.delete("/materials/:id", authenticateToken, authorizeRole(["quản trị viên"]), deleteLessonMaterial);

export default router;
