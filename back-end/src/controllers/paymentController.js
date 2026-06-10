import pool from "../config/db.js";
import { sendEmail } from "../services/emailService.js";
import payos from "../config/payos.js";


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

    const [paymentInfo] = await pool.query(`
      SELECT p.*, u.email AS student_email, u.full_name AS student_name,
             cl.class_name, c.course_name, pm.method_name
      FROM payments p
      JOIN enrollments e ON p.enrollment_id = e.id
      JOIN users u ON e.student_id = u.id
      JOIN classes cl ON e.class_id = cl.id
      JOIN courses c ON cl.course_id = c.id
      LEFT JOIN payment_methods pm ON p.payment_method_id = pm.id
      WHERE p.id = ?
    `, [id]);

    if (paymentInfo.length > 0) {
      const p = paymentInfo[0];
      const emailSubject = `Cập nhật trạng thái học phí: ${p.payment_status.toUpperCase()}`;
      const emailHtml = `<p>Chào ${p.student_name},</p>
<p>Hệ thống vừa cập nhật trạng thái hóa đơn học phí của bạn cho lớp học <strong>${p.class_name}</strong> (Khóa học: ${p.course_name}).</p>
<p>Thông tin hóa đơn chi tiết:</p>
<ul>
  <li>Số tiền: <strong>${Number(p.amount).toLocaleString('vi-VN')} VND</strong></li>
  <li>Phương thức: <strong>${p.method_name || "N/A"}</strong></li>
  <li>Trạng thái thanh toán: <strong>${p.payment_status}</strong></li>
  ${p.payment_date ? `<li>Ngày thanh toán: <strong>${new Date(p.payment_date).toLocaleString('vi-VN')}</strong></li>` : ''}
</ul>
<p>Trân trọng,<br>Tata English Center</p>`;
      sendEmail(p.student_email, emailSubject, emailHtml);
    }

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

// ----------------------------------------------------
// 1. CỔNG THANH TOÁN PAYOS (VIETQR THẬT)
// ----------------------------------------------------
export const createPayOSLink = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT p.*, cl.class_name, c.course_name
      FROM payments p
      JOIN enrollments e ON p.enrollment_id = e.id
      JOIN classes cl ON e.class_id = cl.id
      JOIN courses c ON cl.course_id = c.id
      WHERE p.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy thông tin thanh toán" });
    }

    const payment = rows[0];
    if (payment.payment_status === "đã thanh toán") {
      return res.status(400).json({ message: "Hóa đơn này đã được thanh toán" });
    }

    const orderCode = Number(payment.id);
    const amount = Math.round(payment.amount);
    const description = `HP ${payment.id}`.substring(0, 25);

    const paymentData = {
      orderCode: orderCode,
      amount: amount,
      description: description,
      cancelUrl: `${process.env.FRONTEND_URL}/student/payments?status=cancelled`,
      returnUrl: `${process.env.FRONTEND_URL}/student/payments?status=success`,
    };

    const paymentLinkRes = await payos.paymentRequests.create(paymentData);
    res.status(200).json({ checkoutUrl: paymentLinkRes.checkoutUrl });
  } catch (error) {
    console.error("Lỗi tạo link PayOS chi tiết:", error);
    res.status(500).json({ message: "Lỗi tạo link PayOS", error: error.message, details: error.response?.data || error });
  }
};

export const handlePayOSWebhook = async (req, res) => {
  try {
    const webhookData = req.body;
    const verifiedData = payos.webhooks.verify(webhookData);

    if (verifiedData.code === "00" || webhookData.success === true) {
      const paymentId = verifiedData.orderCode;
      
      const [check] = await pool.query("SELECT payment_status FROM payments WHERE id = ?", [paymentId]);
      if (check.length > 0 && check[0].payment_status !== "đã thanh toán") {
        const payment_date = new Date();
        // Cập nhật CSDL payments
        await pool.query(
          "UPDATE payments SET payment_status = 'đã thanh toán', payment_date = ?, payment_method_id = 2 WHERE id = ?",
          [payment_date, paymentId]
        );

        // Duyệt enrollment
        const [paymentDetails] = await pool.query("SELECT enrollment_id FROM payments WHERE id = ?", [paymentId]);
        if (paymentDetails.length > 0) {
          const enrollmentId = paymentDetails[0].enrollment_id;
          await pool.query("UPDATE enrollments SET status = 'đã duyệt' WHERE id = ?", [enrollmentId]);
          
          // Gửi thông báo hệ thống
          const [enrollInfo] = await pool.query("SELECT student_id FROM enrollments WHERE id = ?", [enrollmentId]);
          if (enrollInfo.length > 0) {
            await pool.query(
              "INSERT INTO notifications (user_id, title, message) VALUES (?, 'Đăng ký được duyệt', 'Đăng ký lớp học của bạn đã được duyệt thành công sau khi hoàn tất học phí.')",
              [enrollInfo[0].student_id]
            );
          }
        }

        // Gửi email xác nhận
        await sendSuccessEmail(paymentId, payment_date, "Chuyển khoản (VietQR tự động PayOS)");
      }
    }
    res.status(200).json({ message: "Success" });
  } catch (error) {
    console.error("Lỗi Webhook PayOS:", error.message);
    res.status(400).json({ message: "Invalid webhook data", error: error.message });
  }
};


async function sendSuccessEmail(paymentId, paymentDate, methodName) {
  try {
    const [paymentInfo] = await pool.query(`
      SELECT p.*, u.email AS student_email, u.full_name AS student_name,
             cl.class_name, c.course_name
      FROM payments p
      JOIN enrollments e ON p.enrollment_id = e.id
      JOIN users u ON e.student_id = u.id
      JOIN classes cl ON e.class_id = cl.id
      JOIN courses c ON cl.course_id = c.id
      WHERE p.id = ?
    `, [paymentId]);

    if (paymentInfo.length > 0) {
      const p = paymentInfo[0];
      const emailSubject = `Thanh toán học phí thành công - Lớp ${p.class_name}`;
      const emailHtml = `<p>Chào ${p.student_name},</p>
<p>Hệ thống ghi nhận bạn đã hoàn thành học phí cho lớp học <strong>${p.class_name}</strong> (Khóa học: ${p.course_name}).</p>
<p>Thông tin hóa đơn chi tiết:</p>
<ul>
  <li>Mã hóa đơn: <strong>${p.id}</strong></li>
  <li>Số tiền: <strong>${Number(p.amount).toLocaleString('vi-VN')} VND</strong></li>
  <li>Phương thức: <strong>${methodName}</strong></li>
  <li>Trạng thái: <strong>Đã thanh toán (Hệ thống tự động duyệt)</strong></li>
  <li>Ngày thanh toán: <strong>${paymentDate.toLocaleString('vi-VN')}</strong></li>
</ul>
<p>Trân trọng,<br>Tata English Center</p>`;
      
      sendEmail(p.student_email, emailSubject, emailHtml);
    }
  } catch (err) {
    console.error("Lỗi gửi email thanh toán thành công:", err.message);
  }
}

export const simulateSuccessPayment = async (req, res) => {
  const { id } = req.params;
  const { payment_method_id } = req.body;

  try {
    const [rows] = await pool.query("SELECT * FROM payments WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy hóa đơn" });
    }

    const payment = rows[0];
    if (payment.payment_status === "đã thanh toán") {
      return res.status(400).json({ message: "Hóa đơn này đã được thanh toán" });
    }

    const payment_date = new Date();
    await pool.query(
      "UPDATE payments SET payment_status = 'đã thanh toán', payment_date = ?, payment_method_id = ? WHERE id = ?",
      [payment_date, payment_method_id, id]
    );

    const [paymentDetails] = await pool.query("SELECT enrollment_id FROM payments WHERE id = ?", [id]);
    if (paymentDetails.length > 0) {
      const enrollmentId = paymentDetails[0].enrollment_id;
      await pool.query("UPDATE enrollments SET status = 'đã duyệt' WHERE id = ?", [enrollmentId]);
      
      const [enrollInfo] = await pool.query("SELECT student_id FROM enrollments WHERE id = ?", [enrollmentId]);
      if (enrollInfo.length > 0) {
        await pool.query(
          "INSERT INTO notifications (user_id, title, message) VALUES (?, 'Đăng ký được duyệt', 'Đăng ký lớp học của bạn đã được duyệt thành công sau khi hoàn tất học phí.')",
          [enrollInfo[0].student_id]
        );
      }
    }

    let methodName = "Thanh toán trực tuyến (Mô phỏng)";
    if (Number(payment_method_id) === 3) {
      methodName = "Ví điện tử MoMo (Mô phỏng)";
    } else if (Number(payment_method_id) === 4) {
      methodName = "Thẻ ngân hàng VNPAY (Mô phỏng)";
    }
    await sendSuccessEmail(id, payment_date, methodName);

    res.status(200).json({ message: "Mô phỏng thanh toán thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi mô phỏng thanh toán", error: error.message });
  }
};
