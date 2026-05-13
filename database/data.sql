-- create database with entity and attribute

CREATE DATABASE english_center_management;
USE english_center_management;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('admin', 'student') NOT NULL,
    status ENUM('active', 'blocked') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE student_profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    birthday DATE,
    gender ENUM('male', 'female', 'other'),
    address TEXT,
    avatar VARCHAR(255),

    FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE course_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(100) NOT NULL
);

CREATE TABLE courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL,
    course_name VARCHAR(150) NOT NULL,
    level VARCHAR(50),
    tuition_fee DECIMAL(10,2),
    duration VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (category_id) REFERENCES course_categories(id)
        ON DELETE CASCADE
);

CREATE TABLE teachers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    specialization VARCHAR(100)
);

CREATE TABLE classes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    teacher_id INT NOT NULL,
    class_name VARCHAR(100) NOT NULL,
    start_date DATE,
    end_date DATE,
    max_students INT DEFAULT 30,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (course_id) REFERENCES courses(id)
        ON DELETE CASCADE,

    FOREIGN KEY (teacher_id) REFERENCES teachers(id)
        ON DELETE CASCADE
);

CREATE TABLE class_schedules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    class_id INT NOT NULL,
    day_of_week ENUM(
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
    ) NOT NULL,

    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room VARCHAR(50),

    FOREIGN KEY (class_id) REFERENCES classes(id)
        ON DELETE CASCADE
);

CREATE TABLE enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    class_id INT NOT NULL,
    enroll_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    status ENUM(
        'pending',
        'approved',
        'rejected'
    ) DEFAULT 'pending',

    FOREIGN KEY (student_id) REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (class_id) REFERENCES classes(id)
        ON DELETE CASCADE
);

CREATE TABLE payment_methods (
    id INT PRIMARY KEY AUTO_INCREMENT,
    method_name VARCHAR(50) NOT NULL
);

CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    enrollment_id INT UNIQUE NOT NULL,
    payment_method_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,

    payment_status ENUM(
        'pending',
        'paid',
        'failed'
    ) DEFAULT 'pending',

    payment_date TIMESTAMP NULL,

    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id)
        ON DELETE CASCADE,

    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id)
        ON DELETE CASCADE
);

CREATE TABLE lessons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    class_id INT NOT NULL,
    lesson_title VARCHAR(255) NOT NULL,
    content TEXT,
    lesson_order INT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (class_id) REFERENCES classes(id)
        ON DELETE CASCADE
);

CREATE TABLE lesson_videos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lesson_id INT NOT NULL,
    video_url VARCHAR(255) NOT NULL,
    duration INT,

    FOREIGN KEY (lesson_id) REFERENCES lessons(id)
        ON DELETE CASCADE
);

CREATE TABLE lesson_materials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lesson_id INT NOT NULL,
    file_name VARCHAR(255),
    file_url VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),

    FOREIGN KEY (lesson_id) REFERENCES lessons(id)
        ON DELETE CASCADE
);

CREATE TABLE scores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    class_id INT NOT NULL,

    score DECIMAL(5,2),

    comment TEXT,

    FOREIGN KEY (student_id) REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (class_id) REFERENCES classes(id)
        ON DELETE CASCADE
);

CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,

    is_read BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);