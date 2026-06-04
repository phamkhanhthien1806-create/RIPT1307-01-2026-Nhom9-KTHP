import React from "react";
import { Typography } from "antd";

const { Title, Paragraph } = Typography;

const AdminDashboard: React.FC = () => {
  return (
    <div>
      <Title level={2}>Bảng điều khiển Admin</Title>
      <Paragraph>Chào mừng bạn đến với trang quản trị hệ thống Tata English Center.</Paragraph>
    </div>
  );
};

export default AdminDashboard;
