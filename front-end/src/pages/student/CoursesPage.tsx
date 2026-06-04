import React, { useEffect, useState } from "react";
import { Card, Row, Col, Select, Input, Tag, Typography, Spin, Empty, message } from "antd";
import { SearchOutlined, ClockCircleOutlined, DollarOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { Meta } = Card;

const levelColors: Record<string, string> = {
  Beginner: "green",
  Intermediate: "blue",
  Advanced: "red",
};

const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<number | undefined>(undefined);
  const [filterLevel, setFilterLevel] = useState<string | undefined>(undefined);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [courseRes, catRes] = await Promise.all([
          api.get("/courses"),
          api.get("/courses/categories"),
        ]);
        setCourses(courseRes.data);
        setCategories(catRes.data);
      } catch (err) {
        message.error("Lỗi tải danh sách khóa học");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredCourses = courses.filter((c) => {
    if (filterCategory && c.category_id !== filterCategory) return false;
    if (filterLevel && c.level !== filterLevel) return false;
    if (searchText && !c.course_name.toLowerCase().includes(searchText.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <Spin size="large" tip="Đang tải khóa học..." />
      </div>
    );
  }

  return (
    <div>
      <Title level={3}>Danh sách Khóa học</Title>
      <Paragraph type="secondary">
        Chọn khóa học phù hợp với trình độ và mục tiêu của bạn, sau đó đăng ký lớp học.
      </Paragraph>

      {/* Bộ lọc */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Input
            placeholder="Tìm kiếm khóa học..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
        </Col>
        <Col xs={12} sm={8}>
          <Select
            placeholder="Lọc theo danh mục"
            style={{ width: "100%" }}
            value={filterCategory}
            onChange={(val) => setFilterCategory(val)}
            allowClear
          >
            {categories.map((cat: any) => (
              <Option key={cat.id} value={cat.id}>{cat.category_name}</Option>
            ))}
          </Select>
        </Col>
        <Col xs={12} sm={8}>
          <Select
            placeholder="Lọc theo trình độ"
            style={{ width: "100%" }}
            value={filterLevel}
            onChange={(val) => setFilterLevel(val)}
            allowClear
          >
            <Option value="Beginner">Beginner</Option>
            <Option value="Intermediate">Intermediate</Option>
            <Option value="Advanced">Advanced</Option>
          </Select>
        </Col>
      </Row>

      {/* Danh sách khóa học dạng Card Grid */}
      {filteredCourses.length === 0 ? (
        <Empty description="Không tìm thấy khóa học phù hợp" />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredCourses.map((course: any) => (
            <Col xs={24} sm={12} md={8} lg={6} key={course.id}>
              <Card
                hoverable
                onClick={() => navigate(`/student/courses/${course.id}`)}
                style={{ height: "100%", display: "flex", flexDirection: "column" }}
                bodyStyle={{ flex: 1, display: "flex", flexDirection: "column" }}
              >
                <Meta
                  title={
                    <Text strong style={{ fontSize: "14px" }}>
                      {course.course_name}
                    </Text>
                  }
                  description={
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                      <div>
                        <Tag color="default">{course.category_name}</Tag>
                        <Tag color={levelColors[course.level] || "default"}>{course.level}</Tag>
                      </div>

                      <Paragraph
                        type="secondary"
                        ellipsis={{ rows: 2 }}
                        style={{ margin: 0, fontSize: "12px" }}
                      >
                        {course.description}
                      </Paragraph>

                      <div style={{ marginTop: "auto" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            <ClockCircleOutlined /> {course.duration}
                          </Text>
                          <Text strong style={{ color: "#1890ff" }}>
                            <DollarOutlined />{" "}
                            {Number(course.tuition_fee).toLocaleString("vi-VN")}đ
                          </Text>
                        </div>
                      </div>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default CoursesPage;
