import React, { useEffect, useState } from "react";
import { Typography, Spin, message, Card, Empty, Calendar, Modal, Select } from "antd";
import { 
  EnvironmentOutlined, 
  UserOutlined,
  CalendarOutlined
} from "@ant-design/icons";
import api from "../../utils/api";
import dayjs from "dayjs";

const { Title, Paragraph } = Typography;

const TIME_SLOTS = [
  { id: "08:30", label: "08:30", timeRange: "08:30 - 10:00" },
  { id: "10:15", label: "10:15", timeRange: "10:15 - 11:45" },
  { id: "13:00", label: "13:00", timeRange: "14:00 - 15:30" },
  { id: "18:00", label: "18:00", timeRange: "18:00 - 19:30" },
  { id: "19:45", label: "19:45", timeRange: "19:45 - 21:15" },
];

const MySchedulePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

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

  const getSlotRowId = (startTimeStr: string) => {
    const hour = parseInt(startTimeStr.split(":")[0]);
    if (hour === 8 || hour === 9) return "08:30";
    if (hour === 10 || hour === 11) return "10:15";
    if (hour === 13 || hour === 14 || hour === 15) return "13:00";
    if (hour === 18) return "18:00";
    if (hour === 19 || hour === 20 || hour === 21) {
      const min = parseInt(startTimeStr.split(":")[1]);
      if (hour === 19 && min < 30) return "18:00";
      return "19:45";
    }
    return "18:00";
  };

  const getCourseTheme = (courseName: string) => {
    const name = (courseName || "").toLowerCase();
    if (name.includes("toeic")) {
      return {
        bg: "#f0f5ff",
        border: "#2f54eb",
        text: "#1d39c4",
        badgeBg: "#d6e4ff",
        badgeText: "#2f54eb"
      };
    } else if (name.includes("ielts")) {
      return {
        bg: "#fff1f0",
        border: "#f5222d",
        text: "#cf1322",
        badgeBg: "#ffccc7",
        badgeText: "#f5222d"
      };
    } else if (name.includes("business") || name.includes("office")) {
      return {
        bg: "#f5f5f5",
        border: "#8c8c8c",
        text: "#262626",
        badgeBg: "#e8e8e8",
        badgeText: "#595959"
      };
    } else if (name.includes("everyday") || name.includes("giao tiếp") || name.includes("communication") || name.includes("comm")) {
      return {
        bg: "#f6ffed",
        border: "#52c41a",
        text: "#389e0d",
        badgeBg: "#d9f7be",
        badgeText: "#52c41a"
      };
    } else if (name.includes("grammar") || name.includes("ngữ pháp")) {
      return {
        bg: "#fff7e6",
        border: "#ffa940",
        text: "#d46b08",
        badgeBg: "#ffe7ba",
        badgeText: "#d46b08"
      };
    } else {
      return {
        bg: "#e6f7ff",
        border: "#1890ff",
        text: "#096dd9",
        badgeBg: "#bae7ff",
        badgeText: "#1890ff"
      };
    }
  };

  const isScheduleOngoing = (schedule: any) => {
    const today = dayjs();
    const daysInVi = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
    const currentDayVi = daysInVi[today.day()];

    if (schedule.day_of_week !== currentDayVi) return false;

    const nowStr = today.format("HH:mm:ss");
    return nowStr >= schedule.start_time && nowStr <= schedule.end_time;
  };

  const getWeekDays = () => {
    const today = dayjs();
    const dayOfWeek = today.day();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = today.add(mondayOffset, "day");

    const days = [];
    const vietnameseNames = [
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy",
      "Chủ Nhật"
    ];

    for (let i = 0; i < 7; i++) {
      const d = monday.add(i, "day");
      days.push({
        name: vietnameseNames[i],
        dateStr: d.format("DD/MM"),
        fullDateStr: d.format("YYYY-MM-DD"),
        isToday: d.isSame(today, "day"),
      });
    }
    return days;
  };

  const weekDays = getWeekDays();

  const handleShowDetails = (schedule: any) => {
    setSelectedSchedule(schedule);
    setModalVisible(true);
  };

  const dateCellRender = (value: any) => {
    const dateVal = dayjs(value.toDate());
    const daysInVi = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
    const cellDayVi = daysInVi[dateVal.day()];
    const cellDateStr = dateVal.format("YYYY-MM-DD");

    const daySchedules = schedules.filter((s: any) => {
      if (s.day_of_week !== cellDayVi) return false;
      if (s.start_date && cellDateStr < dayjs(s.start_date).format("YYYY-MM-DD")) return false;
      if (s.end_date && cellDateStr > dayjs(s.end_date).format("YYYY-MM-DD")) return false;
      return true;
    });

    return (
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {daySchedules.map((s: any) => {
          const theme = getCourseTheme(s.course_name);
          return (
            <li key={s.id} style={{ margin: "2px 0" }}>
              <div
                style={{
                  fontSize: "10px",
                  padding: "1px 4px",
                  backgroundColor: theme.bg,
                  borderLeft: `2.5px solid ${theme.border}`,
                  color: theme.text,
                  borderRadius: "2px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  cursor: "pointer"
                }}
                title={`${s.class_name} (${s.start_time.substring(0, 5)} - ${s.end_time.substring(0, 5)})`}
                onClick={() => handleShowDetails(s)}
              >
                <strong>{s.start_time.substring(0, 5)}</strong> {s.course_name}
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div style={{ padding: "0" }}>
      <style>{`
        .schedule-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 16px;
        }
        .schedule-table th, .schedule-table td {
          border: 1px solid #f0f0f0;
          padding: 10px;
          text-align: center;
          vertical-align: top;
          width: 13%;
        }
        .schedule-table th:first-child, .schedule-table td:first-child {
          width: 9%;
          vertical-align: middle;
          background-color: #fafafa;
          font-weight: 600;
          color: #555;
          text-align: center;
          padding: 8px 4px;
        }
        .schedule-header-today {
          background-color: #e6f7ff;
          color: #1890ff !important;
        }
        .today-badge {
          background-color: #002140;
          color: #fff;
          border-radius: 12px;
          padding: 2px 8px;
          font-size: 10px;
          display: inline-block;
          margin-top: 4px;
          font-weight: bold;
        }
        .schedule-card {
          border-radius: 6px;
          padding: 10px;
          text-align: left;
          font-size: 12px;
          position: relative;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
          transition: all 0.2s;
          margin-bottom: 8px;
          cursor: pointer;
        }
        .schedule-card:hover {
          box-shadow: 0 4px 8px rgba(0,0,0,0.06);
          transform: translateY(-1px);
        }
        .blinking-dot {
          width: 7px;
          height: 7px;
          background-color: #1890ff;
          border-radius: 50%;
          position: absolute;
          top: 8px;
          right: 8px;
          animation: blink-anim 1.5s infinite;
        }
        @keyframes blink-anim {
          0% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(0.8); opacity: 0.5; }
        }
        .pill-toggle-container {
          background-color: #f5f5f5;
          border-radius: 20px;
          padding: 2px;
          display: inline-flex;
          border: 1px solid #e8e8e8;
        }
        .pill-toggle-button {
          border-radius: 18px;
          border: none;
          padding: 4px 16px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
          background: transparent;
          color: #595959;
          font-size: 13px;
        }
        .pill-toggle-button.active {
          background-color: #fff;
          color: #1890ff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.08);
        }
        .ant-picker-content thead th {
          font-size: 0 !important;
        }
        .ant-picker-content thead th:nth-child(1)::before {
          content: "Chủ Nhật";
          font-size: 13px;
          font-weight: 600;
          color: #555;
        }
        .ant-picker-content thead th:nth-child(2)::before {
          content: "Thứ Hai";
          font-size: 13px;
          font-weight: 600;
          color: #555;
        }
        .ant-picker-content thead th:nth-child(3)::before {
          content: "Thứ Ba";
          font-size: 13px;
          font-weight: 600;
          color: #555;
        }
        .ant-picker-content thead th:nth-child(4)::before {
          content: "Thứ Tư";
          font-size: 13px;
          font-weight: 600;
          color: #555;
        }
        .ant-picker-content thead th:nth-child(5)::before {
          content: "Thứ Năm";
          font-size: 13px;
          font-weight: 600;
          color: #555;
        }
        .ant-picker-content thead th:nth-child(6)::before {
          content: "Thứ Sáu";
          font-size: 13px;
          font-weight: 600;
          color: #555;
        }
        .ant-picker-content thead th:nth-child(7)::before {
          content: "Thứ Bảy";
          font-size: 13px;
          font-weight: 600;
          color: #555;
        }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Lịch học cá nhân
          </Title>
          <Paragraph type="secondary" style={{ margin: "4px 0 0 0" }}>
            Lịch học hàng tuần của các lớp học bạn đang tham gia.
          </Paragraph>
        </div>
        <div className="pill-toggle-container">
          <button
            className={`pill-toggle-button ${viewMode === "week" ? "active" : ""}`}
            onClick={() => setViewMode("week")}
          >
            Tuần
          </button>
          <button
            className={`pill-toggle-button ${viewMode === "month" ? "active" : ""}`}
            onClick={() => setViewMode("month")}
          >
            Tháng
          </button>
        </div>
      </div>

      {loading ? (
        <Card style={{ minHeight: 400, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Spin size="large" />
        </Card>
      ) : (
        <>
          {viewMode === "week" ? (
            <Card bodyStyle={{ padding: "16px 0", overflowX: "auto" }}>
              {schedules.length === 0 ? (
                <div style={{ padding: "60px 0" }}>
                  <Empty description="Bạn chưa có lịch học nào. Vui lòng đăng ký khóa học." />
                </div>
              ) : (
                <div style={{ minWidth: 800, padding: "0 16px" }}>
                  <table className="schedule-table">
                    <thead>
                      <tr>
                        <th>Giờ</th>
                        {weekDays.map((day) => (
                          <th key={day.name} className={day.isToday ? "schedule-header-today" : ""}>
                            <div style={{ fontWeight: 600 }}>{day.name}</div>
                            <div style={{ fontSize: "11px", color: day.isToday ? "#1890ff" : "#8c8c8c", marginTop: 2 }}>
                              {day.dateStr}
                            </div>
                            {day.isToday && <span className="today-badge">Hôm nay</span>}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {TIME_SLOTS.map((slot) => (
                        <tr key={slot.id}>
                          <td>
                            <strong style={{ fontSize: "13px" }}>{slot.label}</strong>
                          </td>
                          {weekDays.map((day) => {
                            const cellSchedules = schedules.filter((s) => {
                              return s.day_of_week === day.name && getSlotRowId(s.start_time) === slot.id;
                            });

                            return (
                              <td key={day.name} style={{ backgroundColor: day.isToday ? "#fafafa" : "#fff" }}>
                                {cellSchedules.map((s) => {
                                  const theme = getCourseTheme(s.course_name);
                                  const ongoing = isScheduleOngoing(s);
                                  return (
                                    <div
                                      key={s.id}
                                      className="schedule-card"
                                      style={{
                                        backgroundColor: theme.bg,
                                        borderLeft: `4px solid ${theme.border}`,
                                        color: theme.text,
                                      }}
                                      onClick={() => handleShowDetails(s)}
                                    >
                                      {ongoing && <div className="blinking-dot" />}
                                      <div style={{ fontWeight: "bold", fontSize: "13px", marginBottom: 6, paddingRight: ongoing ? 12 : 0 }}>
                                        {s.course_name}
                                      </div>
                                      <div style={{ display: "flex", flexDirection: "column", gap: 3, color: "#595959", fontSize: "11px" }}>
                                        <span style={{ display: "inline-flex", alignItems: "center" }}>
                                          <EnvironmentOutlined style={{ marginRight: 4, color: "#8c8c8c" }} />
                                          {s.room || "Chưa xếp phòng"}
                                        </span>
                                        <span style={{ display: "inline-flex", alignItems: "center" }}>
                                          <UserOutlined style={{ marginRight: 4, color: "#8c8c8c" }} />
                                          {s.teacher_name || "Chưa xếp GV"}
                                        </span>
                                        {ongoing && (
                                          <span 
                                            style={{ 
                                              marginTop: 4, 
                                              display: "inline-block", 
                                              alignSelf: "flex-start",
                                              backgroundColor: "#e6f7ff",
                                              color: "#1890ff",
                                              padding: "1px 6px",
                                              borderRadius: "4px",
                                              fontWeight: "bold",
                                              fontSize: "10px",
                                              border: "1px solid #91d5ff"
                                            }}
                                          >
                                            ĐANG DIỄN RA
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          ) : (
            <Card>
              <Calendar 
                dateCellRender={dateCellRender} 
                headerRender={({ value, onChange }) => {
                  const currentYear = value.year();
                  const currentMonth = value.month();
                  const years = [];
                  for (let i = currentYear - 5; i <= currentYear + 5; i++) {
                    years.push(i);
                  }
                  const months = [
                    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
                    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
                  ];

                  return (
                    <div style={{ padding: "12px 16px", display: "flex", justifyContent: "flex-end", gap: 8 }}>
                      <Select
                        size="middle"
                        value={currentYear}
                        onChange={newYear => {
                          const now = value.clone().year(newYear);
                          onChange(now);
                        }}
                      >
                        {years.map(y => (
                          <Select.Option key={y} value={y}>{y}</Select.Option>
                        ))}
                      </Select>
                      <Select
                        size="middle"
                        value={currentMonth}
                        onChange={newMonth => {
                          const now = value.clone().month(newMonth);
                          onChange(now);
                        }}
                      >
                        {months.map((m, index) => (
                          <Select.Option key={index} value={index}>{m}</Select.Option>
                        ))}
                      </Select>
                    </div>
                  );
                }}
              />
            </Card>
          )}
        </>
      )}

      <Modal
        title={<span style={{ color: "#002140", fontWeight: "bold", fontSize: "16px" }}>Chi tiết lịch học</span>}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        destroyOnClose
        centered
      >
        {selectedSchedule && (
          <div style={{ padding: "8px 0" }}>
            <div style={{ marginBottom: 16, borderBottom: "1px solid #f0f0f0", paddingBottom: 12 }}>
              <h4 style={{ margin: 0, color: "#1890ff", fontSize: "16px" }}>{selectedSchedule.course_name}</h4>
              <div style={{ fontSize: "12px", color: "#8c8c8c", marginTop: 4 }}>
                Lớp học: {selectedSchedule.class_name}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <CalendarOutlined style={{ color: "#1890ff", fontSize: "16px" }} />
                <div>
                  <div style={{ fontSize: "12px", color: "#8c8c8c" }}>Thời gian</div>
                  <div style={{ fontWeight: 500, fontSize: "14px" }}>
                    {selectedSchedule.day_of_week} ({selectedSchedule.start_time.substring(0, 5)} - {selectedSchedule.end_time.substring(0, 5)})
                  </div>
                </div>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <EnvironmentOutlined style={{ color: "#52c41a", fontSize: "16px" }} />
                <div>
                  <div style={{ fontSize: "12px", color: "#8c8c8c" }}>Phòng học</div>
                  <div style={{ fontWeight: 500, fontSize: "14px" }}>{selectedSchedule.room || "Chưa xếp phòng"}</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <UserOutlined style={{ color: "#722ed1", fontSize: "16px" }} />
                <div>
                  <div style={{ fontSize: "12px", color: "#8c8c8c" }}>Giảng viên</div>
                  <div style={{ fontWeight: 500, fontSize: "14px" }}>{selectedSchedule.teacher_name || "Chưa xếp giảng viên"}</div>
                </div>
              </div>

              {(selectedSchedule.start_date || selectedSchedule.end_date) && (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <CalendarOutlined style={{ color: "#fa8c16", fontSize: "16px" }} />
                  <div>
                    <div style={{ fontSize: "12px", color: "#8c8c8c" }}>Thời hạn lớp học</div>
                    <div style={{ fontWeight: 500, fontSize: "14px" }}>
                      {selectedSchedule.start_date ? dayjs(selectedSchedule.start_date).format("DD/MM/YYYY") : "N/A"} - {selectedSchedule.end_date ? dayjs(selectedSchedule.end_date).format("DD/MM/YYYY") : "N/A"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MySchedulePage;
