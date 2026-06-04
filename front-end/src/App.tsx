import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/admin/Dashboard";
import StudentDashboard from "./pages/student/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/MainLayout";

function App() {
  return (
    <Router>
      <Routes>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />


        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={["quản trị viên"]}>
              <MainLayout>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />

                  <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/student/*"
          element={
            <ProtectedRoute allowedRoles={["học viên"]}>
              <MainLayout>
                <Routes>
                  <Route path="dashboard" element={<StudentDashboard />} />

                  <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          }
        />


        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
