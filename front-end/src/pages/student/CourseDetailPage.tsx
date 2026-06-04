import React, { useEffect, useState } from "react";
import { Card, Typography, Descriptions, Tag, Table, Button, Spin, message, Modal, Row, Col } from "antd";
import { ArrowLeftOutlined, TeamOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";

const { Title, Paragraph, Text } = Typography;

const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/courses/${id}`);
        setCourse(res.data.course);
        setClasses(res.data.classes);
      } catch (err) {
        message.error("Lỗi tải chi tiết khóa học");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleEnroll = (classId: number, className: string) => {
    Modal.confirm({
      title: "Xác nhận đăng ký",
      content: `Bạn muốn đăng ký vào lớp "${className}"? Đơn đăng ký sẽ được quản trị viên duyệt.`,
      okText: "Đăng ký",
      cancelText: "Hủy",
      onOk: async () => {
        setEnrolling(true);
        try {
          await api.post("/enrollments", { class_id: classId });
          message.success("Đăng ký thành công! Vui lòng chờ duyệt.");
        } catch (err: any) {
          const errMsg = err.response?.data?.message || "Đăng ký thất bại";
          message.error(errMsg);
        } finally {
          setEnrolling(false);
        }
      },
    });
  };

  const classColumns = [
    {
      title: "Tên lớp",
      dataIndex: "class_name",
      key: "class_name",
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: "Giáo viên",
      dataIndex: "teacher_name",
      key: "teacher_name",
      render: (name: string) => (
        <span>
          <TeamOutlined style={{ marginRight: 4 }} />
          {name}
        </span>
      ),
    },
    {
      title: "Bắt đầu",
      dataIndex: "start_date",
      key: "start_date",
      render: (d: string) => new Date(d).toLocaleDateString("vi-VN"),
    },
    {
      title: "Kết thúc",
      dataIndex: "end_date",
      key: "end_date",
      render: (d: string) => new Date(d).toLocaleDateString("vi-VN"),
    },
    {
      title: "Sĩ số tối đa",
      dataIndex: "max_students",
      key: "max_students",
      align: "center" as const,
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: any) => (
        <Button
          type="primary"
          size="small"
          loading={enrolling}
          onClick={() => handleEnroll(record.id, record.class_name)}
        >
          Đăng ký
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!course) {
    return <div>Không tìm thấy khóa học</div>;
  }

  const levelColor = course.level === "Beginner" ? "green" : course.level === "Intermediate" ? "blue" : "red";

  return (
    <div>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/student/courses")}
        style={{ padding: 0, marginBottom: 16 }}
      >
        Quay lại danh sách khóa học
      </Button>

      <Card>
        <Row gutter={[24, 16]}>
          <Col xs={24} md={16}>
            <Title level={3} style={{ marginBottom: 8 }}>
              {course.course_name}
            </Title>
            <div style={{ marginBottom: 12 }}>
              <Tag color="default">{course.category_name}</Tag>
              <Tag color={levelColor}>{course.level}</Tag>
            </div>
            <Paragraph>{course.description}</Paragraph>
          </Col>
          <Col xs={24} md={8}>
            <Card
              style={{ backgroundColor: "#fafafa", borderRadius: 8 }}
              bodyStyle={{ padding: "16px" }}
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Học phí">
                  <Text strong style={{ color: "#1890ff", fontSize: "16px" }}>
                    {Number(course.tuition_fee).toLocaleString("vi-VN")}đ
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Thời lượng">
                  <ClockCircleOutlined style={{ marginRight: 4 }} />
                  {course.duration}
                </Descriptions.Item>
                <Descriptions.Item label="Danh mục">
                  {course.category_name}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Danh sách lớp học */}
      <Card title="Các lớp đang mở" style={{ marginTop: 24 }}>
        {classes.length === 0 ? (
          <Paragraph type="secondary">Hiện tại chưa có lớp nào được mở cho khóa học này.</Paragraph>
        ) : (
          <Table
            dataSource={classes}
            columns={classColumns}
            rowKey="id"
            pagination={false}
            size="middle"
          />
        )}
      </Card>
    </div>
  );
};

export default CourseDetailPage;
