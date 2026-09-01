import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

// Student
import Search from "./pages/Search";

// Admin
import Login from "./admin/pages/Login";
import Dashboard from "./admin/pages/Dashboard";
import TemplateManager from "./admin/pages/TemplateManager";
import TemplateDesigner from "./admin/pages/TemplateDesigner";

function PrivateRoute({ children }) {
  const isAuth = localStorage.getItem("adminLogin") === "true";
  return isAuth ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        {/* หน้าค้นหาของนักเรียน */}
        <Route path="/" element={<Search />} />

        {/* หน้าเข้าสู่ระบบ Admin */}
        <Route path="/admin/login" element={<Login />} />

        {/* หน้าผู้ดูแลระบบ (Protected) */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/templates"
          element={
            <PrivateRoute>
              <TemplateManager />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/designer"
          element={
            <PrivateRoute>
              <TemplateDesigner />
            </PrivateRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
