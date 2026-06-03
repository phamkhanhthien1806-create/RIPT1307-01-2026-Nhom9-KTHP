import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (avatar, tài liệu PDF...)
app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

app.get("/", (req, res) => {
  res.send("Chào mừng đến với API Quản lý trung tâm tiếng Anh!");
});

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server đang chạy tại cổng ${port}`);
});

