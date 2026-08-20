import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Student
import Search from "./student/pages/Search";
import Verify from "./student/pages/Verify";

// Admin
import Dashboard from "./admin/pages/Dashboard";
import Login from "./admin/pages/login.jsx";
import TemplateDesigner from "./admin/pages/TemplateDesigner";
import TemplateManager from "./admin/pages/TemplateManager";

function PrivateRoute({ children }) {
  const ok = localStorage.getItem("adminLogin") === "true";
  return ok ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* นักเรียน */}
        <Route path="/" element={<Search />} />
        <Route path="/verify" element={<Verify />} />

        {/* Admin */}
        <Route path="/admin/login" element={<Login />} />

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
      </Routes>
    </BrowserRouter>
  );
}