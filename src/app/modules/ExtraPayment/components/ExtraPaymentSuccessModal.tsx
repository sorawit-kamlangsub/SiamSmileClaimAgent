import React from "react";
import { Dialog, DialogContent, DialogActions, Box, Typography, Button, IconButton, Tooltip } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

interface ExtraPaymentSuccessModalProps {
    open: boolean;
    claimNos: string[];
    onConfirm: () => void;
}

export const ExtraPaymentSuccessModal: React.FC<ExtraPaymentSuccessModalProps> = ({
    open,
    claimNos,
    onConfirm,
}) => {
    const handleCopy = (claimNo: string) => {
        navigator.clipboard.writeText(claimNo);
    };

    return (
        <Dialog open={open} onClose={onConfirm} maxWidth="xs" fullWidth>
            <DialogContent>
                <Box display="flex" flexDirection="column" alignItems="center" gap={1} mb={2}>
                    <Box
                        sx={{
                            width: 64,
                            height: 64,
                            borderRadius: "50%",
                            bgcolor: "success.50",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
                    </Box>
                    <Typography variant="subtitle1" fontWeight={700} color="primary">
                        บันทึกโอนเพิ่มสำเร็จ
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        ทั้งหมด {claimNos.length} รายการ
                    </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" px={1} mb={1}>
                    <Typography variant="body2" fontWeight={700}>
                        เลขที่ CL
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>
                        คัดลอกทั้งหมด
                    </Typography>
                </Box>
                <Box
                    sx={{
                        bgcolor: "warning.50",
                        borderRadius: 1,
                    }}
                >
                    {claimNos.map((claimNo, index) => (
                        <Box
                            key={claimNo}
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            px={2}
                            py={1}
                            borderBottom={index < claimNos.length - 1 ? "1px solid" : "none"}
                            borderColor="divider"
                        >
                            <Typography variant="body2">{claimNo}</Typography>
                            <Tooltip title="คัดลอก">
                                <IconButton size="small" onClick={() => handleCopy(claimNo)}>
                                    <ContentCopyIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    ))}
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button fullWidth variant="contained" onClick={onConfirm}>
                    ตกลง
                </Button>
            </DialogActions>
        </Dialog>
    );
};
