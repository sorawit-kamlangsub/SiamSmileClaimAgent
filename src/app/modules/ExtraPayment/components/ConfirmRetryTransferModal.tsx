import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button, Box } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

interface ConfirmRetryTransferModalProps {
    open: boolean;
    onCancel: () => void; // กดยกเลิก -> กลับไปที่ Modal แก้ไขบัญชีรับสินไหม
    onConfirm: () => void; // กดยืนยัน -> แสดง Modal บันทึกโอนเพิ่มอีกครั้งสำเร็จ
    isSubmitting?: boolean;
}

export const ConfirmRetryTransferModal: React.FC<ConfirmRetryTransferModalProps> = ({
    open,
    onCancel,
    onConfirm,
    isSubmitting = false,
}) => (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: "center" }}>
            <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                <RefreshIcon color="primary" fontSize="large" />
                ยืนยันการโอนเพิ่มอีกครั้ง?
            </Box>
        </DialogTitle>
        <DialogContent>
            <Typography variant="body2" color="text.secondary" textAlign="center">
                ระบบจะทำการโอนเงินไปยังบัญชีรับสินไหมใหม่ที่ระบุ
            </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, justifyContent: "center", gap: 2 }}>
            <Button variant="outlined" onClick={onCancel}>
                ยกเลิก
            </Button>
            <Button variant="contained" color="success" onClick={onConfirm} disabled={isSubmitting}>
                ยืนยัน
            </Button>
        </DialogActions>
    </Dialog>
);
