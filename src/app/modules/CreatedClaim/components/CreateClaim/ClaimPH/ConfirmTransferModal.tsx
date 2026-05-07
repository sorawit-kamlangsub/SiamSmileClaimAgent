import React from "react";
import { Box, Button, Dialog, DialogContent, DialogTitle, Divider, Typography } from "@mui/material";
import CommentIcon from "@mui/icons-material/Comment";
import { useAppSelector } from "../../../../../../redux";

interface Props {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const ConfirmTransferModal: React.FC<Props> = ({ open, onClose, onConfirm }) => {
    const { form, bankAccounts, contacts } = useAppSelector((state) => state.claimph);
    const defaultBank = bankAccounts.find((b) => b.isDefault);
    const defaultContact = contacts.find((c) => c.isDefault);

    const Row = ({ label, value }: { label: string; value: string }) => (
        <Box display="flex" gap={1} py={0.3}>
            <Typography variant="body2" color="text.secondary" minWidth={150}>
                {label} :
            </Typography>
            <Typography variant="body2" fontWeight={700}>
                {value || "-"}
            </Typography>
        </Box>
    );

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Box display="flex" alignItems="center" gap={1}>
                    <CommentIcon color="primary" />
                    <Typography fontWeight={700}>ยืนยันแจ้งโอนเงิน</Typography>
                </Box>
            </DialogTitle>
            <DialogContent>
                <Box pt={1}>
                    <Row label="เบอร์โทรติดต่อ" value={defaultContact?.phone ?? "-"} />
                    <Row label="ธนาคาร" value={defaultBank?.bankName ?? "-"} />
                    <Row label="เลขที่บัญชี" value={defaultBank?.accountNo ?? "-"} />
                    <Row label="ชื่อบัญชี" value={defaultBank?.accountName ?? "-"} />
                    <Row
                        label="จำนวนเงินโอน"
                        value={`${Number(form.claimAmount).toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท`}
                    />
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                        | กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนยืนยันการทำรายการ
                    </Typography>
                    <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
                        <Button variant="outlined" onClick={onClose}>
                            ยกเลิก
                        </Button>
                        <Button variant="contained" color="primary" onClick={onConfirm}>
                            ยืนยันแจ้งโอนเงิน
                        </Button>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default ConfirmTransferModal;
