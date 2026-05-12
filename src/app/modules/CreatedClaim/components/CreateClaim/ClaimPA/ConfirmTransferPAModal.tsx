import React from "react";
import {
    Avatar,
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    Typography,
} from "@mui/material";
import CommentIcon from "@mui/icons-material/Comment";
import CloseIcon from "@mui/icons-material/Close";
import { useAppSelector } from "../../../../../../redux";
import { setBankLogo } from "../../../../../functionHelpers";

interface Props {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const ConfirmTransferPAModal: React.FC<Props> = ({ open, onClose, onConfirm }) => {
    const { bankAccounts, contacts, claimItems, school } = useAppSelector((s) => s.claimpa);
    const defaultBank = bankAccounts.find((b) => b.isDefault);
    const defaultContact = contacts.find((c) => c.isDefault);
    const logoSrc = setBankLogo(defaultBank?.bankId);
    const totalAmount = claimItems.reduce((sum, i) => sum + i.claimAmount, 0);

    return (
        <Dialog open={open} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Grid container alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={1}>
                        <Avatar sx={{ width: 40, height: 40, bgcolor: "#DCEFFC" }}>
                            <CommentIcon sx={{ fontSize: 24, color: "primary.main" }} />
                        </Avatar>
                        <Typography fontWeight="bold" fontSize={18}>
                            ยืนยันแจ้งโอนเงิน
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={onClose}
                        size="small"
                        sx={{
                            bgcolor: "error.main",
                            color: "common.white",
                            width: 25,
                            height: 25,
                            "&:hover": { bgcolor: "error.dark" },
                        }}
                    >
                        <CloseIcon sx={{ fontSize: 23 }} />
                    </IconButton>
                </Grid>
                <Divider sx={{ mt: 1.5 }} />
            </DialogTitle>

            <DialogContent>
                <Grid container spacing={1.5}>
                    {/* สถานศึกษา */}
                    <Grid item xs={12}>
                        <Box display="flex" gap={1} alignItems="center">
                            <Typography fontSize={15} color="text.secondary">
                                สถานศึกษา :
                            </Typography>
                            <Typography fontSize={15} fontWeight={700} color="primary">
                                {school?.schoolName ?? "-"}
                            </Typography>
                        </Box>
                    </Grid>

                    {/* เบอร์โทรติดต่อ */}
                    <Grid item xs={12}>
                        <Box display="flex" gap={1} alignItems="center">
                            <Typography fontSize={15} color="text.secondary">
                                เบอร์โทรติดต่อ :
                            </Typography>
                            <Typography fontSize={15} fontWeight={700} color="primary">
                                {defaultContact?.phone ?? "-"}
                            </Typography>
                        </Box>
                    </Grid>

                    {/* จำนวนราย */}
                    <Grid item xs={12}>
                        <Box display="flex" gap={1} alignItems="center">
                            <Typography fontSize={15} color="text.secondary">
                                จำนวนราย :
                            </Typography>
                            <Typography fontSize={15} fontWeight={700} color="primary">
                                {claimItems.length} ราย
                            </Typography>
                        </Box>
                    </Grid>

                    {/* รายละเอียดบัญชีรับสินไหม */}
                    <Grid item xs={12}>
                        <Typography fontSize={15} color="text.secondary" mb={2}>
                            รายละเอียดบัญชีสินไหม :
                        </Typography>
                        <Box
                            sx={{
                                bgcolor: "#f5f5f5",
                                borderRadius: 2,
                                p: 2,
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                            }}
                        >
                            <Avatar
                                src={logoSrc ?? undefined}
                                variant="circular"
                                sx={{
                                    width: 80,
                                    height: 80,
                                    bgcolor: logoSrc ? "transparent" : "#e3f2fd",
                                    flexShrink: 0,
                                }}
                            >
                                {!logoSrc && (
                                    <Typography variant="caption" color="primary" fontWeight="bold">
                                        {defaultBank?.bankName?.slice(0, 2) ?? ""}
                                    </Typography>
                                )}
                            </Avatar>
                            <Box>
                                {[
                                    ["ธนาคาร", defaultBank?.bankName],
                                    ["เลขที่บัญชี", defaultBank?.accountNo],
                                    ["ชื่อบัญชี", defaultBank?.accountName],
                                ].map(([label, value]) => (
                                    <Box key={label} display="flex" gap={1}>
                                        <Typography fontSize={16} color="text.secondary" minWidth={90}>
                                            {label} :
                                        </Typography>
                                        <Typography fontSize={16} fontWeight="bold">
                                            {value ?? "-"}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </Grid>

                    {/* จำนวนเงินโอน */}
                    <Grid item xs={12}>
                        <Box textAlign="center" py={1}>
                            <Typography fontSize={16} color="text.secondary" mb={0.5}>
                                จำนวนเงินโอน
                            </Typography>
                            <Typography variant="h5" fontWeight="bold" color="primary">
                                THB {totalAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                            </Typography>
                        </Box>
                    </Grid>

                    {/* Warning box */}
                    <Grid item xs={12}>
                        <Box
                            sx={{
                                bgcolor: "#fdf6e3",
                                borderLeft: "4px solid #c8a415",
                                px: 2,
                                py: 1,
                                borderRadius: "0 4px 4px 0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Typography fontSize={15} fontWeight="bold" color="#c8a415">
                                กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนยืนยันการทำรายการ
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                {/* ปุ่มยืนยัน */}
                <Grid container justifyContent="center" alignItems="center" mt={2}>
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                        <Button
                            variant="contained"
                            color="success"
                            fullWidth
                            size="medium"
                            onClick={onConfirm}
                            sx={{ mt: 1 }}
                        >
                            ยืนยันแจ้งโอนเงิน
                        </Button>
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    );
};

export default ConfirmTransferPAModal;
