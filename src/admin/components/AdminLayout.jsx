import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, IconButton, Container } from "@mui/material";
import { Dashboard as DashboardIcon, Palette, Logout, Menu } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

const DRAWER_WIDTH = 240;

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    localStorage.removeItem("adminLogin");
    navigate("/admin/login");
  }

  const menuItems = [
    { text: "แดชบอร์ด", icon: <DashboardIcon />, path: "/admin" },
    { text: "จัดการ Template", icon: <Palette />, path: "/admin/templates" },
  ];

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "#1e293b", color: "#f8fafc" }}>
      <Box p={3} textAlign="center" borderBottom="1px solid rgba(255,255,255,0.1)">
        <Typography variant="h6" fontWeight={700} color="#38bdf8">
          ระบบจัดการเกียรติบัตร
        </Typography>
        <Typography variant="caption" color="#94a3b8">
          Admin Panel
        </Typography>
      </Box>

      <List sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const selected = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  bgcolor: selected ? "rgba(56, 189, 248, 0.15)" : "transparent",
                  color: selected ? "#38bdf8" : "#94a3b8",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.05)", color: "#ffffff" },
                }}
              >
                <ListItemIcon sx={{ color: selected ? "#38bdf8" : "#94a3b8", minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: selected ? 700 : 500 }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box p={2} borderTop="1px solid rgba(255,255,255,0.1)">
        <ListItemButton
          onClick={handleLogout}
          sx={{ borderRadius: 2, color: "#f87171", "&:hover": { bgcolor: "rgba(239, 68, 68, 0.1)" } }}
        >
          <ListItemIcon sx={{ color: "#f87171", minWidth: 40 }}>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="ออกจากระบบ" primaryTypographyProps={{ fontWeight: 600 }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f1f5f9" }}>
      {/* Top Bar for Mobile */}
      <AppBar position="fixed" sx={{ width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` }, ml: { sm: `${DRAWER_WIDTH}px` }, bgcolor: "#0f172a" }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2, display: { sm: "none" } }}>
            <Menu />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            ระบบผู้ดูแล (Admin)
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box component="nav" sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: "block", sm: "none" }, "& .MuiDrawer-paper": { boxSizing: "border-box", width: DRAWER_WIDTH } }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{ display: { xs: "none", sm: "block" }, "& .MuiDrawer-paper": { boxSizing: "border-box", width: DRAWER_WIDTH } }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` }, mt: 8 }}>
        <Container maxWidth="xl">{children}</Container>
      </Box>
    </Box>
  );
}
