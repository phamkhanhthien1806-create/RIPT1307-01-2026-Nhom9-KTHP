import React from "react";
import { Typography } from "antd";

const { Title, Paragraph } = Typography;

const StudentDashboard: React.FC = () => {
  return (
    <div>
      <Title level={2}>Bảng điều khiển Học viên</Title>
      <Paragraph>Chào mừng bạn đến với Cổng thông tin học viên Tata English Center.</Paragraph>
    </div>
  );
};

export default StudentDashboard;
