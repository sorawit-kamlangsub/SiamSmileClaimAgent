import React, { useMemo, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import VerifiedIcon from "@mui/icons-material/Verified";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Dayjs } from "dayjs";
import WaitingPeriod120DetailModal from "./WaitingPeriod120DetailModal";

type WaitingPeriodStatus = "WAITING_30" | "WAITING_120" | "PASSED_120";

type Props = {
    incidentDate?: Dayjs | null;
    coverageFrom?: Dayjs;
    coverageTo?: Dayjs;
};

const STATUS_STYLE: Record<WaitingPeriodStatus, { bg: string; border: string; color: string }> = {
    WAITING_30: { bg: "#fff8f0", border: "#f5d7a8", color: "#c1621a" },
    WAITING_120: { bg: "#fff8f0", border: "#f5d7a8", color: "#c1621a" },
    PASSED_120: { bg: "#eef8f0", border: "#bfe6c8", color: "#2e7d32" },
};

const STATUS_LABEL: Record<WaitingPeriodStatus, string> = {
    WAITING_30: "อยู่ในระยะรอคอย 30 วัน",
    WAITING_120: "อยู่ในระยะรอคอย 120 วัน",
    PASSED_120: "พ้นระยะรอคอย 120 วัน",
};

const WaitingPeriodStatusBanner: React.FC<Props> = ({ incidentDate, coverageFrom }) => {
    console.log("🚀 ~ WaitingPeriodStatusBanner ~ coverageFrom:", coverageFrom);
    const [detailOpen, setDetailOpen] = useState(false);

    // ต้องมีทั้งวันที่เกิดเหตุ (จาก formik) และวันที่เริ่มคุ้มครอง (จาก customerDetail) ถึงจะคำนวณระยะรอคอยได้
    const status: WaitingPeriodStatus | null = useMemo(() => {
        if (!incidentDate || !coverageFrom) return null;

        const daysCovered = incidentDate.diff(coverageFrom, "day");

        // เช็คเงื่อนไข 30 วันก่อนเสมอ ถ้าเข้าเงื่อนไขนี้แล้วไม่ต้องประมวลผล 120 วันซ้ำ
        if (daysCovered < 30) return "WAITING_30";
        if (daysCovered < 120) return "WAITING_120";
        return "PASSED_120";
    }, [incidentDate, coverageFrom]);

    if (!status) return null;

    const style = STATUS_STYLE[status];

    return (
        <>
            <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                    bgcolor: style.bg,
                    border: "1px solid",
                    borderColor: style.border,
                    borderRadius: 2,
                    px: 2,
                    py: 1.25,
                    mb: 2,
                }}
            >
                <Box display="flex" alignItems="center" gap={1}>
                    {status === "PASSED_120" ? (
                        <VerifiedIcon sx={{ color: style.color, fontSize: 20 }} />
                    ) : (
                        <WarningAmberIcon sx={{ color: style.color, fontSize: 20 }} />
                    )}
                    <Typography variant="body2" fontWeight={700} color={style.color}>
                        {STATUS_LABEL[status]}
                    </Typography>
                </Box>

                {status === "WAITING_120" && (
                    <Button
                        onClick={() => setDetailOpen(true)}
                        sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.7,
                            border: "none",
                            cursor: "pointer",
                            bgcolor: "#c1621a",
                            color: "#fff",
                            fontWeight: 600,
                            fontSize: 13,
                            px: 1.75,
                            py: 0.6,
                            borderRadius: 1,
                            "&:hover": { bgcolor: "#a4530f" },
                        }}
                    >
                        <VisibilityIcon sx={{ fontSize: 16 }} />
                        ดูรายละเอียดโรค
                    </Button>
                )}
            </Box>

            <WaitingPeriod120DetailModal open={detailOpen} onClose={() => setDetailOpen(false)} />
        </>
    );
};

export default WaitingPeriodStatusBanner;

