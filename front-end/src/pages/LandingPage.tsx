import React, { useEffect, useState } from "react";
import {
  Button,
  Row,
  Col,
  Carousel,
  Steps,
  Drawer,
  Avatar,
  Rate,
  Spin,
  message,
} from "antd";
import {
  UserOutlined,
  BookOutlined,
  LineChartOutlined,
  CustomerServiceOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
  MenuOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  FacebookOutlined,
  YoutubeOutlined,
  MessageOutlined,
  CalendarOutlined,
  LaptopOutlined,
  NotificationOutlined,
  TrophyOutlined,
  FormOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import api from "../utils/api";
import heroImg from "../assets/hero.png";
import "./LandingPage.css";

const { Step } = Steps;

interface Course {
  id: number;
  course_name: string;
  level: string;
  duration: string;
  tuition_fee: number | string;
  description: string;
  category_name: string;
}

const levelColors: Record<string, string> = {
  Beginner: "level-beginner",
  Intermediate: "level-intermediate",
  Advanced: "level-advanced",
};

const mockCourses: Course[] = [
  {
    id: 1,
    course_name: "TOEIC Cơ bản",
    level: "Beginner",
    duration: "2 tháng (32 buổi)",
    tuition_fee: 2500000,
    description: "Lấy lại nền tảng tiếng Anh, làm quen cấu trúc đề thi TOEIC, cam kết đầu ra 450+.",
    category_name: "Luyện thi TOEIC",
  },
  {
    id: 2,
    course_name: "TOEIC Nâng cao",
    level: "Intermediate",
    duration: "3 tháng (48 buổi)",
    tuition_fee: 3800000,
    description: "Rèn luyện kỹ thuật làm bài nâng cao, mở rộng từ vựng, mục tiêu đột phá 650+ - 800+.",
    category_name: "Luyện thi TOEIC",
  },
  {
    id: 3,
    course_name: "Giao tiếp tiếng Anh",
    level: "Intermediate",
    duration: "3 tháng (36 buổi)",
    tuition_fee: 3200000,
    description: "Phương pháp phản xạ nhanh độc quyền từ Tata English. Giúp bạn tự tin giao tiếp sau 3 tháng.",
    category_name: "Tiếng Anh Giao Tiếp",
  },
  {
    id: 4,
    course_name: "Ngữ pháp tiếng Anh",
    level: "Beginner",
    duration: "1.5 tháng (24 buổi)",
    tuition_fee: 1800000,
    description: "Hệ thống toàn bộ kiến thức ngữ pháp từ cơ bản đến nâng cao để thi cử và giao tiếp trôi chảy.",
    category_name: "Ngữ Pháp & Từ Vựng",
  },
  {
    id: 5,
    course_name: "Tiếng Anh cho người đi làm",
    level: "Advanced",
    duration: "3 tháng (36 buổi)",
    tuition_fee: 4200000,
    description: "Mẫu câu văn phòng, viết email, thuyết trình và đàm phán bằng tiếng Anh chuyên nghiệp.",
    category_name: "Tiếng Anh Giao Tiếp",
  },
  {
    id: 6,
    course_name: "IELTS Foundation",
    level: "Intermediate",
    duration: "4 tháng (64 buổi)",
    tuition_fee: 5500000,
    description: "Xây dựng tư duy 4 kỹ năng theo chuẩn học thuật IELTS, cam kết đạt band điểm 5.0 - 5.5.",
    category_name: "Luyện thi IELTS",
  },
];

const LandingPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeAnchor, setActiveAnchor] = useState("home");

  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  // Scroll handler for Header shadow & sticky behavior
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Check current active section
      const sections = ["home", "about", "courses", "benefits", "testimonials", "contact"];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveAnchor(section);
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch Courses from backend API
  useEffect(() => {
    const getCoursesData = async () => {
      try {
        const response = await api.get("/courses");
        if (response.data && response.data.length > 0) {
          setCourses(response.data);
        } else {
          setCourses(mockCourses);
        }
      } catch (err) {
        console.error("API error, using mock course data instead.", err);
        setCourses(mockCourses);
      } finally {
        setLoadingCourses(false);
      }
    };
    getCoursesData();
  }, []);

  const handleScrollTo = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveAnchor(id);
    }
  };

  const handleCourseEnroll = (courseId: number) => {
    if (!isAuthenticated) {
      message.info("Vui lòng đăng nhập để đăng ký khóa học.");
      navigate("/login");
    } else {
      if (user?.role === "quản trị viên") {
        navigate("/admin/courses");
      } else {
        navigate(`/student/courses/${courseId}`);
      }
    }
  };

  const handleDashboardRedirect = () => {
    if (user?.role === "quản trị viên") {
      navigate("/admin/dashboard");
    } else {
      navigate("/student/dashboard");
    }
  };

  return (
    <div className="landing-container">
      {/* 1. Header / Navigation Bar */}
      <header className={`landing-header ${isScrolled ? "scrolled" : ""}`}>
        <div className="header-content">
          <div className="logo-container" onClick={() => handleScrollTo("home")}>
            <div className="logo-icon">T</div>
            <span className="logo-text">Tata English</span>
          </div>

          <ul className="nav-menu">
            <li>
              <span
                className={`nav-link ${activeAnchor === "home" ? "active" : ""}`}
                onClick={() => handleScrollTo("home")}
              >
                Trang chủ
              </span>
            </li>
            <li>
              <span
                className={`nav-link ${activeAnchor === "about" ? "active" : ""}`}
                onClick={() => handleScrollTo("about")}
              >
                Giới thiệu
              </span>
            </li>
            <li>
              <span
                className={`nav-link ${activeAnchor === "courses" ? "active" : ""}`}
                onClick={() => handleScrollTo("courses")}
              >
                Khóa học
              </span>
            </li>
            <li>
              <span
                className={`nav-link ${activeAnchor === "benefits" ? "active" : ""}`}
                onClick={() => handleScrollTo("benefits")}
              >
                Lợi ích
              </span>
            </li>
            <li>
              <span
                className={`nav-link ${activeAnchor === "testimonials" ? "active" : ""}`}
                onClick={() => handleScrollTo("testimonials")}
              >
                Đánh giá
              </span>
            </li>
            <li>
              <span
                className={`nav-link ${activeAnchor === "contact" ? "active" : ""}`}
                onClick={() => handleScrollTo("contact")}
              >
                Liên hệ
              </span>
            </li>
          </ul>

          <div className="header-buttons">
            {isAuthenticated ? (
              <Button type="primary" shape="round" onClick={handleDashboardRedirect}>
                Vào Trang Học Tập
              </Button>
            ) : (
              <>
                <Button type="text" onClick={() => navigate("/login")} style={{ fontWeight: 600 }}>
                  Đăng nhập
                </Button>
                <Button type="primary" shape="round" onClick={() => navigate("/register")}>
                  Đăng ký
                </Button>
              </>
            )}
          </div>

          <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
            <MenuOutlined />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <Drawer
        title={
          <div className="logo-container">
            <div className="logo-icon">T</div>
            <span className="logo-text">Tata English</span>
          </div>
        }
        placement="right"
        onClose={() => setIsMobileMenuOpen(false)}
        visible={isMobileMenuOpen}
        bodyStyle={{ padding: 0 }}
      >
        <div className="drawer-menu-item" onClick={() => handleScrollTo("home")}>
          Trang chủ
        </div>
        <div className="drawer-menu-item" onClick={() => handleScrollTo("about")}>
          Giới thiệu
        </div>
        <div className="drawer-menu-item" onClick={() => handleScrollTo("courses")}>
          Khóa học
        </div>
        <div className="drawer-menu-item" onClick={() => handleScrollTo("benefits")}>
          Lợi ích
        </div>
        <div className="drawer-menu-item" onClick={() => handleScrollTo("testimonials")}>
          Đánh giá
        </div>
        <div className="drawer-menu-item" onClick={() => handleScrollTo("contact")}>
          Liên hệ
        </div>
        <div className="drawer-buttons">
          {isAuthenticated ? (
            <Button type="primary" block onClick={handleDashboardRedirect}>
              Vào Trang Học Tập
            </Button>
          ) : (
            <>
              <Button type="default" block onClick={() => navigate("/login")}>
                Đăng nhập
              </Button>
              <Button type="primary" block onClick={() => navigate("/register")}>
                Đăng ký
              </Button>
            </>
          )}
        </div>
      </Drawer>

      {/* 2. Hero Section */}
      <section id="home" className="hero-section">
        <div className="container">
          <div className="hero-grid animate-fade-in-up">
            <div>
              <div className="section-tag" style={{ background: "rgba(24, 144, 255, 0.08)" }}>
                Chào mừng đến với Tata English
              </div>
              <h1 className="hero-title">
                Học tiếng Anh hiệu quả cùng <span style={{ color: "var(--primary-blue)" }}>Tata English</span>
              </h1>
              <p className="hero-subtitle">
                Nền tảng học tiếng Anh hiện đại giúp học viên dễ dàng lựa chọn khóa học, theo dõi lịch
                học, điểm số và quá trình học tập toàn diện.
              </p>
              <div className="hero-ctas">
                <Button
                  type="primary"
                  size="large"
                  shape="round"
                  icon={<ArrowRightOutlined />}
                  onClick={() => handleScrollTo("courses")}
                  style={{ height: "48px", padding: "0 28px", fontWeight: 600 }}
                >
                  Khám phá khóa học
                </Button>
              </div>
              <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
                <Col span={12}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <CheckCircleOutlined style={{ color: "#52c41a", fontSize: "16px" }} />
                    <span style={{ fontWeight: 550, color: "#434343" }}>Lộ trình chuẩn hóa</span>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <CheckCircleOutlined style={{ color: "#52c41a", fontSize: "16px" }} />
                    <span style={{ fontWeight: 550, color: "#434343" }}>Giảng viên bản ngữ & VN</span>
                  </div>
                </Col>
              </Row>
            </div>
            <div className="hero-image-wrapper">
              <div className="hero-image-bg" />
              <img src={heroImg} alt="Tata English Student" className="hero-image animate-float" />
              <div className="hero-badge-card hero-badge-1">
                <Avatar style={{ backgroundColor: "#87d068" }} icon={<UserOutlined />} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--dark-blue)" }}>
                    1000+ Học Viên
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    Đã & đang học tập
                  </div>
                </div>
              </div>
              <div className="hero-badge-card hero-badge-2">
                <div
                  style={{
                    backgroundColor: "#feffe6",
                    color: "#d4b106",
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ⭐
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--dark-blue)" }}>
                    Đạt Chuẩn 95%
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    Phản hồi hài lòng
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Giới thiệu về Tata English */}
      <section id="about" className="section-padding section-bg-light">
        <div className="container">
          <div className="section-title-wrapper">
            <span className="section-tag">Về Tata English</span>
            <h2 className="section-title">Nâng Tầm Tiếng Anh Của Bạn</h2>
            <p className="section-desc">
              Tata English là trung tâm đào tạo tiếng Anh dành cho học sinh, sinh viên và người đi làm,
              tập trung vào chất lượng giảng dạy, lộ trình học rõ ràng và trải nghiệm học tập hiện đại.
            </p>
          </div>

          <div className="about-grid">
            <div className="about-card">
              <div className="about-icon-wrapper" style={{ backgroundColor: "#e6f7ff", color: "#1890ff" }}>
                <UserOutlined />
              </div>
              <h3 className="about-card-title">Giảng viên chất lượng</h3>
              <p className="about-card-desc">
                Đội ngũ giáo viên giàu kinh nghiệm, có chứng chỉ giảng dạy quốc tế (TESOL, CELTA) và
                luôn tận tâm đồng hành.
              </p>
            </div>

            <div className="about-card">
              <div className="about-icon-wrapper" style={{ backgroundColor: "#f6ffed", color: "#52c41a" }}>
                <BookOutlined />
              </div>
              <h3 className="about-card-title">Lộ trình học rõ ràng</h3>
              <p className="about-card-desc">
                Thiết kế lộ trình học cá nhân hóa phù hợp với trình độ xuất phát và mục tiêu đầu ra của
                từng học viên.
              </p>
            </div>

            <div className="about-card">
              <div className="about-icon-wrapper" style={{ backgroundColor: "#fff7e6", color: "#fa8c16" }}>
                <LineChartOutlined />
              </div>
              <h3 className="about-card-title">Theo dõi kết quả học tập</h3>
              <p className="about-card-desc">
                Hệ thống trực tuyến giúp cập nhật điểm số, nhận xét chi tiết sau mỗi bài kiểm tra để
                điều chỉnh việc học.
              </p>
            </div>

            <div className="about-card">
              <div className="about-icon-wrapper" style={{ backgroundColor: "#fff1f0", color: "#f5222d" }}>
                <CustomerServiceOutlined />
              </div>
              <h3 className="about-card-title">Hỗ trợ học viên tận tình</h3>
              <p className="about-card-desc">
                Đội ngũ trợ giảng chuyên nghiệp và chuyên viên tư vấn hỗ trợ giải đáp thắc mắc 24/7
                trong suốt khóa học.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Danh sách khóa học */}
      <section id="courses" className="section-padding">
        <div className="container">
          <div className="section-title-wrapper">
            <span className="section-tag">Khóa Học</span>
            <h2 className="section-title">Các Khóa Học Nổi Bật</h2>
            <p className="section-desc">
              Khám phá các khóa học được thiết kế chuyên sâu giúp bạn nâng cao toàn diện kỹ năng nghe,
              nói, đọc, viết và tự tin chinh phục các kỳ thi.
            </p>
          </div>

          {loadingCourses ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <Spin size="large" tip="Đang tải danh sách khóa học..." />
            </div>
          ) : (
            <div className="course-grid">
              {courses.map((course) => (
                <div className="course-card" key={course.id}>
                  <div className="course-card-header">
                    <span className="course-tag">{course.category_name}</span>
                    <h3 className="course-name">{course.course_name}</h3>
                    <div className="course-card-bg-decoration">ENG</div>
                  </div>
                  <div className="course-card-body">
                    <div>
                      <span className={`course-level-tag ${levelColors[course.level] || "level-intermediate"}`}>
                        Trình độ: {course.level}
                      </span>
                    </div>
                    <p className="course-desc">{course.description}</p>
                    <div className="course-meta">
                      <div className="course-duration">
                        <ClockCircleOutlined /> {course.duration}
                      </div>
                      <div className="course-fee">
                        {typeof course.tuition_fee === "number"
                          ? course.tuition_fee.toLocaleString("vi-VN")
                          : Number(course.tuition_fee).toLocaleString("vi-VN")}
                        đ
                      </div>
                    </div>
                    <Button
                      type="primary"
                      block
                      shape="round"
                      onClick={() => handleCourseEnroll(course.id)}
                      style={{ fontWeight: 600, height: "40px" }}
                    >
                      Đăng ký khóa học
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. Lợi ích khi học tại Tata English */}
      <section id="benefits" className="section-padding section-bg-light">
        <div className="container">
          <div className="section-title-wrapper">
            <span className="section-tag">Lợi ích độc quyền</span>
            <h2 className="section-title">Tại Sao Chọn Tata English?</h2>
            <p className="section-desc">
              Chúng tôi không chỉ dạy học, chúng tôi đồng hành cùng sự tiến bộ của bạn thông qua nền tảng
              quản lý học tập hiện đại.
            </p>
          </div>

          <div className="benefits-grid">
            <div className="benefit-item">
              <div className="benefit-icon-wrapper">
                <CalendarOutlined />
              </div>
              <div>
                <h3 className="benefit-title">Lịch học linh hoạt</h3>
                <p className="benefit-desc">
                  Nhiều ca học khác nhau phù hợp cho cả học sinh đi học và người đi làm bận rộn.
                </p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-icon-wrapper">
                <LaptopOutlined />
              </div>
              <div>
                <h3 className="benefit-title">Quản lý khóa học trực tuyến</h3>
                <p className="benefit-desc">
                  Truy cập tài liệu học tập, xem bài giảng, kiểm tra lịch học nhanh chóng mọi lúc mọi nơi.
                </p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-icon-wrapper">
                <NotificationOutlined />
              </div>
              <div>
                <h3 className="benefit-title">Nhận thông báo lịch học</h3>
                <p className="benefit-desc">
                  Hệ thống tự động nhắc nhở lịch học, bài tập về nhà và thông tin quan trọng qua email & app.
                </p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-icon-wrapper">
                <TrophyOutlined />
              </div>
              <div>
                <h3 className="benefit-title">Theo dõi điểm số dễ dàng</h3>
                <p className="benefit-desc">
                  Xem bảng điểm chi tiết, đánh giá của giáo viên giúp bạn nhận ra điểm yếu cần cải thiện.
                </p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-icon-wrapper">
                <FormOutlined />
              </div>
              <div>
                <h3 className="benefit-title">Đăng ký khóa học nhanh chóng</h3>
                <p className="benefit-desc">
                  Hệ thống đăng ký trực tuyến siêu tốc, thanh toán hóa đơn dễ dàng chỉ với vài click.
                </p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-icon-wrapper">
                <CustomerServiceOutlined />
              </div>
              <div>
                <h3 className="benefit-title">Hỗ trợ học viên suốt quá trình</h3>
                <p className="benefit-desc">
                  Đội ngũ cố vấn học tập theo sát hỗ trợ học viên giải quyết bài tập và động viên tinh thần.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Quy trình đăng ký học */}
      <section className="section-padding">
        <div className="container">
          <div className="section-title-wrapper">
            <span className="section-tag">Quy trình</span>
            <h2 className="section-title">5 Bước Bắt Đầu Hành Trình</h2>
            <p className="section-desc">
              Sẵn sàng cùng Tata English chinh phục mục tiêu tiếng Anh với quy trình đăng ký đơn giản và
              nhanh chóng.
            </p>
          </div>

          <div className="steps-container">
            <Steps direction="vertical" current={4} className="custom-steps">
              <Step
                title="Tạo tài khoản"
                description="Đăng ký tài khoản học viên nhanh chóng bằng Email cá nhân."
              />
              <Step
                title="Chọn khóa học phù hợp"
                description="Khảo sát danh sách khóa học phong phú và lựa chọn lớp học ưng ý."
              />
              <Step
                title="Gửi yêu cầu đăng ký"
                description="Nhấn đăng ký khóa học, thông tin của bạn sẽ được chuyển đến bộ phận tư vấn."
              />
              <Step
                title="Chờ quản trị viên duyệt"
                description="Nhân viên Tata English liên hệ tư vấn lộ trình và xác nhận thông tin thanh toán."
              />
              <Step
                title="Bắt đầu học và theo dõi kết quả"
                description="Tham gia lớp học và kiểm tra kết quả, lịch học của bạn trên hệ thống dashboard trực tuyến."
              />
            </Steps>
          </div>
        </div>
      </section>

      {/* 7. Đánh giá của học viên */}
      <section id="testimonials" className="section-padding section-bg-light">
        <div className="container">
          <div className="section-title-wrapper">
            <span className="section-tag">Cảm nhận học viên</span>
            <h2 className="section-title">Học Viên Nói Gì Về Chúng Tôi?</h2>
            <p className="section-desc">
              Hàng ngàn học viên đã tìm thấy niềm đam mê học tiếng Anh và đạt được mục tiêu học tập vượt mong đợi.
            </p>
          </div>

          <div className="feedback-carousel-wrapper">
            <Carousel autoplay effect="fade" speed={800}>
              <div>
                <div className="feedback-card">
                  <p className="feedback-quote">
                    "Em đã cải thiện điểm số TOEIC từ 400 lên 780 chỉ sau khóa học 3 tháng tại Tata.
                    Hệ thống xem lịch học và điểm số online cực kỳ tiện lợi, giáo viên siêu nhiệt tình
                    giải đáp bài tập."
                  </p>
                  <div className="feedback-rating">
                    <Rate disabled defaultValue={5} />
                  </div>
                  <div className="feedback-user-info">
                    <Avatar size={64} className="feedback-avatar" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop" />
                    <h4 className="feedback-name">Nguyễn Khánh Linh</h4>
                    <span className="feedback-role">Sinh viên Đại học Ngoại Thương (TOEIC 780)</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="feedback-card">
                  <p className="feedback-quote">
                    "Là người đi làm bận rộn, tôi rất thích việc Tata English cung cấp lịch học linh
                    hoạt. Giao diện quản lý khóa học giúp tôi không bao giờ quên lịch học hay bài tập."
                  </p>
                  <div className="feedback-rating">
                    <Rate disabled defaultValue={5} />
                  </div>
                  <div className="feedback-user-info">
                    <Avatar size={64} className="feedback-avatar" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop" />
                    <h4 className="feedback-name">Trần Minh Quân</h4>
                    <span className="feedback-role">Kỹ sư Phần mềm tại FPT Software (Giao tiếp nâng cao)</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="feedback-card">
                  <p className="feedback-quote">
                    "Giáo viên của trung tâm rất thân thiện, các phương pháp phản xạ nhanh độc quyền đã
                    giúp em tự tin nói tiếng Anh trước đám đông. Em rất biết ơn các thầy cô tại Tata."
                  </p>
                  <div className="feedback-rating">
                    <Rate disabled defaultValue={5} />
                  </div>
                  <div className="feedback-user-info">
                    <Avatar size={64} className="feedback-avatar" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop" />
                    <h4 className="feedback-name">Phạm Quỳnh Anh</h4>
                    <span className="feedback-role">Học sinh THPT Chu Văn An (IELTS 7.0)</span>
                  </div>
                </div>
              </div>
            </Carousel>
          </div>
        </div>
      </section>

      {/* 8. Thống kê nổi bật */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">1000+</div>
              <div className="stat-label">Học viên tin chọn</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">20+</div>
              <div className="stat-label">Khóa học phong phú</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">95%</div>
              <div className="stat-label">Học viên hài lòng</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">5+</div>
              <div className="stat-label">Năm kinh nghiệm đào tạo</div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. CTA Section cuối trang */}
      <section className="section-padding section-bg-gradient">
        <div className="container">
          <div className="cta-panel">
            <h2 className="cta-title">Sẵn sàng bắt đầu hành trình học tiếng Anh?</h2>
            <p className="cta-desc">
              Đăng ký tài khoản ngay hôm nay để khám phá các khóa học phù hợp với trình độ của bạn
              và bắt đầu bứt phá điểm số cùng Tata English.
            </p>
            <div className="cta-buttons">
              {isAuthenticated ? (
                <Button
                  type="default"
                  size="large"
                  shape="round"
                  onClick={handleDashboardRedirect}
                  style={{ minWidth: "160px", height: "48px", fontWeight: 600, color: "var(--primary-blue)" }}
                >
                  Vào Trang Học Tập
                </Button>
              ) : (
                <>
                  <Button
                    type="default"
                    size="large"
                    shape="round"
                    onClick={() => navigate("/register")}
                    style={{ minWidth: "160px", height: "48px", fontWeight: 600, color: "var(--primary-blue)" }}
                  >
                    Đăng ký ngay
                  </Button>
                  <Button
                    ghost
                    size="large"
                    shape="round"
                    onClick={() => navigate("/login")}
                    style={{ minWidth: "160px", height: "48px", fontWeight: 600, border: "2px solid white" }}
                  >
                    Đăng nhập
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 10. Footer */}
      <footer id="contact" className="landing-footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="logo-container" style={{ marginBottom: "16px" }}>
                <div className="logo-icon">T</div>
                <span className="logo-text" style={{ background: "none", color: "white", WebkitTextFillColor: "unset" }}>
                  Tata English
                </span>
              </div>
              <p className="footer-desc">
                Tata English là trung tâm tiếng Anh chuyên sâu giảng dạy IELTS, TOEIC, giao tiếp cho học
                sinh, sinh viên và người đi làm. Cam kết đồng hành cùng sự thành công của bạn.
              </p>
              <div className="footer-socials">
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-icon-btn">
                  <FacebookOutlined />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="social-icon-btn">
                  <YoutubeOutlined />
                </a>
                <a href="https://zalo.me" target="_blank" rel="noreferrer" className="social-icon-btn">
                  <MessageOutlined />
                </a>
              </div>
            </div>

            <div>
              <h3 className="footer-col-title">Liên kết nhanh</h3>
              <ul className="footer-links-list">
                <li>
                  <span className="footer-link" onClick={() => handleScrollTo("home")}>
                    Trang chủ
                  </span>
                </li>
                <li>
                  <span className="footer-link" onClick={() => handleScrollTo("about")}>
                    Giới thiệu
                  </span>
                </li>
                <li>
                  <span className="footer-link" onClick={() => handleScrollTo("courses")}>
                    Khóa học
                  </span>
                </li>
                <li>
                  <span className="footer-link" onClick={() => handleScrollTo("benefits")}>
                    Lợi ích
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="footer-col-title">Hỗ trợ</h3>
              <ul className="footer-links-list">
                <li>
                  <span className="footer-link" onClick={() => navigate("/login")}>
                    Đăng nhập
                  </span>
                </li>
                <li>
                  <span className="footer-link" onClick={() => navigate("/register")}>
                    Đăng ký tài khoản
                  </span>
                </li>
                <li>
                  <span className="footer-link" onClick={() => handleScrollTo("contact")}>
                    Liên hệ tư vấn
                  </span>
                </li>
                <li>
                  <span className="footer-link" onClick={() => handleScrollTo("about")}>
                    Chính sách học viên
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="footer-col-title">Thông tin liên hệ</h3>
              <div className="contact-item">
                <EnvironmentOutlined className="contact-icon" />
                <span>Số 123 Đường Cầu Giấy, Quận Cầu Giấy, Hà Nội</span>
              </div>
              <div className="contact-item">
                <MailOutlined className="contact-icon" />
                <span>info@tataenglish.edu.vn</span>
              </div>
              <div className="contact-item">
                <PhoneOutlined className="contact-icon" />
                <span>024.1234.5678 (Hotline)</span>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2026 Tata English. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
