import { Box, Typography } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

type StatusPillProps = { status: boolean };

const StatusPill = ({ status }: StatusPillProps) => {
    return (
        <>
            <Box
                sx={{
                    borderRadius: "12px",
                    color: status ? "#388A53" : "#CF4542",
                    backgroundColor: status ? "#E6F4EA" : "#FCE8E6",
                    display: "flex",
                    justifyContent: "center",
                    p: 1,
                    width: "45%",
                }}
            >
                <Typography>
                    {status ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <CheckCircleOutlineIcon sx={{ fontSize: "1rem" }} />
                            <Typography sx={{ fontSize: "1rem" }}>เปิดใช้งาน</Typography>
                        </Box>
                    ) : (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <CancelOutlinedIcon sx={{ fontSize: "1rem" }} />
                            <Typography sx={{ fontSize: "1rem" }}>ปิดใช้งาน</Typography>
                        </Box>
                    )}
                </Typography>
            </Box>
        </>
    );
};

export default StatusPill;
