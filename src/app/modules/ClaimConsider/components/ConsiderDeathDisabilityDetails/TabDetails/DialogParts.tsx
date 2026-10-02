import type { ReactNode } from "react";
import { Box, DialogTitle, Grid, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

/** ส่วนประกอบหน้าตาที่ dialog ในหน้าพิจารณาเคลม Death & Disability ใช้ร่วมกัน (เปลี่ยนบัญชี / แก้ไขผู้รับผลประโยชน์) */

export const DIALOG_PRIMARY = "#0D5C9E";
export const DIALOG_BORDER = "#D6E6F5";

export const IconBadge = ({ children }: { children: ReactNode }) => (
    <Box
        sx={{
            width: { xs: 40, sm: 52 },
            height: { xs: 40, sm: 52 },
            borderRadius: 2.5,
            bgcolor: "#E3F0FB",
            color: DIALOG_PRIMARY,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
        }}
    >
        {children}
    </Box>
);

/** หัว dialog: ไอคอน + หัวข้อ + คำอธิบาย + ปุ่มปิดมุมขวา */
export const DialogHeader = ({
    icon,
    title,
    subtitle,
    onClose,
}: {
    icon: ReactNode;
    title: string;
    subtitle: string;
    onClose: () => void;
}) => (
    <DialogTitle sx={{ display: "flex", alignItems: "flex-start", gap: 2, pr: 7 }}>
        <IconBadge>{icon}</IconBadge>
        <Box>
            <Typography fontWeight={700}>{title}</Typography>
            <Typography variant="body2" color="text.secondary">
                {subtitle}
            </Typography>
        </Box>
        <IconButton
            aria-label="ปิด"
            onClick={onClose}
            sx={{ position: "absolute", right: 16, top: 16, border: `1px solid ${DIALOG_BORDER}` }}
        >
            <CloseIcon />
        </IconButton>
    </DialogTitle>
);

export type SummaryItem = { icon: ReactNode; label: string; value: ReactNode };

/** แถบสรุป 3 ช่องด้านบน dialog — จอเล็กเรียงลงเป็นแถว */
export const SummaryStrip = ({ items }: { items: SummaryItem[] }) => (
    <Grid
        container
        sx={{ border: `1px solid ${DIALOG_BORDER}`, borderRadius: 3, overflow: "hidden", bgcolor: "#FAFCFE" }}
    >
        {items.map((item, index) => (
            <Grid
                item
                xs={12}
                md={12 / items.length}
                key={item.label}
                sx={{
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    borderTop: { xs: index > 0 ? `1px solid ${DIALOG_BORDER}` : "none", md: "none" },
                    borderLeft: { md: index > 0 ? `1px solid ${DIALOG_BORDER}` : "none" },
                }}
            >
                <IconBadge>{item.icon}</IconBadge>
                <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" color="text.secondary">
                        {item.label}
                    </Typography>
                    <Box sx={{ color: DIALOG_PRIMARY, wordBreak: "break-word" }}>{item.value}</Box>
                </Box>
            </Grid>
        ))}
    </Grid>
);

/** แถว section: ไอคอนซ้าย + เนื้อหาขวา (จอเล็กซ่อนไอคอนเพื่อเหลือพื้นที่ให้ฟอร์ม) */
export const SectionRow = ({ icon, children }: { icon: ReactNode; children: ReactNode }) => (
    <Box sx={{ display: "flex", gap: 2, mt: 2.5 }}>
        <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <IconBadge>{icon}</IconBadge>
        </Box>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>{children}</Box>
    </Box>
);

/** sx ของ DialogActions: ปุ่มกลาง, จอเล็กเรียงแนวตั้งเต็มความกว้าง (ปุ่มหลักอยู่บน) */
export const dialogActionsSx = {
    justifyContent: "center",
    gap: 1.5,
    p: 2,
    flexDirection: { xs: "column-reverse", sm: "row" },
    "& > :not(:first-of-type)": { ml: { xs: 0, sm: 1.5 } },
} as const;

export const dialogActionButtonSx = { minWidth: 200, width: { xs: "100%", sm: "auto" }, minHeight: 44 } as const;
