import { ReactNode } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

type LoadingOverlayProps = {
    isLoading: boolean;
    message?: string;
    children: ReactNode;
    /** ใช้เมื่อ children ระหว่างโหลดไม่มีความสูงของตัวเอง (เช่น ซ่อน empty state ไว้จนกว่าจะโหลดเสร็จ) */
    minHeight?: number;
    /**
     * ให้ spinner ติดอยู่กลางจอขณะเลื่อน — ใช้เมื่อ content สูงเกินจอ
     * (ค่าเริ่มต้นวางกลาง content ซึ่งอาจอยู่นอกจอจนผู้ใช้ไม่เห็น)
     */
    stickySpinner?: boolean;
};

/**
 * Overlay โหลดข้อมูล : จาง content เดิม + วาง spinner ทับตรงกลาง (ไม่เปลี่ยน layout เหมือนเอา content ออกไปทั้งก้อน)
 * ใช้ให้ทุก tab ของหน้าพิจารณาเคลม (เคลมลูกค้า/เคลมโรงพยาบาล) มี UX loading เหมือนกัน — ต้นแบบจาก
 * Step 1 ของ HospitalClaimDetailsTab (isStep1Loading)
 */
const LoadingOverlay = ({
    isLoading,
    message = "กำลังโหลดข้อมูล...",
    children,
    minHeight,
    stickySpinner = false,
}: LoadingOverlayProps) => (
    <Box sx={{ position: "relative", minHeight: isLoading ? minHeight : undefined }}>
        {isLoading && (
            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 20,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: stickySpinner ? "flex-start" : "center",
                    gap: 1.5,
                    bgcolor: "rgba(255, 255, 255, 0.65)",
                    borderRadius: 2,
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 1.5,
                        ...(stickySpinner && { position: "sticky", top: "40vh", mt: 10 }),
                    }}
                >
                    <CircularProgress />
                    <Typography variant="body2" color="text.secondary">
                        {message}
                    </Typography>
                </Box>
            </Box>
        )}
        <Box sx={isLoading ? { pointerEvents: "none", opacity: 0.5 } : undefined}>{children}</Box>
    </Box>
);

export default LoadingOverlay;
