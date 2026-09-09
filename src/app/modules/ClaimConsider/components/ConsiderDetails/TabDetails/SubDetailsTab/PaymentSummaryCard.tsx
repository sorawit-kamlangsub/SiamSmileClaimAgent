import React from "react";
import { Box, Typography, Chip, Stack, Tooltip } from "@mui/material";

export interface PaymentSummaryCardProps {
    icon: React.ReactNode;
    iconBgColor?: string;
    iconColor?: string;
    title: string;
    subtitle?: string;
    amount: number | string;
    unit?: string;
    accentColor?: string;
    badge?: string;
    badgeColor?: string;
    /** ลิงก์ที่จะเปิดเมื่อคลิก badge (ถ้าไม่ใส่ badge จะไม่ clickable) */
    badgeHref?: string;
    /** เปิดลิงก์ในแท็บใหม่หรือไม่ (ค่าเริ่มต้น: true) */
    badgeOpenInNewTab?: boolean;
    /** ใช้แทน/เสริม badgeHref กรณีอยากควบคุม navigation เอง (เช่น react-router) */
    onBadgeClick?: () => void;
    /**
     * เงื่อนไขว่าจะให้ badge กดได้หรือไม่ (เช่น amount > 0)
     * ถ้าไม่ใส่ prop นี้ = กดได้เสมอ (ตราบใดที่มี badgeHref หรือ onBadgeClick)
     */
    badgeClickable?: boolean;
    /** ขนาด badge — "small" (ค่าเริ่มต้น เหมือนเดิม) หรือ "medium" (ใหญ่ขึ้น เผื่อ badge ที่ต้องเน้น) */
    badgeSize?: "small" | "medium";
}
export function PaymentSummaryCard({
    icon,
    iconBgColor = "#E8F0FE",
    iconColor = "#1967D2",
    title,
    subtitle,
    amount,
    unit = "บาท",
    accentColor = "#1967D2",
    badge,
    badgeColor = "#F5A623",
    badgeHref,
    badgeOpenInNewTab = true,
    onBadgeClick,
    badgeClickable = true,
    badgeSize = "small",
}: PaymentSummaryCardProps) {
    const formattedAmount =
        typeof amount === "number"
            ? amount.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : amount;

    return (
        <Box
            sx={{
                position: "relative",
                height: "100%",
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "#fff",
                p: { xs: 2, sm: 2.5 },
                overflow: "hidden",
                transition: "box-shadow 0.2s ease, transform 0.2s ease",
                "&:hover": {
                    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                    transform: "translateY(-2px)",
                },
                "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    backgroundColor: accentColor,
                },
            }}
        >
            <Stack
                direction="row"
                spacing={1.5}
                // ถ้าไม่มี subtitle ให้ title จัดกึ่งกลางกับไอคอน แทนที่จะชิดขอบบนแล้วดูจม
                alignItems={subtitle ? "flex-start" : "center"}
            >
                <Box
                    sx={{
                        flexShrink: 0,
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: iconBgColor,
                        color: iconColor,
                        "& svg": { fontSize: 20 },
                    }}
                >
                    {icon}
                </Box>

                <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                        variant="subtitle2"
                        sx={{
                            fontWeight: 700,
                            color: "text.primary",
                            lineHeight: 1.6,
                            // เผื่อพื้นที่ให้สระ/วรรณยุกต์ไทยด้านบน-ล่างไม่โดนตัด
                            py: "2px",
                        }}
                        noWrap
                    >
                        {title}
                    </Typography>
                    {subtitle && (
                        // Tooltip: subtitle ถูก clamp ไว้ 2 บรรทัดกันการ์ดสูงเกินเมื่อข้อความยาว (เช่น
                        // ชื่อสิทธิ์เบิกหลายรายการต่อกันด้วย ", ") — ต้อง hover เพื่อดูข้อความเต็มที่ถูกตัด
                        <Tooltip title={subtitle} arrow placement="bottom-start">
                            <Typography
                                variant="caption"
                                sx={{
                                    color: "text.secondary",
                                    lineHeight: 1.6,
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    cursor: "default",
                                }}
                            >
                                {subtitle}
                            </Typography>
                        </Tooltip>
                    )}
                </Box>
            </Stack>

            <Stack
                direction="row"
                alignItems="flex-end"
                justifyContent="space-between"
                flexWrap="wrap"
                sx={{ mt: 2.5, rowGap: 1 }}
            >
                <Typography
                    sx={{
                        fontWeight: 800,
                        fontSize: { xs: "1.5rem", sm: "1.75rem" },
                        color: accentColor,
                        lineHeight: 1,
                    }}
                >
                    {formattedAmount}
                    <Typography
                        component="span"
                        sx={{ fontSize: "0.85rem", fontWeight: 500, color: "text.secondary", ml: 0.75 }}
                    >
                        {unit}
                    </Typography>
                </Typography>

                {badge &&
                    (() => {
                        const isInteractive = badgeClickable && Boolean(badgeHref || onBadgeClick);
                        return (
                            <Chip
                                label={badge}
                                size={badgeSize}
                                clickable={isInteractive}
                                onClick={isInteractive ? onBadgeClick : undefined}
                                {...(isInteractive && badgeHref
                                    ? {
                                          component: "a",
                                          href: badgeHref,
                                          target: badgeOpenInNewTab ? "_blank" : undefined,
                                          rel: badgeOpenInNewTab ? "noopener noreferrer" : undefined,
                                      }
                                    : {})}
                                sx={{
                                    backgroundColor: `${badgeColor}1A`,
                                    color: badgeColor,
                                    border: `1px solid ${badgeColor}55`,
                                    fontWeight: 600,
                                    fontSize: badgeSize === "medium" ? "0.85rem" : "0.7rem",
                                    cursor: isInteractive ? "pointer" : "default",
                                    opacity: isInteractive ? 1 : 0.6,
                                    pointerEvents: isInteractive ? "auto" : "none",
                                    "&:hover": isInteractive ? { backgroundColor: `${badgeColor}33` } : undefined,
                                }}
                            />
                        );
                    })()}
            </Stack>
        </Box>
    );
}
