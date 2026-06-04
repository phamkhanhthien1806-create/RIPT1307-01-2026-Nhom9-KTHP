import React, { useEffect, useState } from "react";
import { Table, Typography, Spin, message, Card, Empty } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import api from "../../utils/api";

const { Title, Paragraph } = Typography;

const MySchedulePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<any[]>([]);

  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      try {
        const res = await api.get("/classes/my/schedules");
        setSchedules(res.data);
      } catch (err) {
        message.error("Lỗi tải lịch học");
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  const columns = [
    {
      title: "Thứ",
      dataIndex: "day_of_week",
      key: "day_of_week",
      render: (day: string) => <strong>{day}</strong>,
    },
    {
      title: "Giờ học",
      key: "time",
      render: (_: any, record: any) => {
        // start_time and end_time are usually formatted as HH:mm:ss or HH:mm
        const start = record.start_time.substring(0, 5);
        const end = record.end_time.substring(0, 5);
        return `${start} - ${end}`;
      },
    },
    {
      title: "Phòng học",
      dataIndex: "room",
      key: "room",
      render: (room: string) => room || "Chưa xếp phòng",
    },
    {
      title: "Lớp học",
      dataIndex: "class_name",
      key: "class_name",
    },
    {
      title: "Khóa học",
      dataIndex: "course_name",
      key: "course_name",
      ellipsis: true,
    },
  ];

  return (
    <div>
      <Title level={3}>
        <CalendarOutlined style={{ marginRight: 8, color: "#1890ff" }} />
        Lịch học cá nhân
      </Title>
      <Paragraph type="secondary">
        Lịch học hàng tuần của các lớp học bạn đang tham gia.
      </Paragraph>

      <Card>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin size="large" />
          </div>
        ) : schedules.length === 0 ? (
          <Empty description="Bạn chưa có lịch học nào. Vui lòng đăng ký khóa học." />
        ) : (
          <Table
            dataSource={schedules}
            columns={columns}
            rowKey="id"
            pagination={false}
            size="middle"
          />
        )}
      </Card>
    </div>
  );
};

export default MySchedulePage;
