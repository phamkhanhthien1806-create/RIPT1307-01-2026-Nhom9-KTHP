import React, { useEffect, useState } from "react";
import { Table, Tag, Typography, Spin, message, Card, Empty } from "antd";
import { TrophyOutlined } from "@ant-design/icons";
import api from "../../utils/api";

const { Title, Paragraph, Text } = Typography;

const MyScoresPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get("/scores/my");
        setScores(res.data);
      } catch (err) {
        message.error("Lỗi tải bảng điểm");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 8) return "green";
    if (score >= 6.5) return "blue";
    if (score >= 5) return "orange";
    return "red";
  };

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
      title: "Trình độ",
      dataIndex: "level",
      key: "level",
      render: (level: string) => {
        const color = level === "Beginner" ? "green" : level === "Intermediate" ? "blue" : "red";
        return <Tag color={color}>{level}</Tag>;
      },
    },
    {
      title: "Điểm số",
      dataIndex: "score",
      key: "score",
      align: "center" as const,
      sorter: (a: any, b: any) => a.score - b.score,
      render: (score: number) => (
        <Tag
          color={getScoreColor(score)}
          style={{ fontSize: "16px", padding: "4px 12px", fontWeight: "bold" }}
        >
          {parseFloat(String(score)).toFixed(1)}
        </Tag>
      ),
    },
    {
      title: "Nhận xét",
      dataIndex: "comment",
      key: "comment",
      ellipsis: true,
      render: (comment: string) => comment || <Text type="secondary">Chưa có nhận xét</Text>,
    },
  ];

  const avgScore =
    scores.length > 0
      ? (scores.reduce((sum, s) => sum + parseFloat(s.score), 0) / scores.length).toFixed(2)
      : null;

  return (
    <div>
      <Title level={3}>
        <TrophyOutlined style={{ marginRight: 8, color: "#faad14" }} />
        Điểm số của tôi
      </Title>
      <Paragraph type="secondary">
        Bảng điểm tổng hợp theo các lớp học bạn đã tham gia.
      </Paragraph>

      {avgScore && (
        <Card style={{ marginBottom: 16, backgroundColor: "#f6ffed", borderColor: "#b7eb8f" }}>
          <Text style={{ fontSize: "16px" }}>
            📊 Điểm trung bình tổng:{" "}
            <Text strong style={{ fontSize: "20px", color: "#52c41a" }}>
              {avgScore} / 10
            </Text>
            <Text type="secondary"> ({scores.length} lớp học)</Text>
          </Text>
        </Card>
      )}

      <Card>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin size="large" />
          </div>
        ) : scores.length === 0 ? (
          <Empty description="Bạn chưa có điểm số nào" />
        ) : (
          <Table
            dataSource={scores}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            size="middle"
          />
        )}
      </Card>
    </div>
  );
};

export default MyScoresPage;
