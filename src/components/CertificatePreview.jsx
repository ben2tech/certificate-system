import { useState, useMemo } from "react";
import { Box, Typography } from "@mui/material";

/**
 * CertificatePreview — render เกียรติบัตรแบบ visual บนหน้าเว็บ
 *
 * เมื่อมีพื้นหลัง Template:
 *   1. ดึงตำแหน่งตัวแปรจาก Template ที่ Admin ออกแบบไว้ (ถ้ามี)
 *   2. หรือใช้ตำแหน่ง Calibrated Default ที่คำนวณให้พอดีกับช่องว่างในเกียรติบัตร
 */
export default function CertificatePreview({
  id = undefined,
  name = "",
  school = "",
  activity = "",
  year = "",
  certNo = "",
  background = "https://drive.google.com/thumbnail?id=1cg0Jh7mNZBHq_e8ytmWZRoJN6S7d7CiHJ-ROsxIgTGA&sz=w1600",
  templateJson = null,
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isTemplateMode = imgLoaded && !imgError;

  // ดึงตำแหน่งตัวแปรจาก Template ที่ส่งมาจาก API (Google Sheet) หรือ Designer (localStorage)
  const customVariables = useMemo(() => {
    try {
      // 1. ตรวจสอบข้อมูล json ที่ส่งมาจาก API Database (Google Sheet)
      if (templateJson) {
        const parsed = typeof templateJson === "string" ? JSON.parse(templateJson) : templateJson;
        if (parsed && Array.isArray(parsed.objects) && parsed.objects.length > 0) {
          const vars = parsed.objects.filter(
            (o) => o.text && (o.text.includes("{{") || !o.grid)
          );
          if (vars.length > 0) return vars;
        }
      }

      // 2. ตรวจสอบข้อมูลจาก localStorage ในเครื่อง
      const keys = [
        activity ? `template_${activity.trim()}` : null,
        activity && activity.includes("วิทย์") ? "template_กิจกรรมวิทย์" : null,
        activity && activity.includes("วิทย์") ? "template_สัปดาห์วิทยาศาสตร์" : null,
        "autosave-template",
      ].filter(Boolean);

      for (const k of keys) {
        const raw = localStorage.getItem(k);
        if (raw) {
          const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
          if (parsed && Array.isArray(parsed.objects) && parsed.objects.length > 0) {
            const vars = parsed.objects.filter(
              (o) => o.text && (o.text.includes("{{") || !o.grid)
            );
            if (vars.length > 0) return vars;
          }
        }
      }
    } catch (e) {
      console.log("Template config parse notice:", e);
    }
    return null;
  }, [activity, templateJson]);

  return (
    <Box
      id={id}
      sx={{
        width: "100%",
        maxWidth: 900,
        mx: "auto",
        position: "relative",
        aspectRatio: "1123 / 794",
        overflow: "hidden",
        borderRadius: 2,
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        fontFamily: "'Prompt', 'Sarabun', sans-serif",
      }}
    >
      {/* Background Image — รูปพื้นหลัง Template ของกิจกรรม */}
      {background && !imgError && (
        <Box
          component="img"
          src={background}
          crossOrigin="anonymous"
          alt="certificate background"
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
            display: imgLoaded ? "block" : "none",
          }}
        />
      )}

      {/* =========================================================================
          MODE 1: TEMPLATE MODE (เมื่อมีรูปพื้นหลัง Template)
          ========================================================================= */}
      {isTemplateMode ? (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            pointerEvents: "none",
          }}
        >
          {customVariables && customVariables.length > 0 ? (
            /* กรณีมี Layout ที่ Admin ออกแบบไว้ใน Designer */
            customVariables.map((obj, idx) => {
              let textContent = obj.text || "";
              textContent = textContent
                .replace(/\{\{NAME\}\}/g, name || "")
                .replace(/\{\{CERT_NO\}\}/g, certNo || "")
                .replace(/\{\{SCHOOL\}\}/g, school || "")
                .replace(/\{\{ACTIVITY\}\}/g, activity || "")
                .replace(/\{\{YEAR\}\}/g, String(year || ""));

              const leftPercent = ((obj.left || 0) / 1123) * 100;
              const topPercent = ((obj.top || 0) / 794) * 100;
              const baseFontSize = obj.fontSize || 34;

              return (
                <Typography
                  key={idx}
                  sx={{
                    position: "absolute",
                    left: `${leftPercent}%`,
                    top: `${topPercent}%`,
                    fontSize: `clamp(${Math.round(baseFontSize * 0.45)}px, ${(
                      baseFontSize / 11.23
                    ).toFixed(2)}vw, ${baseFontSize}px)`,
                    fontFamily: obj.fontFamily || "Prompt",
                    fontWeight: obj.fontWeight || 700,
                    color: typeof obj.fill === "string" ? obj.fill : "#0F172A",
                    textAlign: obj.textAlign || "left",
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                    textShadow: "0 1px 2px rgba(255,255,255,0.9)",
                  }}
                >
                  {textContent}
                </Typography>
              );
            })
          ) : (
            /* ตำแหน่ง Calibrated Default ที่คำนวณตำแหน่งอย่างแม่นยำ */
            <>
              {/* เลขที่เกียรติบัตร (มุมขวาบน ตรงกับแนว "เลขที่") */}
              {certNo && (
                <Typography
                  sx={{
                    position: "absolute",
                    top: "7.8%",
                    right: { xs: "5%", sm: "6.5%" },
                    transform: "translateY(-50%)",
                    fontSize: "clamp(8px, 1.25vw, 15px)",
                    fontWeight: 600,
                    color: "#1e293b",
                    fontFamily: "'Sarabun', 'Prompt', sans-serif",
                    letterSpacing: "0.5px",
                  }}
                >
                  {certNo}
                </Typography>
              )}

              {/* ชื่อผู้ได้รับเกียรติบัตร (ตรงกลาง ช่องว่างระหว่างคำว่า "ขอมอบ..." กับ "ได้เข้าร่วม...") */}
              <Box
                sx={{
                  position: "absolute",
                  top: "37.5%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "80%",
                  textAlign: "center",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "clamp(14px, 2.8vw, 32px)",
                    fontWeight: 700,
                    color: "#0D47A1",
                    fontFamily: "'Sarabun', 'Prompt', sans-serif",
                    lineHeight: 1.2,
                    letterSpacing: "0.2px",
                    textShadow: "0 1px 2px rgba(255,255,255,0.95)",
                  }}
                >
                  {name || "—"}
                </Typography>
              </Box>
            </>
          )}
        </Box>
      ) : (
        /* =========================================================================
           MODE 2: FALLBACK MODE (กรณีไม่มีรูปพื้นหลัง หรือโหลดรูปไม่ได้)
           แสดงกรอบตกแต่งสีทองและข้อความทั้งหมด
           ========================================================================= */
        <>
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              zIndex: 0,
              background:
                "linear-gradient(160deg, #fffbe6 0%, #fff8e1 30%, #ffffff 60%, #e3f2fd 100%)",
              "&::before": {
                content: '""',
                position: "absolute",
                inset: "3%",
                border: "3px solid #b8860b",
                borderRadius: "8px",
                pointerEvents: "none",
              },
              "&::after": {
                content: '""',
                position: "absolute",
                inset: "4%",
                border: "1px solid #daa520",
                borderRadius: "6px",
                pointerEvents: "none",
              },
            }}
          />

          {/* Corner decorations */}
          {["top-left", "top-right", "bottom-left", "bottom-right"].map((corner) => {
            const isTop = corner.includes("top");
            const isLeft = corner.includes("left");
            return (
              <Box
                key={corner}
                sx={{
                  position: "absolute",
                  zIndex: 1,
                  width: "10%",
                  height: "14%",
                  [isTop ? "top" : "bottom"]: "4.5%",
                  [isLeft ? "left" : "right"]: "4.5%",
                  borderTop: isTop ? "3px solid #b8860b" : "none",
                  borderBottom: !isTop ? "3px solid #b8860b" : "none",
                  borderLeft: isLeft ? "3px solid #b8860b" : "none",
                  borderRight: !isLeft ? "3px solid #b8860b" : "none",
                  [isTop && isLeft ? "borderTopLeftRadius" : ""]: "4px",
                  [isTop && !isLeft ? "borderTopRightRadius" : ""]: "4px",
                  [!isTop && isLeft ? "borderBottomLeftRadius" : ""]: "4px",
                  [!isTop && !isLeft ? "borderBottomRightRadius" : ""]: "4px",
                  pointerEvents: "none",
                }}
              />
            );
          })}

          <Box
            sx={{
              position: "absolute",
              inset: 0,
              zIndex: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              px: "10%",
              py: "6%",
            }}
          >
            <Box
              component="img"
              src="/logo.png"
              alt="logo"
              sx={{
                width: "9%",
                height: "auto",
                mb: "1.2%",
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))",
              }}
            />

            <Typography
              sx={{
                fontSize: "clamp(14px, 3.2vw, 36px)",
                fontWeight: 700,
                color: "#b8860b",
                letterSpacing: 2,
                lineHeight: 1.3,
                mb: "0.5%",
                textShadow: "0 1px 2px rgba(0,0,0,0.05)",
              }}
            >
              เกียรติบัตร
            </Typography>

            <Typography
              sx={{
                fontSize: "clamp(10px, 1.5vw, 17px)",
                color: "#444",
                mb: "1.5%",
                lineHeight: 1.4,
                fontWeight: 500,
              }}
            >
              ขอมอบเกียรติบัตรฉบับนี้ไว้เพื่อแสดงว่า
            </Typography>

            <Typography
              sx={{
                fontSize: "clamp(16px, 3.5vw, 40px)",
                fontWeight: 700,
                color: "#0d47a1",
                lineHeight: 1.3,
                mb: "0.8%",
                borderBottom: "2px solid #c9b037",
                pb: "0.5%",
                px: "4%",
                minWidth: "35%",
                textShadow: "0 1px 2px rgba(255,255,255,0.8)",
              }}
            >
              {name || "—"}
            </Typography>

            {school && (
              <Typography
                sx={{
                  fontSize: "clamp(10px, 1.5vw, 17px)",
                  color: "#555",
                  mt: "0.5%",
                  mb: "1.2%",
                  fontWeight: 500,
                }}
              >
                {school}
              </Typography>
            )}

            <Typography
              sx={{
                fontSize: "clamp(10px, 1.5vw, 17px)",
                color: "#444",
                mb: "0.4%",
                lineHeight: 1.5,
              }}
            >
              ได้เข้าร่วมกิจกรรม
            </Typography>

            <Typography
              sx={{
                fontSize: "clamp(12px, 2.2vw, 26px)",
                fontWeight: 700,
                color: "#1a237e",
                mb: "1.5%",
                lineHeight: 1.4,
                textShadow: "0 1px 2px rgba(255,255,255,0.8)",
              }}
            >
              {activity || "—"}
            </Typography>

            {year && (
              <Typography
                sx={{
                  fontSize: "clamp(9px, 1.3vw, 15px)",
                  color: "#666",
                  mb: "1%",
                }}
              >
                ปีการศึกษา {year}
              </Typography>
            )}

            {certNo && (
              <Typography
                sx={{
                  fontSize: "clamp(8px, 1.1vw, 13px)",
                  color: "#777",
                  fontFamily: "monospace",
                  position: "absolute",
                  bottom: "5%",
                  right: "6%",
                  fontWeight: 600,
                }}
              >
                เลขที่: {certNo}
              </Typography>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}
