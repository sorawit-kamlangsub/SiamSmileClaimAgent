import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button, Box, Divider } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { RetryTransferResult } from "../store/ExtraPayment.types";

interface RetryTransferSuccessModalProps {
    open: boolean;
    result: RetryTransferResult | null;
    onConfirm: () => void; // กดตกลง -> รายการหายจากตาราง
}

export const RetryTransferSuccessModal: React.FC<RetryTransferSuccessModalProps> = ({ open, result, onConfirm }) => {
    if (!result) return null;

    return (
        <Dialog open={open} onClose={onConfirm} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ textAlign: "center" }}>
                <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                    <CheckCircleIcon color="success" fontSize="large" />
                    บันทึกโอนเพิ่มอีกครั้งสำเร็จ
                </Box>
            </DialogTitle>
            <DialogContent>
                <Typography variant="subtitle2" fontWeight={700} mb={0.5}>
                    รายละเอียดบัญชี
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {result.bankAccount.bankName} · {result.bankAccount.bankAccountNo}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1.5}>
                    {result.bankAccount.bankAccountName}
                </Typography>

                <Divider sx={{ my: 1.5 }} />

                <Box display="flex" justifyContent="space-between" mb={1.5}>
                    <Typography variant="body2">จำนวนเงินโอนเพิ่มรวม</Typography>
                    <Typography variant="body2" fontWeight={700}>
                        {result.totalExtraTransferAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท
                    </Typography>
                </Box>

                <Typography variant="subtitle2" fontWeight={700} mb={0.5}>
                    รายการโอนเพิ่ม
                </Typography>
                {result.transferItems.map((t, index) => (
                    <Box key={index} display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                            {t.fullName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t.amount.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท
                        </Typography>
                    </Box>
                ))}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, justifyContent: "center" }}>
                <Button variant="contained" color="success" onClick={onConfirm} fullWidth>
                    ตกลง
                </Button>
            </DialogActions>
        </Dialog>
    );
};
