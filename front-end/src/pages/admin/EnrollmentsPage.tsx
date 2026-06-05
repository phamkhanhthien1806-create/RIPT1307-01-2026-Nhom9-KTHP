import React, { useState, useEffect } from "react";
import { Table, Button, Tag, Space, Popconfirm, message, Typography, Card, Select } from "antd";
import { CheckOutlined, CloseOutlined, InfoCircleOutlined } from "@ant-design/icons";
import api from "../../utils/api";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

interface EnrollmentItem {
  id: number;
  student_id: number;
  student_name: string;
  student_email: string;
  class_id: number;
  class_name: string;
  course_name: string;
  tuition_fee: number;
  enroll_date: string;
  status: string;
  payment_status: string | null;
  amount: number | null;
}

const AdminEnrollmentsPage: React.FC = () => {
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter) params.status = statusFilter;

      const res = await api.get("/enrollments/all", { params });
      setEnrollments(res.data);
    } catch (error) {
      console.error("Lỗi tải danh sách đăng ký:", error);
      message.error("Không thể tải danh sách đăng ký");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, [statusFilter]);

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      await api.put(`/enrollments/${id}/status`, { status: newStatus });
      message.success(`Đã cập nhật trạng thái đăng ký thành: ${newStatus}`);
      fetchEnrollments();
    } catch (error: any) {
      console.error("Lỗi duyệt đăng ký:", error);
      message.error(error.response?.data?.message || "Không thể cập nhật trạng thái");
    }
  };

  const columns = [
    {
      title: "Học Viên",
      dataIndex: "student_name",
      key: "student_name",
      render: (name: string, record: EnrollmentItem) => (
        <div>
          <Text strong>{name}</Text>
          <div style={{ fontSize: "11px", color: "#8c8c8c" }}>{record.student_email}</div>
        </div>
      ),
    },
    {
      title: "Lớp / Khóa học",
      dataIndex: "class_name",
      key: "class_name",
      render: (className: string, record: EnrollmentItem) => (
        <div>
          <Text>{className}</Text>
          <div style={{ fontSize: "11px", color: "#1890ff" }}>{record.course_name}</div>
        </div>
      ),
    },
    {
      title: "Ngày Đăng Ký",
      dataIndex: "enroll_date",
      key: "enroll_date",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
      sorter: (a: EnrollmentItem, b: EnrollmentItem) => new Date(a.enroll_date).getTime() - new Date(b.enroll_date).getTime(),
    },
    {
      title: "Học Phí",
      dataIndex: "tuition_fee",
      key: "tuition_fee",
      render: (fee: number) => (
        <span style={{ fontWeight: 600, color: "#fa8c16" }}>
          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(fee)}
        </span>
      ),
    },
    {
      title: "Thanh Toán",
      dataIndex: "payment_status",
      key: "payment_status",
      render: (paymentStatus: string | null) => (
        <Tag color={paymentStatus === "đã thanh toán" ? "green" : "red"}>
          {paymentStatus === "đã thanh toán" ? "Đã đóng học phí" : "Chưa đóng học phí"}
        </Tag>
      ),
    },
    {
      title: "Trạng Thái Đăng Ký",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const color = status === "đã duyệt" ? "blue" : status === "từ chối" ? "red" : "orange";
        return (
          <Tag color={color} style={{ fontWeight: "bold" }}>
            {status.toUpperCase()}
          </Tag>
        );
      },
      filters: [
        { text: "Chờ duyệt", value: "chờ duyệt" },
        { text: "Đã duyệt", value: "đã duyệt" },
        { text: "Từ chối", value: "từ chối" },
      ],
      onFilter: (value: any, record: EnrollmentItem) => record.status === value,
    },
    {
      title: "Thao Tác",
      key: "actions",
      width: 180,
      render: (_: any, record: EnrollmentItem) => {
        if (record.status !== "chờ duyệt") {
          return <Text type="secondary">Đã xử lý</Text>;
        }
        return (
          <Space size="small">
            <Popconfirm
              title="Phê duyệt học viên vào lớp học này?"
              icon={<InfoCircleOutlined style={{ color: "#1890ff" }} />}
              onConfirm={() => handleUpdateStatus(record.id, "đã duyệt")}
              okText="Duyệt"
              cancelText="Hủy"
            >
              <Button type="primary" size="small" icon={<CheckOutlined />} style={{ background: "#52c41a", borderColor: "#52c41a" }}>
                Duyệt
              </Button>
            </Popconfirm>
            <Popconfirm
              title="Từ chối yêu cầu đăng ký của học viên này?"
              icon={<InfoCircleOutlined style={{ color: "#ff4d4f" }} />}
              onConfirm={() => handleUpdateStatus(record.id, "từ chối")}
              okText="Từ chối"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button type="primary" danger size="small" icon={<CloseOutlined />}>
                Từ chối
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <Card bordered={false} style={{ marginBottom: "16px", borderRadius: "8px" }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Duyệt Yêu Cầu Đăng Ký
          </Title>
          <Text type="secondary">Xử lý các đơn đăng ký tham gia lớp học của học viên tại trung tâm</Text>
        </div>
      </Card>

      {}
      <Card bordered={false} style={{ marginBottom: "16px", borderRadius: "8px" }}>
        <Space size="large">
          <Text>Lọc theo trạng thái phê duyệt:</Text>
          <Select
            placeholder="Tất cả trạng thái"
            style={{ width: "200px" }}
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            allowClear
          >
            <Option value="chờ duyệt">Chờ duyệt</Option>
            <Option value="đã duyệt">Đã duyệt</Option>
            <Option value="từ chối">Từ chối</Option>
          </Select>
        </Space>
      </Card>

      {}
      <Card bordered={false} style={{ borderRadius: "8px" }}>
        <Table
          dataSource={enrollments}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8 }}
          locale={{ emptyText: "Không tìm thấy yêu cầu đăng ký nào" }}
        />
      </Card>
    </div>
  );
};

export default AdminEnrollmentsPage;
