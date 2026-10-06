import { Box, Typography } from "@mui/material";
import ScheduleSendIcon from "@mui/icons-material/ScheduleSend";

type CardHeaderSummaryDetailProps = {
    title?: string;
    subtitle?: string;
    autoEnabledCount: number;
    holdingCount: number;
};

const StatColumn = ({
    value,
    label,
    color,
    showDivider = true,
}: {
    value: number;
    label: string;
    color: string;
    showDivider?: boolean;
}) => (
    <Box
        sx={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            paddingLeft: "24px",
            borderLeft: showDivider ? "1px solid #E0E0E0" : "none",
        }}
    >
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: "1.4rem", color }}>{value}</Typography>
            <Typography sx={{ fontSize: "0.8rem", color: "#607D8B", whiteSpace: "nowrap" }}>{label}</Typography>
        </Box>
    </Box>
);

const CardHeaderSummaryDetail = ({
    title,
    subtitle,
    autoEnabledCount = 0,
    holdingCount = 0,
}: CardHeaderSummaryDetailProps) => {
    return (
        <Box
            sx={{
                border: "1px solid #E0E0E0",
                borderRadius: "12px",
                backgroundColor: "#FFFFFF",
                padding: "16px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: 3,
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <Box
                    sx={{
                        width: 44,
                        height: 44,
                        minWidth: 44,
                        borderRadius: "10px",
                        backgroundColor: "#E3F2FD",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <ScheduleSendIcon sx={{ color: "#1565C0", fontSize: 22 }} />
                </Box>
                <Box>
                    <Typography sx={{ fontWeight: 700, color: "#212121", fontSize: "0.95rem" }}>{title}</Typography>
                    <Typography sx={{ fontSize: "0.8rem", color: "#1565C0" }}>{subtitle}</Typography>
                </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <StatColumn value={autoEnabledCount} label="เปิดจ่ายอัตโนมัติ" color="#1565C0" />
                <StatColumn value={holdingCount} label="ถูก Hold" color="#C62828" />
            </Box>
        </Box>
    );
};

export default CardHeaderSummaryDetail;
