import React, { useState, useEffect } from "react";
import { Layout, Menu, Avatar, Dropdown, Badge, Popover, List, Button, Drawer, Typography } from "antd";
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  BookOutlined,
  TeamOutlined,
  DashboardOutlined,
  CalendarOutlined,
  AuditOutlined,
  CreditCardOutlined,
  FileTextOutlined,
  NotificationOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { logout } from "../store/slices/authSlice";
import type { RootState } from "../store";
import api from "../utils/api";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileVisible, setMobileVisible] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isTeacherOrAdmin = user?.role === "quản trị viên";


  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error("Lỗi lấy thông báo:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkReadAll = async () => {
    try {
      await api.put("/notifications/read-all");
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };


  const getMenuItems = () => {
    if (isTeacherOrAdmin) {
      return [
        { key: "/admin/dashboard", icon: <DashboardOutlined />, label: <Link to="/admin/dashboard">Bảng điều khiển</Link> },
        { key: "/admin/courses", icon: <BookOutlined />, label: <Link to="/admin/courses">Quản lý Khóa học</Link> },
        { key: "/admin/classes", icon: <CalendarOutlined />, label: <Link to="/admin/classes">Quản lý Lớp học</Link> },
        { key: "/admin/students", icon: <TeamOutlined />, label: <Link to="/admin/students">Quản lý Học viên</Link> },
        { key: "/admin/teachers", icon: <SmileOutlined />, label: <Link to="/admin/teachers">Quản lý Giáo viên</Link> },
        { key: "/admin/enrollments", icon: <AuditOutlined />, label: <Link to="/admin/enrollments">Duyệt Đăng ký</Link> },
        { key: "/admin/scores", icon: <FileTextOutlined />, label: <Link to="/admin/scores">Quản lý Điểm số</Link> },
        { key: "/admin/payments", icon: <CreditCardOutlined />, label: <Link to="/admin/payments">Quản lý Học phí</Link> },
        { key: "/admin/notifications", icon: <NotificationOutlined />, label: <Link to="/admin/notifications">Gửi Thông báo</Link> },
      ];
    } else {
      return [
        { key: "/student/dashboard", icon: <DashboardOutlined />, label: <Link to="/student/dashboard">Bảng điều khiển</Link> },
        { key: "/student/courses", icon: <BookOutlined />, label: <Link to="/student/courses">Đăng ký Khóa học</Link> },
        { key: "/student/classes", icon: <CalendarOutlined />, label: <Link to="/student/classes">Lớp học của tôi</Link> },
        { key: "/student/scores", icon: <FileTextOutlined />, label: <Link to="/student/scores">Điểm số của tôi</Link> },
        { key: "/student/payments", icon: <CreditCardOutlined />, label: <Link to="/student/payments">Học phí của tôi</Link> },
        { key: "/student/profile", icon: <UserOutlined />, label: <Link to="/student/profile">Hồ sơ cá nhân</Link> },
      ];
    }
  };


  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.startsWith("/admin/dashboard")) return "/admin/dashboard";
    if (path.startsWith("/admin/courses")) return "/admin/courses";
    if (path.startsWith("/admin/classes")) return "/admin/classes";
    if (path.startsWith("/admin/students")) return "/admin/students";
    if (path.startsWith("/admin/teachers")) return "/admin/teachers";
    if (path.startsWith("/admin/enrollments")) return "/admin/enrollments";
    if (path.startsWith("/admin/scores")) return "/admin/scores";
    if (path.startsWith("/admin/payments")) return "/admin/payments";
    if (path.startsWith("/admin/notifications")) return "/admin/notifications";

    if (path.startsWith("/student/dashboard")) return "/student/dashboard";
    if (path.startsWith("/student/courses")) return "/student/courses";
    if (path.startsWith("/student/classes") || path.startsWith("/student/lessons")) return "/student/classes";
    if (path.startsWith("/student/scores")) return "/student/scores";
    if (path.startsWith("/student/payments")) return "/student/payments";
    if (path.startsWith("/student/profile")) return "/student/profile";

    return path;
  };


  const userMenu = (
    <Menu>
      <Menu.Item key="role" disabled>
        <span style={{ fontSize: "12px", color: "#8c8c8c" }}>
          Vai trò: {user?.role.toUpperCase()}
        </span>
      </Menu.Item>
      {!isTeacherOrAdmin && (
        <Menu.Item key="profile" icon={<UserOutlined />}>
          <Link to="/student/profile">Hồ sơ cá nhân</Link>
        </Menu.Item>
      )}
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout} danger>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );


  const notificationContent = (
    <div style={{ width: "300px", maxHeight: "400px", overflowY: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", borderBottom: "1px solid #f0f0f0", paddingBottom: "8px" }}>
        <Text strong>Thông báo mới nhận</Text>
        {unreadCount > 0 && (
          <Button type="link" size="small" onClick={handleMarkReadAll} style={{ padding: 0 }}>
            Đọc tất cả
          </Button>
        )}
      </div>
      <List
        dataSource={notifications}
        renderItem={(item) => (
          <List.Item
            style={{
              padding: "8px 4px",
              backgroundColor: item.is_read ? "transparent" : "#e6f7ff",
              cursor: "pointer",
            }}
            onClick={() => !item.is_read && handleMarkRead(item.id)}
          >
            <List.Item.Meta
              title={
                <span style={{ fontSize: "14px", fontWeight: item.is_read ? "normal" : "bold" }}>
                  {item.title}
                </span>
              }
              description={
                <div>
                  <div style={{ fontSize: "12px", color: "#595959" }}>{item.message}</div>
                  <div style={{ fontSize: "10px", color: "#bfbfbf", marginTop: "4px" }}>
                    {new Date(item.created_at).toLocaleString("vi-VN")}
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
        locale={{ emptyText: "Không có thông báo nào" }}
      />
    </div>
  );

  const sidebarMenu = (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[getSelectedKey()]}
      items={getMenuItems()}
      onClick={() => setMobileVisible(false)}
      style={{ borderRight: 0 }}
    />
  );

  const avatarUrl = user?.avatar ? (user.avatar.startsWith("http") ? user.avatar : `http://localhost:5000${user.avatar}`) : undefined;

  return (
    <Layout style={{ minHeight: "100vh" }}>

      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        onCollapse={(value) => setCollapsed(value)}
        className="desktop-sider"
        style={{
          boxShadow: "2px 0 8px 0 rgba(29,35,41,.05)",
          zIndex: 10,
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        <div
          style={{
            height: "64px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "#002140",
          }}
        >
          <div
            style={{
              color: "#fff",
              fontSize: collapsed ? "18px" : "16px",
              fontWeight: "bold",
              transition: "all 0.2s",
            }}
          >
            {collapsed ? "T" : "TATA ENGLISH"}
          </div>
        </div>
        {sidebarMenu}
      </Sider>


      <Drawer
        title="Tata English Center"
        placement="left"
        onClose={() => setMobileVisible(false)}
        visible={mobileVisible}
        bodyStyle={{ padding: 0, backgroundColor: "#001529" }}
        headerStyle={{ borderBottom: "1px solid #002140", backgroundColor: "#001529" }}
        drawerStyle={{ color: "#fff" }}
      >
        {sidebarMenu}
      </Drawer>

      <Layout style={{ display: "flex", flexDirection: "column" }}>

        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 1px 4px rgba(0,21,41,.08)",
            position: "sticky",
            top: 0,
            zIndex: 9,
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>

            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="desktop-toggle-btn"
              style={{ fontSize: "16px", width: "64px", height: "64px" }}
            />

            <Button
              type="text"
              icon={<MenuUnfoldOutlined />}
              onClick={() => setMobileVisible(true)}
              className="mobile-toggle-btn"
              style={{ fontSize: "16px", marginRight: "16px" }}
            />
            <Text strong style={{ fontSize: "16px", marginLeft: "8px" }} className="header-title">
              Xin chào, {user?.full_name}
            </Text>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>

            <Popover content={notificationContent} title={null} trigger="click" placement="bottomRight">
              <Badge count={unreadCount} overflowCount={9} size="small" style={{ cursor: "pointer" }}>
                <BellOutlined style={{ fontSize: "20px", cursor: "pointer", padding: "4px" }} />
              </Badge>
            </Popover>


            <Dropdown overlay={userMenu} trigger={["click"]} placement="bottomRight">
              <div style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                <Avatar src={avatarUrl} icon={!avatarUrl && <UserOutlined />} style={{ backgroundColor: "#1890ff" }} />
                <span className="user-name-text" style={{ fontWeight: 500 }}>
                  {user?.full_name}
                </span>
              </div>
            </Dropdown>
          </div>
        </Header>


        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            background: "#fff",
            minHeight: 280,
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          {children}
        </Content>
      </Layout>


      <style>{`
        @media (max-width: 992px) {
          .desktop-sider {
            display: none !important;
          }
          .desktop-toggle-btn {
            display: none !important;
          }
        }
        @media (min-width: 993px) {
          .mobile-toggle-btn {
            display: none !important;
          }
        }
      `}</style>
    </Layout>
  );
};

export default MainLayout;
