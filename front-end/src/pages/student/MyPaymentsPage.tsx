import React, { useEffect, useState } from "react";
import { Table, Tag, Typography, Spin, message, Card, Empty } from "antd";
import { CreditCardOutlined } from "@ant-design/icons";
import api from "../../utils/api";

const { Title, Paragraph, Text } = Typography;

const paymentStatusColors: Record<string, string> = {
  "đã thanh toán": "green",
  "chờ thanh toán": "orange",
  "thất bại": "red",
};

const MyPaymentsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get("/payments/my");
        setPayments(res.data);
      } catch (err) {
        message.error("Lỗi tải thông tin học phí");
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
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => (
        <Text strong>{Number(amount).toLocaleString("vi-VN")}đ</Text>
      ),
    },
    {
      title: "Phương thức",
      dataIndex: "method_name",
      key: "method_name",
    },
    {
      title: "Trạng thái",
      dataIndex: "payment_status",
      key: "payment_status",
      render: (status: string) => (
        <Tag color={paymentStatusColors[status] || "default"}>
          {status.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: "Đã thanh toán", value: "đã thanh toán" },
        { text: "Chờ thanh toán", value: "chờ thanh toán" },
        { text: "Thất bại", value: "thất bại" },
      ],
      onFilter: (value: any, record: any) => record.payment_status === value,
    },
    {
      title: "Ngày thanh toán",
      dataIndex: "payment_date",
      key: "payment_date",
      render: (d: string) =>
        d ? new Date(d).toLocaleDateString("vi-VN") : <Text type="secondary">—</Text>,
    },
  ];

  const totalPaid = payments
    .filter((p) => p.payment_status === "đã thanh toán")
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);

  const totalPending = payments
    .filter((p) => p.payment_status === "chờ thanh toán")
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);

  return (
    <div>
      <Title level={3}>
        <CreditCardOutlined style={{ marginRight: 8, color: "#1890ff" }} />
        Học phí của tôi
      </Title>
      <Paragraph type="secondary">
        Theo dõi tình trạng thanh toán học phí cho các lớp bạn đã đăng ký.
      </Paragraph>

      {/* Tổng kết */}
      {payments.length > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            <div>
              <Text type="secondary">Đã thanh toán: </Text>
              <Text strong style={{ color: "#52c41a", fontSize: "16px" }}>
                {totalPaid.toLocaleString("vi-VN")}đ
              </Text>
            </div>
            <div>
              <Text type="secondary">Chờ thanh toán: </Text>
              <Text strong style={{ color: "#faad14", fontSize: "16px" }}>
                {totalPending.toLocaleString("vi-VN")}đ
              </Text>
            </div>
          </div>
        </Card>
      )}

      <Card>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin size="large" />
          </div>
        ) : payments.length === 0 ? (
          <Empty description="Bạn chưa có bản ghi thanh toán nào" />
        ) : (
          <Table
            dataSource={payments}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            size="middle"
            scroll={{ x: 700 }}
          />
        )}
      </Card>
    </div>
  );
};

export default MyPaymentsPage;
