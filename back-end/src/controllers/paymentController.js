import pool from "../config/db.js";

export const getMyPayments = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, pm.method_name, cl.class_name, c.course_name
      FROM payments p
      JOIN enrollments e ON p.enrollment_id = e.id
      JOIN payment_methods pm ON p.payment_method_id = pm.id
      JOIN classes cl ON e.class_id = cl.id
      JOIN courses c ON cl.course_id = c.id
      WHERE e.student_id = ?
      ORDER BY p.id DESC
    `, [req.user.id]);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
  }
};

export const getAllPayments = async (req, res) => {
  try {
    const { payment_status } = req.query;
    let query = `
      SELECT p.*, pm.method_name, u.full_name AS student_name,
             cl.class_name, c.course_name
      FROM payments p
      JOIN enrollments e ON p.enrollment_id = e.id
      JOIN payment_methods pm ON p.payment_method_id = pm.id
      JOIN users u ON e.student_id = u.id
      JOIN classes cl ON e.class_id = cl.id
      JOIN courses c ON cl.course_id = c.id
    `;
    const params = [];
    if (payment_status) { query += " WHERE p.payment_status = ?"; params.push(payment_status); }
    query += " ORDER BY p.id DESC";
    const [rows] = await pool.query(query, params);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
  }
};

export const updatePaymentStatus = async (req, res) => {
  const { id } = req.params;
  const { payment_status, payment_method_id } = req.body;
  const allowed = ["chờ thanh toán", "đã thanh toán", "thất bại"];
  try {
    if (!allowed.includes(payment_status)) return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    const [check] = await pool.query("SELECT id FROM payments WHERE id = ?", [id]);
    if (check.length === 0) return res.status(404).json({ message: "Không tìm thấy thanh toán" });

    const payment_date = payment_status === "đã thanh toán" ? new Date() : null;
    await pool.query(
      "UPDATE payments SET payment_status=?, payment_date=?, payment_method_id=COALESCE(?,payment_method_id) WHERE id=?",
      [payment_status, payment_date, payment_method_id || null, id]
    );
    res.status(200).json({ message: "Cập nhật trạng thái thanh toán thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
  }
};

export const getPaymentMethods = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM payment_methods");
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
  }
};
