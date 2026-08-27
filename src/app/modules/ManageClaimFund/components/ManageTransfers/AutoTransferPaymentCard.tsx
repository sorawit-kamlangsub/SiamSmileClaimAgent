import { Box, Grid, Switch, Typography, styled } from "@mui/material";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

const BLUE = "#0D4C8C";

const StyledSwitch = styled(Switch)(() => ({
    width: 46,
    height: 26,
    padding: 0,
    "& .MuiSwitch-switchBase": {
        padding: 2,
        "&.Mui-checked": {
            transform: "translateX(20px)",
            color: "#FFFFFF",
            "& + .MuiSwitch-track": {
                backgroundColor: BLUE,
                opacity: 1,
            },
        },
    },
    "& .MuiSwitch-thumb": {
        width: 22,
        height: 22,
        boxShadow: "none",
    },
    "& .MuiSwitch-track": {
        borderRadius: 13,
        backgroundColor: "#BDBDBD",
        opacity: 1,
    },
}));

export type AutoTransferPaymentCardProps = {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    activeStatusText?: string;
    inactiveStatusText?: string;
};

const AutoTransferPaymentCard = ({
    enabled,
    onChange,
    activeStatusText = "ระบบโอนเงินอัตโนมัติกำลังทำงานอยู่",
    inactiveStatusText = "ระบบโอนเงินอัตโนมัติถูกปิดใช้งาน",
}: AutoTransferPaymentCardProps) => {
    return (
        <Box
            sx={{
                borderRadius: "12px",
                overflow: "hidden",
                border: "1px solid #E0E0E0",
                backgroundColor: "#FFFFFF",
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    background: `linear-gradient(90deg, ${BLUE} 0%, #145EA8 100%)`,
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                }}
            >
                <Box
                    sx={{
                        width: 44,
                        height: 44,
                        minWidth: 44,
                        borderRadius: "10px",
                        backgroundColor: "rgba(255, 255, 255, 0.18)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <AutorenewIcon sx={{ color: "#FFFFFF", fontSize: 24 }} />
                </Box>
                <Box>
                    <Typography sx={{ color: "#FFFFFF", fontWeight: 700, fontSize: "1.05rem" }}>
                        Auto Transfer Payment
                    </Typography>
                    <Typography sx={{ color: "rgba(255,255,255,0.85)", fontSize: "0.8rem" }}>
                        ระบบโอนเงินอัตโนมัติสำหรับเคลมประกัน
                    </Typography>
                </Box>
            </Box>

            {/* Body */}
            <Box sx={{ padding: "20px" }}>
                <Grid container alignItems="center" justifyContent="space-between">
                    <Grid item>
                        <Typography sx={{ fontWeight: 700, color: "#212121" }}>
                            เปิด/ปิด ระบบโอนเงินอัตโนมัติ
                        </Typography>
                        <Typography sx={{ fontSize: "0.85rem", color: "#78909C" }}>
                            กำหนดในระบบดำเนินการโอนเงินอัตโนมัติ
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <Typography
                                sx={{
                                    fontSize: "0.85rem",
                                    color: !enabled ? BLUE : "#B0BEC5",
                                    fontWeight: !enabled ? 700 : 400,
                                }}
                            >
                                ปิด
                            </Typography>
                            <StyledSwitch checked={enabled} onChange={(e) => onChange(e.target.checked)} />
                            <Typography
                                sx={{
                                    fontSize: "0.85rem",
                                    color: enabled ? BLUE : "#B0BEC5",
                                    fontWeight: enabled ? 700 : 400,
                                }}
                            >
                                เปิด
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                <Box
                    sx={{
                        marginTop: "16px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 16px",
                        borderRadius: "8px",
                        backgroundColor: enabled ? "#E8F5E9" : "#FBE9E7",
                    }}
                >
                    {enabled ? (
                        <CheckCircleIcon sx={{ color: "#2E7D32", fontSize: 20 }} />
                    ) : (
                        <CancelIcon sx={{ color: "#C62828", fontSize: 20 }} />
                    )}
                    <Typography
                        sx={{
                            fontSize: "0.85rem",
                            color: enabled ? "#2E7D32" : "#C62828",
                            fontWeight: 600,
                        }}
                    >
                        {enabled ? activeStatusText : inactiveStatusText}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default AutoTransferPaymentCard;
