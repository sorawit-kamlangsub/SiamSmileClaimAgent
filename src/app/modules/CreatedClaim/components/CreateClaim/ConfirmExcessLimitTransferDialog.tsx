import React, { useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    Checkbox,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    TextField,
    Typography,
    Divider,
    useTheme,
    useMediaQuery,
} from "@mui/material";
import { NumericFormat } from "react-number-format";
// import CloseIcon from "@mui/icons-material/Close";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import VerifiedIcon from "@mui/icons-material/Verified";
import PersonIcon from "@mui/icons-material/Person";

/**
 * ชิปข้อมูลเพิ่มเติมที่แสดงบน header card (เช่น โรงเรียน สำหรับ PA หรือข้อมูลอื่นๆ สำหรับ PH)
 */
export interface ExcessLimitInfoChip {
    icon?: React.ReactNode;
    label: React.ReactNode;
}

export interface ConfirmExcessLimitTransferDialogProps {
    open: boolean;
    onClose: () => void;
    /** callback เมื่อกดยืนยัน จะได้ยอดที่เบิกได้ / ยอดจ่ายเกินสิทธิ์ (NPL) / ยอดรวม ที่ผู้ใช้ระบุ */
    onConfirm: (payload: { withdrawableAmount: number; nplAmount: number; totalAmount: number }) => void;
    loading?: boolean;

    // ── ข้อมูลผู้เอาประกัน (header card) ──
    headerLabel?: string; // ค่าเริ่มต้น "ผู้เอาประกันที่กำลังดำเนินการ"
    customerName: string;
    productLabel: string; // เช่น "PA" หรือ "PH"
    idCardNo?: string;
    appId?: string | number;
    extraChips?: ExcessLimitInfoChip[]; // ชิปเพิ่มเติม เช่น โรงเรียน (PA) / ชื่อ รพ. (PH)

    // ── ยอดเงิน ──
    requestedAmount: number; // ยอดเงินที่ขอเบิก
    maxEligibleAmount: number; // สิทธิ์เบิกสูงสุด
}

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0);

const SummaryRow: React.FC<{
    label: string;
    value: number;
    variant?: "default" | "info" | "error";
}> = ({ label, value, variant = "default" }) => {
    const bgByVariant = {
        default: "#f5f6f8",
        info: "#eaf2fe",
        error: "#fdecec",
    } as const;
    const colorByVariant = {
        default: "text.primary",
        info: "primary.main",
        error: "error.main",
    } as const;

    return (
        <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ bgcolor: bgByVariant[variant], borderRadius: 1.5, px: 2, py: 1.25 }}
        >
            <Typography fontWeight={600} color={colorByVariant[variant]}>
                {label}
            </Typography>
            <Typography fontWeight={700} color={colorByVariant[variant]}>
                {formatCurrency(value)}
            </Typography>
        </Box>
    );
};

const ConfirmExcessLimitTransferDialog: React.FC<ConfirmExcessLimitTransferDialogProps> = ({
    open,
    onClose,
    onConfirm,
    loading = false,
    headerLabel = "ผู้เอาประกันที่กำลังดำเนินการ",
    customerName,
    productLabel,
    idCardNo,
    appId,
    extraChips = [],
    requestedAmount,
    maxEligibleAmount,
}) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const excessAmount = Math.max(requestedAmount - maxEligibleAmount, 0);

    const [withdrawableAmount, setWithdrawableAmount] = useState<number>(maxEligibleAmount);
    const [nplAmount, setNplAmount] = useState<number>(excessAmount);
    const [agree, setAgree] = useState(false);

    // รีเซ็ตค่าทุกครั้งที่เปิด dialog ใหม่ หรือยอดที่ส่งเข้ามาเปลี่ยน
    useEffect(() => {
        if (open) {
            setWithdrawableAmount(maxEligibleAmount);
            setNplAmount(excessAmount);
            setAgree(false);
        }
    }, [open, maxEligibleAmount, excessAmount]);

    const totalAmount = useMemo(() => (withdrawableAmount || 0) + (nplAmount || 0), [withdrawableAmount, nplAmount]);

    const isWithdrawableOverLimit = withdrawableAmount > maxEligibleAmount;
    const isAmountInvalid = withdrawableAmount < 0 || nplAmount < 0 || isWithdrawableOverLimit;
    const canConfirm = agree && !isAmountInvalid && !loading;

    const handleConfirm = () => {
        if (!canConfirm) return;
        onConfirm({ withdrawableAmount, nplAmount, totalAmount });
    };

    return (
        <Dialog
            open={open}
            fullScreen={fullScreen}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}
        >
            <DialogContent>
                {/* ── ข้อมูลผู้เอาประกัน (อยู่ในกล่องเดียวกับ dialog) ── */}
                <Box
                    sx={{
                        borderRadius: 3,
                        p: 2,
                        mb: 2,
                        bgcolor: "#eaf2fe",
                        border: "1px solid",
                        borderColor: "primary.light",
                        position: "sticky",
                        top: 0,
                        zIndex: 2,
                    }}
                >
                    <Box display="flex" alignItems="flex-start" gap={1.5}>
                        <Box
                            sx={{
                                bgcolor: "primary.main",
                                color: "#fff",
                                borderRadius: "50%",
                                width: 32,
                                height: 32,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                            }}
                        >
                            <PersonIcon fontSize="small" />
                        </Box>
                        <Box flex={1}>
                            <Typography variant="body2" fontWeight={600} color="text.secondary">
                                <VerifiedIcon
                                    sx={{ fontSize: 14, verticalAlign: "middle", mr: 0.5, color: "primary.main" }}
                                />
                                {headerLabel}
                            </Typography>
                            <Typography fontWeight={700} fontSize={16} mb={1}>
                                {customerName}
                            </Typography>
                            <Box display="flex" gap={1} flexWrap="wrap">
                                <Chip size="small" color="primary" label={`ผลิตภัณฑ์ ${productLabel}`} />
                                {idCardNo && (
                                    <Chip size="small" variant="outlined" label={`เลขบัตรประชาชน ${idCardNo}`} />
                                )}
                                {appId && <Chip size="small" variant="outlined" label={`AppID ${appId}`} />}
                                {extraChips
                                    .filter((chip) => Boolean(chip.label))
                                    .map((chip, idx) => (
                                        <Chip
                                            key={idx}
                                            size="small"
                                            variant="outlined"
                                            icon={chip.icon as React.ReactElement}
                                            label={chip.label}
                                        />
                                    ))}
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {/* ── หัวข้อยืนยันการทำรายการ ── */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box display="flex" gap={1.5} alignItems="flex-start">
                        <WarningAmberIcon color="warning" sx={{ fontSize: 24 }} />
                        <Box>
                            <Typography fontWeight={700} fontSize={17}>
                                ยืนยันการทำรายการ
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                ตรวจสอบยอดเงินก่อนยืนยัน
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* ── กล่องแจ้งเตือนจ่ายเกินสิทธิ์ ── */}
                <Box
                    sx={{
                        bgcolor: "#fdf6e3",
                        border: "1px solid #f0d98c",
                        borderRadius: 2,
                        p: 2,
                        mb: 2,
                        display: "flex",
                        gap: 1.5,
                    }}
                >
                    <ErrorOutlineIcon sx={{ color: "#c8a415" }} />
                    <Box>
                        <Typography fontWeight={700} sx={{ color: "#c8a415" }}>
                            จ่ายเกินสิทธิ์
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#8a7418" }}>
                            ลูกค้าจะได้รับเงินเต็มจำนวนตามยอดที่ขอเบิก
                            โดยส่วนที่เกินสิทธิ์จะถูกบันทึกเป็นรายการจ่ายเกินสิทธิ์ (NPL)
                        </Typography>
                    </Box>
                </Box>

                {/* ── สรุปยอดเงิน ── */}
                <Box display="flex" flexDirection="column" gap={1} mb={2}>
                    <SummaryRow label="ยอดเงินที่ขอเบิก" value={requestedAmount} />
                    <SummaryRow label="สิทธิ์เบิกสูงสุด" value={maxEligibleAmount} variant="info" />
                    <SummaryRow label="ยอดเงินเกิน" value={excessAmount} variant="error" />
                </Box>

                {/* ── ช่องกรอกยอดที่เบิกได้ / ยอดจ่ายเกินสิทธิ์ ── */}
                <Box display="flex" gap={2} mb={2} flexWrap="wrap">
                    <Box flex={1} minWidth={180}>
                        <Typography variant="body2" fontWeight={600} mb={0.5}>
                            ยอดที่เบิกได้
                            <Typography component="span" color="error">
                                *
                            </Typography>
                        </Typography>
                        <NumericFormat
                            customInput={TextField}
                            value={withdrawableAmount}
                            onValueChange={(v) => setWithdrawableAmount(v.floatValue ?? 0)}
                            thousandSeparator
                            decimalScale={2}
                            fixedDecimalScale
                            size="small"
                            fullWidth
                            error={isWithdrawableOverLimit}
                            helperText={isWithdrawableOverLimit ? "ต้องไม่เกินสิทธิ์เบิกสูงสุด" : " "}
                            InputProps={{ readOnly: true }}
                        />
                    </Box>
                    <Box flex={1} minWidth={180}>
                        <Typography variant="body2" fontWeight={600} mb={0.5} color="error">
                            จ่ายเงินเกินสิทธิ์ (NPL)
                            <Typography component="span" color="error">
                                *
                            </Typography>
                        </Typography>
                        <NumericFormat
                            customInput={TextField}
                            value={nplAmount}
                            onValueChange={(v) => setNplAmount(v.floatValue ?? 0)}
                            thousandSeparator
                            decimalScale={2}
                            fixedDecimalScale
                            size="small"
                            fullWidth
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    bgcolor: "#fdecec",
                                    "& fieldset": { borderColor: "error.light" },
                                },
                            }}
                            helperText=" "
                            InputProps={{ readOnly: true }}
                        />
                    </Box>
                </Box>

                {/* ── จำนวนเงินโอนรวม ── */}
                <Box sx={{ bgcolor: "#eaf2fe", borderRadius: 2, p: 1.5, textAlign: "center", mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        จำนวนเงินโอนรวม
                    </Typography>
                    <Typography fontWeight={700} color="primary.main" fontSize={18}>
                        {formatCurrency(totalAmount)} บาท
                    </Typography>
                </Box>

                {/* ── checkbox ยืนยัน ── */}
                <Box
                    sx={{
                        border: "1px solid #f0d98c",
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        px: 1,
                        py: 2,
                        gap: 1,
                        boxShadow: "1px 2px 2px rgba(0, 0, 0, 0.1)",
                    }}
                >
                    <Checkbox checked={agree} onChange={(e) => setAgree(e.target.checked)} color="primary" />
                    <VerifiedIcon sx={{ color: "#c8792a", fontSize: 22, flexShrink: 0 }} />
                    <Box flex={1}>
                        <Typography variant="body2" fontWeight={700} >
                            ยืนยันการตรวจสอบและการจ่ายเงินเกินสิทธิ์
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            ข้าพเจ้าได้ตรวจสอบข้อมูล และยืนยันการจ่ายเงินเกินสิทธิ์ (NPL)
                        </Typography>
                    </Box>
                    <Chip
                        size="small"
                        label="จำเป็นต้องยืนยัน"
                        sx={{ bgcolor: "#fdecec", color: "error.main", fontWeight: 600, flexShrink: 0 }}
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, borderTop: "1px solid #e0e0e0" }}>
                <Button
                    variant="outlined"
                    color="inherit"
                    onClick={onClose}
                    disabled={loading}
                    size="medium"
                    sx={{ shadow: "1px 2px 2px rgba(0, 0, 0, 0.1)" }}
                >
                    กลับไปแก้ไข
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleConfirm}
                    disabled={!canConfirm}
                    size="medium"
                >
                    ยืนยันจ่ายเกินสิทธิ์
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmExcessLimitTransferDialog;
