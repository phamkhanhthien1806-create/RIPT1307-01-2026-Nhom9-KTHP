import React, { useEffect, useState } from "react";
import { Typography, Spin, message, Card, Collapse, List, Tag, Button, Empty } from "antd";
import {
  ArrowLeftOutlined,
  PlayCircleOutlined,
  FileOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const LessonsPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/lessons/class/${classId}`);
        setLessons(res.data);
      } catch (err) {
        message.error("Lỗi tải danh sách bài học");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [classId]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/student/classes")}
        style={{ padding: 0, marginBottom: 16 }}
      >
        Quay lại lớp học
      </Button>

      <Title level={3}>
        <BookOutlined style={{ marginRight: 8 }} />
        Nội dung bài học
      </Title>
      <Paragraph type="secondary">
        Danh sách bài giảng, video và tài liệu của lớp học.
      </Paragraph>

      {lessons.length === 0 ? (
        <Empty description="Chưa có bài học nào được đăng tải cho lớp học này" />
      ) : (
        <Collapse
          accordion
          defaultActiveKey={lessons.length > 0 ? [lessons[0].id] : []}
          style={{ marginTop: 16 }}
        >
          {lessons.map((lesson: any, index: number) => (
            <Panel
              key={lesson.id}
              header={
                <span>
                  <Tag color="blue">Bài {lesson.lesson_order || index + 1}</Tag>
                  <Text strong>{lesson.lesson_title}</Text>
                </span>
              }
            >
              {/* Nội dung bài học */}
              {lesson.content && (
                <Card size="small" style={{ marginBottom: 12 }}>
                  <Paragraph style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                    {lesson.content}
                  </Paragraph>
                </Card>
              )}

              {/* Video */}
              {lesson.videos && lesson.videos.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <Text strong style={{ fontSize: "13px", color: "#1890ff" }}>
                    <PlayCircleOutlined /> Video bài giảng
                  </Text>
                  <List
                    size="small"
                    dataSource={lesson.videos}
                    renderItem={(video: any) => (
                      <List.Item>
                        <a href={video.video_url} target="_blank" rel="noopener noreferrer">
                          <PlayCircleOutlined style={{ marginRight: 8 }} />
                          {video.video_url}
                        </a>
                        {video.duration && (
                          <Tag style={{ marginLeft: 8 }}>
                            {Math.floor(video.duration / 60)} phút
                          </Tag>
                        )}
                      </List.Item>
                    )}
                  />
                </div>
              )}

              {/* Tài liệu */}
              {lesson.materials && lesson.materials.length > 0 && (
                <div>
                  <Text strong style={{ fontSize: "13px", color: "#52c41a" }}>
                    <FileOutlined /> Tài liệu đính kèm
                  </Text>
                  <List
                    size="small"
                    dataSource={lesson.materials}
                    renderItem={(material: any) => (
                      <List.Item>
                        <a
                          href={`http://localhost:5000${material.file_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FileOutlined style={{ marginRight: 8 }} />
                          {material.file_name}
                        </a>
                        {material.file_type && (
                          <Tag style={{ marginLeft: 8 }}>{material.file_type.toUpperCase()}</Tag>
                        )}
                      </List.Item>
                    )}
                  />
                </div>
              )}

              {/* Khi không có gì */}
              {(!lesson.content) &&
                (!lesson.videos || lesson.videos.length === 0) &&
                (!lesson.materials || lesson.materials.length === 0) && (
                  <Paragraph type="secondary" style={{ fontStyle: "italic" }}>
                    Bài học chưa có nội dung.
                  </Paragraph>
                )}
            </Panel>
          ))}
        </Collapse>
      )}
    </div>
  );
};

export default LessonsPage;
