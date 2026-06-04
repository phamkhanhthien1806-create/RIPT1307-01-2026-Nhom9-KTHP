import React, { useEffect, useState } from "react";
import { Table, Tag, Typography, Spin, message, Card, Button } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

const { Title, Paragraph } = Typography;

const statusColors: Record<string, string> = {
  "đã duyệt": "green",
  "chờ duyệt": "orange",
  "từ chối": "red",
};

const paymentColors: Record<string, string> = {
  "đã thanh toán": "green",
  "chờ thanh toán": "orange",
  "thất bại": "red",
};

const MyClassesPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get("/enrollments");
        setEnrollments(res.data);
      } catch (err) {
        message.error("Lỗi tải danh sách lớp học");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const columns = [
    {
      title: "Khóa học",
      dataIndex: "course_name",
      key: "course_name",
      ellipsis: true,
    },
    {
      title: "Lớp học",
      dataIndex: "class_name",
      key: "class_name",
      ellipsis: true,
    },
    {
      title: "Giáo viên",
      dataIndex: "teacher_name",
      key: "teacher_name",
    },
    {
      title: "Trạng thái ĐK",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={statusColors[status] || "default"}>{status.toUpperCase()}</Tag>
      ),
      filters: [
        { text: "Đã duyệt", value: "đã duyệt" },
        { text: "Chờ duyệt", value: "chờ duyệt" },
        { text: "Từ chối", value: "từ chối" },
      ],
      onFilter: (value: any, record: any) => record.status === value,
    },
    {
      title: "Học phí",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) =>
        amount ? `${Number(amount).toLocaleString("vi-VN")}đ` : "—",
    },
    {
      title: "Thanh toán",
      dataIndex: "payment_status",
      key: "payment_status",
      render: (status: string) =>
        status ? (
          <Tag color={paymentColors[status] || "default"}>{status.toUpperCase()}</Tag>
        ) : (
          "—"
        ),
    },
    {
      title: "Bắt đầu",
      dataIndex: "start_date",
      key: "start_date",
      render: (d: string) => (d ? new Date(d).toLocaleDateString("vi-VN") : "—"),
    },
    {
      title: "",
      key: "action",
      render: (_: any, record: any) =>
        record.status === "đã duyệt" ? (
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/student/lessons/${record.class_id}`)}
          >
            Bài học
          </Button>
        ) : null,
    },
  ];

  return (
    <div>
      <Title level={3}>Lớp học của tôi</Title>
      <Paragraph type="secondary">
        Danh sách các lớp học bạn đã đăng ký. Bấm "Bài học" để xem nội dung bài giảng.
      </Paragraph>

      <Card>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table
            dataSource={enrollments}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            size="middle"
            scroll={{ x: 800 }}
          />
        )}
      </Card>
    </div>
  );
};

export default MyClassesPage;
