import pool from "../config/db.js";

export const getMyScores = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.*, cl.class_name, c.course_name, c.level
      FROM scores s
      JOIN classes cl ON s.class_id = cl.id
      JOIN courses c ON cl.course_id = c.id
      WHERE s.student_id = ?
      ORDER BY s.id DESC
    `, [req.user.id]);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
  }
};

export const getScoresByClass = async (req, res) => {
  const { classId } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT s.*, u.full_name AS student_name, u.email AS student_email
      FROM scores s
      JOIN users u ON s.student_id = u.id
      WHERE s.class_id = ?
      ORDER BY u.full_name
    `, [classId]);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
  }
};

export const upsertScore = async (req, res) => {
  const { student_id, class_id, score, comment } = req.body;
  try {
    if (student_id === undefined || class_id === undefined || score === undefined) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }
    if (score < 0 || score > 10) return res.status(400).json({ message: "Điểm phải trong khoảng 0 - 10" });

    const [enrollmentCheck] = await pool.query(
      "SELECT id FROM enrollments WHERE student_id = ? AND class_id = ? AND status = 'đã duyệt'",
      [student_id, class_id]
    );

    if (enrollmentCheck.length === 0) {
      return res.status(400).json({ message: "Học viên này chưa được duyệt tham gia lớp học" });
    }

    await pool.query(`
      INSERT INTO scores (student_id, class_id, score, comment)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE score = VALUES(score), comment = VALUES(comment)
    `, [student_id, class_id, score, comment || null]);

    await pool.query(
      "INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)",
      [student_id, "Điểm số mới được cập nhật", `Điểm của bạn tại lớp ID ${class_id} đã được cập nhật: ${score}.`]
    );

    res.status(200).json({ message: "Lưu điểm thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
  }
};

export const getEnrolledStudentsForScore = async (req, res) => {
  const { classId } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT u.id, u.full_name, u.email,
             s.score, s.comment, s.id AS score_id
      FROM enrollments e
      JOIN users u ON e.student_id = u.id
      LEFT JOIN scores s ON s.student_id = u.id AND s.class_id = e.class_id
      WHERE e.class_id = ? AND e.status = 'đã duyệt'
      ORDER BY u.full_name
    `, [classId]);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
  }
};
