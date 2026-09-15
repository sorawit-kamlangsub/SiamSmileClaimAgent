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
    useMediaQuery,
    useTheme,
} from "@mui/material";
import CommentIcon from "@mui/icons-material/Comment";
import CloseIcon from "@mui/icons-material/Close";

import { setBankLogo } from "../../../../functionHelpers";

type ConfirmHospitalCompensationTransferModalProps = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading?: boolean;
    /** ชื่อลูกค้า (ผู้เอาประกัน) */
    customerName?: string;
    /** เบอร์โทรติดต่อ */
    phone?: string;
    /** บัญชีรับเงินค่าชดเชย (ค่าจาก Step 3 — textfield ที่แก้ ถ้าไม่แก้ = default จาก API) */
    payoutAccount: {
        bankId?: number;
        bankName?: string;
        accountNo?: string;
        accountName?: string;
    };
    /** สิทธิ์โรงพยาบาลตั้งเบิกกับบริษัท */
    hospitalPayableAmount: number;
    /** จำนวนเงินค่าชดเชยที่โอนให้ลูกค้า */
    transferAmount: number;
};

const fmtBaht = (n: number) => n.toLocaleString("th-TH", { minimumFractionDigits: 2 });

/**
 * Dialog ยืนยันก่อน "อนุมัติเคลมโรงพยาบาล + โอนค่าชดเชยให้ลูกค้า"
 * layout อ้างอิง ConfirmTransferPAModal (หน้าสร้างเคลม PA)
 */
const ConfirmHospitalCompensationTransferModal = ({
    open,
    onClose,
    onConfirm,
    isLoading,
    customerName,
    phone,
    payoutAccount,
    hospitalPayableAmount,
    transferAmount,
}: ConfirmHospitalCompensationTransferModalProps) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const logoSrc = setBankLogo(payoutAccount.bankId);

    return (
        <Dialog open={open} maxWidth="sm" fullScreen={fullScreen} fullWidth onClose={onClose}>
            <DialogTitle>
                <Grid container alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={1}>
                        <Avatar sx={{ width: 40, height: 40, bgcolor: "#DCEFFC" }}>
                            <CommentIcon sx={{ fontSize: 24, color: "primary.main" }} />
                        </Avatar>
                        <Typography fontWeight="bold" fontSize={18}>
                            ยืนยันการทำรายการ
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={onClose}
                        size="small"
                        disabled={isLoading}
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
                    <Grid item xs={12}>
                        <Box display="flex" gap={1} alignItems="center">
                            <Typography fontSize={15} color="text.secondary">
                                ชื่อลูกค้า :
                            </Typography>
                            <Typography fontSize={15} fontWeight={700} color="primary">
                                {customerName || "-"}
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Box display="flex" gap={1} alignItems="center">
                            <Typography fontSize={15} color="text.secondary">
                                เบอร์โทรติดต่อ :
                            </Typography>
                            <Typography fontSize={15} fontWeight={700} color="primary">
                                {phone || "-"}
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Box display="flex" gap={1} alignItems="center">
                            <Typography fontSize={15} color="text.secondary">
                                สิทธิ์โรงพยาบาลตั้งเบิกกับบริษัท :
                            </Typography>
                            <Typography fontSize={15} fontWeight={700} color="primary">
                                {fmtBaht(hospitalPayableAmount)}
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography fontSize={15} color="text.secondary" mb={1.5}>
                            รายละเอียดบัญชีรับเงินค่าชดเชย :
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
                                        {payoutAccount.bankName?.slice(0, 2) ?? ""}
                                    </Typography>
                                )}
                            </Avatar>
                            <Box>
                                {[
                                    ["ธนาคาร", payoutAccount.bankName],
                                    ["เลขที่บัญชี", payoutAccount.accountNo],
                                    ["ชื่อบัญชี", payoutAccount.accountName],
                                ].map(([label, value]) => (
                                    <Box key={label} display="flex" gap={1}>
                                        <Typography fontSize={16} color="text.secondary" minWidth={90}>
                                            {label} :
                                        </Typography>
                                        <Typography fontSize={16} fontWeight="bold">
                                            {value || "-"}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Box textAlign="center" py={1}>
                            <Typography fontSize={16} color="text.secondary" mb={0.5}>
                                จำนวนเงินโอน
                            </Typography>
                            <Typography variant="h5" fontWeight="bold" color="primary">
                                THB {fmtBaht(transferAmount)}
                            </Typography>
                        </Box>
                    </Grid>

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
                                กรุณาตรวจสอบข้อมูลบัญชีและจำนวนเงินให้ถูกต้องก่อนยืนยัน ระบบจะอนุมัติเคลม
                                สร้างรายการตั้งจ่าย และทำรายการโอนค่าชดเชยให้ลูกค้าทันที
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                <Grid container justifyContent="center" alignItems="center" spacing={1.5} mt={0.5}>
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                        <Button variant="outlined" fullWidth size="medium" onClick={onClose} disabled={isLoading}>
                            ยกเลิก
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                        <Button
                            variant="contained"
                            color="success"
                            fullWidth
                            size="medium"
                            onClick={() => onConfirm()}
                            disabled={isLoading}
                        >
                            ยืนยันการทำรายการ
                        </Button>
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    );
};

export default ConfirmHospitalCompensationTransferModal;
