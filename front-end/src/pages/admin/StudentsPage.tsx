import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Select,
  Button,
  Tag,
  Space,
  Drawer,
  Descriptions,
  message,
  Typography,
  Card,
  Switch,
  Avatar,
} from "antd";
import { SearchOutlined, EyeOutlined, UserOutlined } from "@ant-design/icons";
import api from "../../utils/api";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

interface StudentEnrollment {
  id: number;
  class_id: number;
  class_name: string;
  course_name: string;
  enroll_date: string;
  status: string;
  score: number | string | null;
}

interface StudentDetail {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
  birthday: string | null;
  gender: string | null;
  address: string | null;
  avatar: string | null;
}

interface StudentItem {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
  total_enrollments: number;
}

const AdminStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null);
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchText) params.search = searchText;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get("/students", { params });
      setStudents(res.data);
    } catch (error) {
      console.error("Lỗi tải danh sách học viên:", error);
      message.error("Không thể tải danh sách học viên");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [statusFilter]);

  const handleSearch = () => {
    fetchStudents();
  };

  const handleStatusToggle = async (id: number, checked: boolean) => {
    const newStatus = checked ? "hoạt động" : "bị khóa";
    try {
      await api.put(`/students/${id}/status`, { status: newStatus });
      message.success(`Đã cập nhật trạng thái tài khoản sang: ${newStatus}`);
      
      setStudents((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
      );
    } catch (error: any) {
      console.error("Lỗi cập nhật trạng thái tài khoản:", error);
      message.error(error.response?.data?.message || "Không thể cập nhật trạng thái");
    }
  };

  const handleOpenDetail = async (id: number) => {
    setIsDrawerOpen(true);
    setDrawerLoading(true);
    setSelectedStudent(null);
    setEnrollments([]);
    try {
      const res = await api.get(`/students/${id}`);
      setSelectedStudent(res.data.student);
      setEnrollments(res.data.enrollments || []);
    } catch (error) {
      console.error("Lỗi tải chi tiết học viên:", error);
      message.error("Không thể lấy thông tin chi tiết học viên");
    } finally {
      setDrawerLoading(false);
    }
  };

  const columns = [
    {
      title: "Họ và Tên",
      dataIndex: "full_name",
      key: "full_name",
      render: (text: string) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Số Điện Thoại",
      dataIndex: "phone",
      key: "phone",
      render: (phone: string) => phone || "N/A",
    },
    {
      title: "Ngày Tham Gia",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Số Lớp Đăng Ký",
      dataIndex: "total_enrollments",
      key: "total_enrollments",
      align: "center" as const,
      render: (count: number) => <Tag color="blue">{count} lớp</Tag>,
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      render: (status: string, record: StudentItem) => (
        <Space>
          <Switch
            checked={status === "hoạt động"}
            onChange={(checked) => handleStatusToggle(record.id, checked)}
            checkedChildren="Mở"
            unCheckedChildren="Khóa"
          />
          <Tag color={status === "hoạt động" ? "green" : "red"}>
            {status}
          </Tag>
        </Space>
      ),
    },
    {
      title: "Chi Tiết",
      key: "actions",
      width: 100,
      render: (_: any, record: StudentItem) => (
        <Button
          type="text"
          icon={<EyeOutlined style={{ color: "#1890ff" }} />}
          onClick={() => handleOpenDetail(record.id)}
          title="Xem hồ sơ & lịch sử học tập"
        />
      ),
    },
  ];

  return (
    <div>
      <Card bordered={false} style={{ marginBottom: "16px", borderRadius: "8px" }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Quản lý Học viên
          </Title>
          <Text type="secondary">Danh sách học viên đăng ký tài khoản trên hệ thống Tata English Center</Text>
        </div>
      </Card>

      {}
      <Card bordered={false} style={{ marginBottom: "16px", borderRadius: "8px" }}>
        <Space wrap size="large">
          <Input
            placeholder="Tìm theo họ tên, email, SĐT..."
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: "300px" }}
            allowClear
          />
          <Button type="primary" onClick={handleSearch}>
            Tìm kiếm
          </Button>
          <Select
            placeholder="Lọc trạng thái"
            style={{ width: "200px" }}
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            allowClear
          >
            <Option value="hoạt động">Hoạt động</Option>
            <Option value="bị khóa">Bị khóa</Option>
          </Select>
        </Space>
      </Card>

      {}
      <Card bordered={false} style={{ borderRadius: "8px" }}>
        <Table
          dataSource={students}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8 }}
          locale={{ emptyText: "Không tìm thấy học viên nào" }}
        />
      </Card>

      {}
      <Drawer
        title={<span style={{ fontWeight: "bold" }}>Hồ sơ chi tiết học viên</span>}
        placement="right"
        width={640}
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        destroyOnClose
      >
        {drawerLoading ? (
          <div style={{ textAlign: "center", paddingTop: "50px" }}>Đang tải thông tin...</div>
        ) : selectedStudent ? (
          <div>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "24px", gap: "16px" }}>
              <Avatar size={64} icon={<UserOutlined />} src={selectedStudent.avatar || undefined} />
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  {selectedStudent.full_name}
                </Title>
                <Space style={{ marginTop: "4px" }}>
                  <Tag color={selectedStudent.status === "hoạt động" ? "green" : "red"}>
                    Tài khoản: {selectedStudent.status}
                  </Tag>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    ID: #{selectedStudent.id}
                  </Text>
                </Space>
              </div>
            </div>

            <Descriptions title="Thông tin liên hệ & cá nhân" bordered column={1} size="small" style={{ marginBottom: "24px" }}>
              <Descriptions.Item label="Email">{selectedStudent.email}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{selectedStudent.phone || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Ngày sinh">
                {selectedStudent.birthday ? dayjs(selectedStudent.birthday).format("DD/MM/YYYY") : "Chưa cập nhật"}
              </Descriptions.Item>
              <Descriptions.Item label="Giới tính">{selectedStudent.gender || "Chưa cập nhật"}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">{selectedStudent.address || "Chưa cập nhật"}</Descriptions.Item>
              <Descriptions.Item label="Ngày đăng ký tài khoản">
                {dayjs(selectedStudent.created_at).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
            </Descriptions>

            <Title level={5} style={{ marginBottom: "12px" }}>
              Lịch sử ghi danh & kết quả học tập
            </Title>
            <Table
              dataSource={enrollments}
              rowKey="id"
              size="small"
              pagination={false}
              columns={[
                {
                  title: "Lớp học",
                  dataIndex: "class_name",
                  key: "class_name",
                  render: (text, record) => (
                    <div>
                      <Text strong>{text}</Text>
                      <div style={{ fontSize: "11px", color: "#8c8c8c" }}>{record.course_name}</div>
                    </div>
                  ),
                },
                {
                  title: "Ngày đăng ký",
                  dataIndex: "enroll_date",
                  key: "enroll_date",
                  render: (date) => dayjs(date).format("DD/MM/YYYY"),
                },
                {
                  title: "Trạng thái",
                  dataIndex: "status",
                  key: "status",
                  render: (status: string) => (
                    <Tag color={status === "đã duyệt" ? "blue" : status === "từ chối" ? "red" : "orange"}>
                      {status}
                    </Tag>
                  ),
                },
                {
                  title: "Điểm số",
                  dataIndex: "score",
                  key: "score",
                  align: "center",
                  render: (score) => {
                    if (score === null || score === undefined) return <Text type="secondary">Chưa có</Text>;
                    const parsed = Number(score);
                    return (
                      <Tag color={parsed >= 8 ? "green" : parsed >= 5 ? "blue" : "orange"} style={{ fontWeight: "bold" }}>
                        {score}
                      </Tag>
                    );
                  },
                },
              ]}
              locale={{ emptyText: "Học viên này chưa đăng ký lớp học nào" }}
            />
          </div>
        ) : (
          <div style={{ textAlign: "center", paddingTop: "50px" }}>Không tìm thấy học viên</div>
        )}
      </Drawer>
    </div>
  );
};

export default AdminStudentsPage;
