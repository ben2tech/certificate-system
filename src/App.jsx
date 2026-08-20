import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery
} from "@mui/material";
import {
  Menu as MenuIcon,
  Home,
  AdminPanelSettings,
  Verified,
  Brush
} from "@mui/icons-material";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import HomePage from "./pages/Home";
import AdminPage from "./pages/Admin";
import VerifyPage from "./pages/Verify";
import TemplateDesigner from "./pages/TemplateDesigner";

const drawerWidth = 250;

const menus = [
  {
    text: "หน้าค้นหา",
    path: "/",
    icon: <Home />
  },
  {
    text: "Admin",
    path: "/admin",
    icon: <AdminPanelSettings />
  },
  {
    text: "ตรวจสอบ",
    path: "/verify",
    icon: <Verified />
  },
  {
    text: "ออกแบบ Template",
    path: "/designer",
    icon: <Brush />
  }
];

function Sidebar({ mobileOpen, setMobileOpen }) {

  const isMobile = useMediaQuery("(max-width:900px)");

  const drawer = (

    <Box
      sx={{
        height: "100%",
        background: "linear-gradient(180deg,#0F4C81,#1565C0)",
        color: "white"
      }}
    >

      <Box sx={{ p: 3 }}>

        <Typography variant="h6" fontWeight={700}>
          🏫 Certificate System
        </Typography>

        <Typography variant="body2" sx={{ opacity: .85 }}>
          โรงเรียนเบญจมราชรังสฤษฎิ์ ๒
        </Typography>

      </Box>

      <List>

        {menus.map(item => (

          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            onClick={() => isMobile && setMobileOpen(false)}
            sx={{
              color: "white",
              "&.active": {
                background: "rgba(255,255,255,.18)"
              }
            }}
          >

            <ListItemIcon sx={{ color: "white" }}>
              {item.icon}
            </ListItemIcon>

            <ListItemText primary={item.text} />

          </ListItemButton>

        ))}

      </List>

      <Box
        sx={{
          position: "absolute",
          bottom: 20,
          width: "100%",
          textAlign: "center",
          opacity: .7
        }}
      >

        <Typography variant="caption">
          Version 3.0
        </Typography>

      </Box>

    </Box>

  );

  return (

    <>

      {isMobile ? (

        <Drawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          variant="temporary"
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: drawerWidth
            }
          }}
        >
          {drawer}
        </Drawer>

      ) : (

        <Drawer
          open
          variant="permanent"
          sx={{
            width: drawerWidth,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              border: "none"
            }
          }}
        >
          {drawer}
        </Drawer>

      )}

    </>

  );

}

function Topbar({ setMobileOpen }) {

  const isMobile = useMediaQuery("(max-width:900px)");

  return (

    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: "rgba(255,255,255,.88)",
        backdropFilter: "blur(12px)",
        color: "#0F4C81",
        ml: isMobile ? 0 : `${drawerWidth}px`,
        width: isMobile ? "100%" : `calc(100% - ${drawerWidth}px)`
      }}
    >

      <Toolbar>

        {isMobile && (

          <IconButton
            onClick={() => setMobileOpen(true)}
            color="inherit"
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

        )}

        <Typography variant="h6" fontWeight={700}>
          ระบบจัดการเกียรติบัตร
        </Typography>

      </Toolbar>

    </AppBar>

  );

}

function AnimatedPage({ children }) {

  return (

    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: .25 }}
    >
      {children}
    </motion.div>

  );

}

export default function App() {

  const [mobileOpen, setMobileOpen] = useState(false);

  const isMobile = useMediaQuery("(max-width:900px)");

  const location = useLocation();

  return (

    <Box sx={{ display: "flex", minHeight: "100vh" }}>

      <Sidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <Topbar setMobileOpen={setMobileOpen} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: isMobile ? 0 : `${drawerWidth}px`,
          mt: "70px",
          p: 3,
          background: "#F5F7FA"
        }}
      >

        <AnimatePresence mode="wait">

          <Routes location={location} key={location.pathname}>

            <Route
              path="/"
              element={
                <AnimatedPage>
                  <HomePage />
                </AnimatedPage>
              }
            />

            <Route
              path="/admin"
              element={
                <AnimatedPage>
                  <AdminPage />
                </AnimatedPage>
              }
            />

            <Route
              path="/verify"
              element={
                <AnimatedPage>
                  <VerifyPage />
                </AnimatedPage>
              }
            />

            <Route
              path="/designer"
              element={
                <AnimatedPage>
                  <TemplateDesigner />
                </AnimatedPage>
              }
            />

          </Routes>

        </AnimatePresence>

      </Box>

    </Box>

  );

}