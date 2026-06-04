import React, { useEffect, useState } from "react";
import { List, Typography, Button, Card, Spin, message, Badge } from "antd";
import { BellOutlined, CheckOutlined } from "@ant-design/icons";
import api from "../../utils/api";

const { Title, Paragraph, Text } = Typography;

const NotificationsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      message.error("Lỗi tải danh sách thông báo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      message.success("Đã đánh dấu đã đọc");
      fetchNotifications();
    } catch (err) {
      message.error("Không thể đánh dấu đọc");
    }
  };

  const handleMarkReadAll = async () => {
    try {
      await api.put("/notifications/read-all");
      message.success("Đã đánh dấu tất cả là đã đọc");
      fetchNotifications();
    } catch (err) {
      message.error("Thao tác thất bại");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>
          <BellOutlined style={{ marginRight: 8, color: "#ff4d4f" }} />
          Thông báo của tôi
          {unreadCount > 0 && (
            <Badge count={unreadCount} style={{ marginLeft: 8, backgroundColor: "#ff4d4f" }} />
          )}
        </Title>
        {unreadCount > 0 && (
          <Button type="primary" icon={<CheckOutlined />} onClick={handleMarkReadAll}>
            Đọc tất cả
          </Button>
        )}
      </div>

      <Card>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin size="large" />
          </div>
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item
                actions={[
                  !item.is_read ? (
                    <Button
                      type="link"
                      icon={<CheckOutlined />}
                      onClick={() => handleMarkRead(item.id)}
                    >
                      Đánh dấu đã đọc
                    </Button>
                  ) : (
                    <span style={{ color: "#bfbfbf" }}>Đã đọc</span>
                  ),
                ]}
                style={{
                  backgroundColor: item.is_read ? "transparent" : "#f0f5ff",
                  padding: "16px 24px",
                  borderRadius: 8,
                  marginBottom: 8,
                  border: "1px solid #f0f0f0",
                }}
              >
                <List.Item.Meta
                  title={
                    <Text strong={!item.is_read} style={{ fontSize: "16px" }}>
                      {item.title}
                    </Text>
                  }
                  description={
                    <div>
                      <Paragraph style={{ margin: "4px 0 0 0", color: "#434343" }}>
                        {item.message}
                      </Paragraph>
                      <Text type="secondary" style={{ fontSize: "12px", display: "block", marginTop: 8 }}>
                        {new Date(item.created_at).toLocaleString("vi-VN")}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
            locale={{ emptyText: "Bạn không có thông báo nào" }}
          />
        )}
      </Card>
    </div>
  );
};

export default NotificationsPage;
