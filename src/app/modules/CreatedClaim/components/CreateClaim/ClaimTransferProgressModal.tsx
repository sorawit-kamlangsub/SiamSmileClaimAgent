import React from "react";
import { Box, CircularProgress, Dialog, DialogContent, DialogTitle, Typography } from "@mui/material";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { ClaimTransferStep, ClaimTransferStepStatus } from "../../hooks/CreateClaim/useClaimTransferProcess";

interface Props {
    open: boolean;
    steps: ClaimTransferStep[];
}

const STATUS_CONFIG: Record<
    ClaimTransferStepStatus,
    { label: string; color: string; bg: string; borderColor: string }
> = {
    pending: { label: "รอดำเนินการ", color: "#64748B", bg: "#F1F5F9", borderColor: "#DBE5F0" },
    running: { label: "กำลังดำเนินการ", color: "#075F99", bg: "#DFF2FF", borderColor: "#7DD3FC" },
    success: { label: "สำเร็จ", color: "#15803D", bg: "#DCFCE7", borderColor: "#BBF7D0" },
    error: { label: "ไม่สำเร็จ", color: "#B91C1C", bg: "#FEE2E2", borderColor: "#FCA5A5" },
};

const StepStatusIcon: React.FC<{ status: ClaimTransferStepStatus }> = ({ status }) => {
    if (status === "running") return <CircularProgress size={18} thickness={5} />;
    if (status === "success") return <CheckCircleIcon fontSize="small" />;
    if (status === "error") return <ErrorIcon fontSize="small" />;
    return <ScheduleIcon fontSize="small" />;
};

/** Progress 3 ขั้น หลังกด "โอนเงิน" ใน ConfirmTransfer(PH|PA)Modal : สร้างเลขที่เคลม (CL) → สร้างเลขที่ Case (CC) → โอนเงิน */
const ClaimTransferProgressModal: React.FC<Props> = ({ open, steps }) => {
    return (
        <Dialog open={open} maxWidth="sm" fullWidth disableEscapeKeyDown>
            <DialogTitle>
                <Box display="flex" alignItems="center" gap={1.5}>
                    <CircularProgress size={22} thickness={5} />
                    <Typography fontWeight="bold" fontSize={18}>
                        กำลังดำเนินการ
                    </Typography>
                </Box>
            </DialogTitle>
            <DialogContent>
                <Box display="grid" gap={1.5} mt={0.5} mb={1}>
                    {steps.map((step) => {
                        const cfg = STATUS_CONFIG[step.status];
                        return (
                            <Box
                                key={step.key}
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: "40px 1fr auto",
                                    alignItems: "center",
                                    gap: 1.5,
                                    minHeight: 62,
                                    border: "1px solid",
                                    borderColor: cfg.borderColor,
                                    borderRadius: 2,
                                    bgcolor: step.status === "pending" ? "#fff" : cfg.bg,
                                    px: 1.75,
                                    py: 1,
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "grid",
                                        placeItems: "center",
                                        width: 36,
                                        height: 36,
                                        borderRadius: "50%",
                                        bgcolor: cfg.bg,
                                        color: cfg.color,
                                    }}
                                >
                                    <StepStatusIcon status={step.status} />
                                </Box>
                                <Box>
                                    <Typography fontWeight={700} fontSize={16}>
                                        {step.label}
                                    </Typography>
                                    {step.detail && (
                                        <Typography fontSize={12} color="text.secondary">
                                            {step.detail}
                                        </Typography>
                                    )}
                                </Box>
                                <Typography fontSize={12} fontWeight={700} color={cfg.color} whiteSpace="nowrap">
                                    {cfg.label}
                                </Typography>
                            </Box>
                        );
                    })}
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default ClaimTransferProgressModal;
