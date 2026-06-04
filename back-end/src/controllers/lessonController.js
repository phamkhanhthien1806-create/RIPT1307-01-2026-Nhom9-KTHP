import pool from "../config/db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getLessonsByClass = async (req, res) => {
  const { classId } = req.params;
  try {
    const [lessons] = await pool.query(
      "SELECT * FROM lessons WHERE class_id = ? ORDER BY lesson_order ASC",
      [classId]
    );

    if (lessons.length === 0) {
      return res.status(200).json([]);
    }

    const lessonIds = lessons.map(l => l.id);
    const [videos] = await pool.query(
      "SELECT * FROM lesson_videos WHERE lesson_id IN (?)",
      [lessonIds]
    );

    const [materials] = await pool.query(
      "SELECT * FROM lesson_materials WHERE lesson_id IN (?)",
      [lessonIds]
    );

    const lessonsWithResources = lessons.map(lesson => {
      return {
        ...lesson,
        videos: videos.filter(v => v.lesson_id === lesson.id),
        materials: materials.filter(m => m.lesson_id === lesson.id),
      };
    });

    res.status(200).json(lessonsWithResources);
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
  }
};

export const getLessonById = async (req, res) => {
  const { id } = req.params;
  try {
    const [lessons] = await pool.query("SELECT * FROM lessons WHERE id = ?", [id]);
    if (lessons.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy bài học" });
    }

    const [videos] = await pool.query("SELECT * FROM lesson_videos WHERE lesson_id = ?", [id]);
    const [materials] = await pool.query("SELECT * FROM lesson_materials WHERE lesson_id = ?", [id]);

    res.status(200).json({
      lesson: lessons[0],
      videos,
      materials,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
  }
};

export const createLesson = async (req, res) => {
  const { class_id, lesson_title, content, lesson_order } = req.body;
  try {
    if (!class_id || !lesson_title) {
      return res.status(400).json({ message: "Thiếu class_id hoặc tiêu đề bài học" });
    }

    let order = lesson_order;
    if (order === undefined || order === null) {
      const [[{ maxOrder }]] = await pool.query(
        "SELECT COALESCE(MAX(lesson_order), 0) AS maxOrder FROM lessons WHERE class_id = ?",
        [class_id]
      );
      order = maxOrder + 1;
    } else {
      const [existing] = await pool.query(
        "SELECT id FROM lessons WHERE class_id = ? AND lesson_order = ?",
        [class_id, order]
      );
      if (existing.length > 0) {
        return res.status(400).json({ message: `Thứ tự bài học ${order} đã tồn tại trong lớp này` });
      }
    }

    const [result] = await pool.query(
      "INSERT INTO lessons (class_id, lesson_title, content, lesson_order) VALUES (?, ?, ?, ?)",
      [class_id, lesson_title, content || null, order]
    );

    res.status(201).json({
      message: "Tạo bài học thành công",
      lessonId: result.insertId,
      lesson_order: order,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
  }
};

export const updateLesson = async (req, res) => {
  const { id } = req.params;
  const { lesson_title, content, lesson_order } = req.body;
  try {
    const [lesson] = await pool.query("SELECT * FROM lessons WHERE id = ?", [id]);
    if (lesson.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy bài học" });
    }

    const class_id = lesson[0].class_id;

    if (lesson_order !== undefined && lesson_order !== lesson[0].lesson_order) {
      const [existing] = await pool.query(
        "SELECT id FROM lessons WHERE class_id = ? AND lesson_order = ? AND id != ?",
        [class_id, lesson_order, id]
      );
      if (existing.length > 0) {
        return res.status(400).json({ message: `Thứ tự bài học ${lesson_order} đã tồn tại trong lớp này` });
      }
    }

    await pool.query(
      "UPDATE lessons SET lesson_title = ?, content = ?, lesson_order = ? WHERE id = ?",
      [
        lesson_title !== undefined ? lesson_title : lesson[0].lesson_title,
        content !== undefined ? content : lesson[0].content,
        lesson_order !== undefined ? lesson_order : lesson[0].lesson_order,
        id,
      ]
    );

    res.status(200).json({ message: "Cập nhật bài học thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
  }
};

export const deleteLesson = async (req, res) => {
  const { id } = req.params;
  try {
    const [lesson] = await pool.query("SELECT * FROM lessons WHERE id = ?", [id]);
    if (lesson.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy bài học" });
    }

    const [materials] = await pool.query("SELECT file_url FROM lesson_materials WHERE lesson_id = ?", [id]);

    await pool.query("DELETE FROM lessons WHERE id = ?", [id]);

    materials.forEach(m => {
      const filePath = path.join(__dirname, "../..", m.file_url);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error("Lỗi xóa file vật lý:", err.message);
        }
      }
    });

    res.status(200).json({ message: "Xóa bài học thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
  }
};

export const addLessonVideo = async (req, res) => {
  const { lessonId } = req.params;
  const { video_url, duration } = req.body;
  try {
    if (!video_url) {
      return res.status(400).json({ message: "Thiếu đường dẫn video_url" });
    }

    const [lesson] = await pool.query("SELECT id FROM lessons WHERE id = ?", [lessonId]);
    if (lesson.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy bài học" });
    }

    const [result] = await pool.query(
      "INSERT INTO lesson_videos (lesson_id, video_url, duration) VALUES (?, ?, ?)",
      [lessonId, video_url, duration || null]
    );

    res.status(201).json({ message: "Thêm video thành công", videoId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
  }
};

export const deleteLessonVideo = async (req, res) => {
  const { id } = req.params;
  try {
    const [video] = await pool.query("SELECT id FROM lesson_videos WHERE id = ?", [id]);
    if (video.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy video" });
    }

    await pool.query("DELETE FROM lesson_videos WHERE id = ?", [id]);
    res.status(200).json({ message: "Xóa video thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
  }
};

export const addLessonMaterial = async (req, res) => {
  const { lessonId } = req.params;
  const { file_name } = req.body;
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Vui lòng chọn file tài liệu để upload" });
    }

    const [lesson] = await pool.query("SELECT id FROM lessons WHERE id = ?", [lessonId]);
    if (lesson.length === 0) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ message: "Không tìm thấy bài học" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const name = file_name || req.file.originalname;
    const type = path.extname(req.file.originalname).substring(1);

    const [result] = await pool.query(
      "INSERT INTO lesson_materials (lesson_id, file_name, file_url, file_type) VALUES (?, ?, ?, ?)",
      [lessonId, name, fileUrl, type]
    );

    res.status(201).json({
      message: "Thêm tài liệu thành công",
      materialId: result.insertId,
      file_name: name,
      file_url: fileUrl,
      file_type: type,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
  }
};

export const deleteLessonMaterial = async (req, res) => {
  const { id } = req.params;
  try {
    const [material] = await pool.query("SELECT * FROM lesson_materials WHERE id = ?", [id]);
    if (material.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy tài liệu" });
    }

    await pool.query("DELETE FROM lesson_materials WHERE id = ?", [id]);

    const filePath = path.join(__dirname, "../..", material[0].file_url);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error("Lỗi xóa file vật lý:", err.message);
      }
    }

    res.status(200).json({ message: "Xóa tài liệu thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
  }
};
