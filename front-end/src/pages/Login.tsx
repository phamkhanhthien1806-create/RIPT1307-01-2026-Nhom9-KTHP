import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { loginSuccess } from "../store/slices/authSlice";
import type { RootState } from "../store";
import api from "../utils/api";

const { Title, Paragraph } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
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
      const response = await api.post("/auth/login", {
        email: values.email,
        password: values.password,
      });

      const { user, token } = response.data;
      dispatch(loginSuccess({ user, token }));
      message.success(`Chào mừng ${user.full_name} quay trở lại!`);

      if (user.role === "quản trị viên") {
        navigate("/admin/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
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
          maxWidth: "420px",
          borderRadius: "12px",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
          overflow: "hidden",
        }}
        bodyStyle={{ padding: "40px 30px" }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
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
            Tata English Center
          </Title>
          <Paragraph type="secondary" style={{ marginTop: "4px" }}>
            Hệ thống quản lý đào tạo & học viên
          </Paragraph>
        </div>

        <Form name="login_form" initialValues={{ remember: true }} onFinish={onFinish} size="large">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập Email!" },
              { type: "email", message: "Email không đúng định dạng!" },
            ]}
          >
            <Input prefix={<UserOutlined style={{ color: "rgba(0,0,0,.25)" }} />} placeholder="Email" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: "Vui lòng nhập Mật khẩu!" }]}>
            <Input.Password
              prefix={<LockOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
              placeholder="Mật khẩu"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block style={{ borderRadius: "6px" }}>
              Đăng Nhập
            </Button>
          </Form.Item>

          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <span style={{ color: "rgba(0,0,0,0.45)" }}>Chưa có tài khoản học viên? </span>
            <Link to="/register" style={{ fontWeight: 500 }}>
              Đăng ký ngay
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
