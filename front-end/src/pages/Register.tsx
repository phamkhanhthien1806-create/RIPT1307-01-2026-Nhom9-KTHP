import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined } from "@ant-design/icons";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import api from "../utils/api";

const { Title, Paragraph } = Typography;

const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  if (isAuthenticated && user) {
    if (user.role === "quản trị viên") {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/student/dashboard" replace />;
    }
  }

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await api.post("/auth/register", {
        full_name: values.full_name,
        email: values.email,
        password: values.password,
        phone: values.phone,
        role: "học viên",
      });

      message.success("Đăng ký tài khoản học viên thành công! Hãy đăng nhập.");
      navigate("/login");
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.message || "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.";
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1890ff 0%, #3b5998 100%)",
        padding: "20px",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: "450px",
          borderRadius: "12px",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
          overflow: "hidden",
        }}
        bodyStyle={{ padding: "40px 30px" }}
      >
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "#e6f7ff",
              display: "inline-flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <span style={{ fontSize: "28px", color: "#1890ff", fontWeight: "bold" }}>T</span>
          </div>
          <Title level={3} style={{ margin: 0, color: "#1890ff" }}>
            Đăng Ký Tài Khoản
          </Title>
          <Paragraph type="secondary" style={{ marginTop: "4px" }}>
            Trở thành học viên của Tata English Center
          </Paragraph>
        </div>

        <Form name="register_form" onFinish={onFinish} size="large" layout="vertical">
          <Form.Item
            name="full_name"
            rules={[{ required: true, message: "Vui lòng nhập Họ và Tên!" }]}
          >
            <Input prefix={<UserOutlined style={{ color: "rgba(0,0,0,.25)" }} />} placeholder="Họ và Tên" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập Email!" },
              { type: "email", message: "Email không đúng định dạng!" },
            ]}
          >
            <Input prefix={<MailOutlined style={{ color: "rgba(0,0,0,.25)" }} />} placeholder="Địa chỉ Email" />
          </Form.Item>

          <Form.Item
            name="phone"
            rules={[
              { required: true, message: "Vui lòng nhập Số điện thoại!" },
              { pattern: /^[0-9]{10,11}$/, message: "Số điện thoại từ 10 đến 11 số!" },
            ]}
          >
            <Input prefix={<PhoneOutlined style={{ color: "rgba(0,0,0,.25)" }} />} placeholder="Số điện thoại" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Vui lòng nhập Mật khẩu!" },
              { min: 6, message: "Mật khẩu tối thiểu 6 ký tự!" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
              placeholder="Mật khẩu"
            />
          </Form.Item>

          <Form.Item
            name="confirm_password"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận Mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
              placeholder="Xác nhận mật khẩu"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block style={{ borderRadius: "6px" }}>
              Đăng Ký
            </Button>
          </Form.Item>

          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <span style={{ color: "rgba(0,0,0,0.45)" }}>Đã có tài khoản? </span>
            <Link to="/login" style={{ fontWeight: 500 }}>
              Đăng nhập
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;
