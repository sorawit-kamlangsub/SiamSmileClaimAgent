import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    MenuItem,
    TextField,
    Typography,
} from "@mui/material";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionIcon from "@mui/icons-material/Description";
import LockOutlined from "@mui/icons-material/LockOutlined";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { useState } from "react";
import { useGetIncreaseTransferLimitDetail } from "../../../api/coreClaimApi";
import { GetIncreaseTransferLimitDetailResponseDto } from "../../../api/coreClaimApi.client";
import { IncreaseTransferMonitorRow } from "../hooks/ClaimDetailsDataTableHook";

type IncreaseLimitDetailDialogProps = {
    open: boolean;
    row: IncreaseTransferMonitorRow | null;
    onClose: () => void;
};

const formatNumber = (value: number | undefined | null) =>
    value == null
        ? "-"
        : value.toLocaleString("th-TH", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });

const formatBaht = (value: number | undefined | null) => `฿ ${formatNumber(value)}`;

const IncreaseLimitDetailDialog = ({ open, row, onClose }: IncreaseLimitDetailDialogProps) => {
    const caseTransferApprovalId = row?.caseTransferApprovalId ?? "";
    const { data: detailRes, isLoading: isDetailLoading } = useGetIncreaseTransferLimitDetail(caseTransferApprovalId);

    const detail = detailRes?.data as GetIncreaseTransferLimitDetailResponseDto | undefined;
    // TODO: Approve/Reject ยังไม่มี API จาก CodeGen (UpdateIncreaseTransferLimitStatus) — ปุ่มเปิด UI ไว้ก่อน ยังไม่ submit
    const [rejectReason, setRejectReason] = useState("");

    return (
        <Dialog open={open} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    p: "16px 24px",
                    borderBottom: "1px solid #E0E0E0",
                }}
            >
                <Box
                    sx={{
                        width: 32,
                        height: 32,
                        minWidth: 32,
                        borderRadius: "50%",
                        backgroundColor: "#E3F2FD",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <AutorenewIcon sx={{ color: "#1565C0", fontSize: 18 }} />
                </Box>
                <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, color: "#212121", flex: 1 }}>
                    ขยายวงเงิน
                </Typography>
                <IconButton
                    size="small"
                    onClick={onClose}
                    sx={{ backgroundColor: "#FDECEC", color: "#E53935", "&:hover": { backgroundColor: "#FBD5D5" } }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: "15px", pb: 0 }}>
                {isDetailLoading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <Box sx={{ border: "1px solid #D9DEE5", borderRadius: 2, p: 2, mt: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                                <DescriptionIcon sx={{ color: "#0D4C8C", fontSize: 20 }} />
                                <Typography sx={{ fontWeight: 600, fontSize: "1rem", color: "#0D4C8C" }}>
                                    รายละเอียดเคลม
                                </Typography>
                            </Box>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Box
                                        sx={{
                                            border: "1px solid #D9DEE5",
                                            borderRadius: 2,
                                            p: "10px 14px",
                                            height: "100%",
                                        }}
                                    >
                                        <Typography sx={{ fontSize: "0.8rem", color: "#757575" }}>
                                            เลขที่ CC :
                                        </Typography>
                                        <Typography sx={{ mt: 0.5, fontWeight: 600, color: "#1565C0" }}>
                                            {detail?.caseNo ?? "-"}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box
                                        sx={{
                                            border: "1px solid #D9DEE5",
                                            borderRadius: 2,
                                            p: "10px 14px",
                                            height: "100%",
                                        }}
                                    >
                                        <Typography sx={{ fontSize: "0.8rem", color: "#757575" }}>
                                            ชื่อผู้เอาประกัน :
                                        </Typography>
                                        <Typography sx={{ mt: 0.5, fontWeight: 600, color: "#212121" }}>
                                            {detail?.customerName ?? "-"}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12}>
                                    <Box
                                        sx={{
                                            border: "1px solid #D9DEE5",
                                            borderRadius: 2,
                                            p: "10px 14px",
                                            display: "flex",
                                            alignItems: "baseline",
                                            gap: 1,
                                        }}
                                    >
                                        <Typography sx={{ fontSize: "0.9rem", color: "#757575" }}>
                                            จำนวนเงิน :
                                        </Typography>
                                        <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, color: "#212121" }}>
                                            {formatBaht(detail?.requestedTransferAmount)}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>

                        <Box sx={{ borderTop: "1px solid #E0E0E0", my: 2 }} />

                        <Box sx={{ border: "1px solid #D9DEE5", borderRadius: 2, p: 2 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                                <VerifiedUserIcon sx={{ color: "#0D4C8C", fontSize: 20 }} />
                                <Typography sx={{ fontWeight: 600, fontSize: "1rem", color: "#0D4C8C" }}>
                                    อนุมัติวงเงิน
                                </Typography>
                            </Box>

                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Box
                                        sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            textAlign: "center",
                                            backgroundColor: "#EAF2FB",
                                        }}
                                    >
                                        <Typography sx={{ fontSize: "0.8rem", color: "#0A55A2" }}>
                                            วงเงินปัจจุบัน
                                        </Typography>
                                        <Typography
                                            sx={{ mt: 0.5, fontWeight: 700, fontSize: "1.15rem", color: "#0A55A2" }}
                                        >
                                            {formatNumber(detail?.currentLimit)}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box
                                        sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            textAlign: "center",
                                            backgroundColor: "#FFF6E5",
                                        }}
                                    >
                                        <Typography sx={{ fontSize: "0.8rem", color: "#B7791F" }}>
                                            วงเงินที่ใช้ไป
                                        </Typography>
                                        <Typography
                                            sx={{ mt: 0.5, fontWeight: 700, fontSize: "1.15rem", color: "#B7791F" }}
                                        >
                                            {formatNumber(detail?.usedAmount)}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>

                            <Box sx={{ mt: 2, p: "10px 14px", borderRadius: 2, backgroundColor: "#FDECEC" }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography sx={{ fontSize: "0.9rem", color: "#C62828" }}>
                                        จำนวนคงเหลือ (ภายในวัน) :
                                    </Typography>
                                    <Typography sx={{ fontWeight: 700, color: "#C62828" }}>
                                        {formatBaht(detail?.remainingAmount)}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ mt: 2, p: "10px 14px", borderRadius: 2, backgroundColor: "#F1F8E9" }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography sx={{ fontSize: "0.9rem", color: "#33691E" }}>
                                        วงเงินคงเหลือ (ครั้งใหม่) :
                                    </Typography>
                                    <Typography sx={{ fontWeight: 700, color: "#33691E" }}>
                                        {formatBaht(detail?.newRemainingLimit)}
                                    </Typography>
                                </Box>
                            </Box>

                            <Grid container spacing={2} sx={{ mt: 0.5 }}>
                                <Grid item xs={12} sm={6}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "4px",
                                            mb: 0.5,
                                        }}
                                    >
                                        <Typography component="span" sx={{ fontSize: "0.85rem", color: "#D32F2F" }}>
                                            วงเงินที่ขอเพิ่ม
                                        </Typography>
                                        <Box
                                            component="span"
                                            sx={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "4px",
                                                whiteSpace: "nowrap",
                                                fontSize: "0.75rem",
                                            }}
                                        >
                                            <LockOutlined sx={{ fontSize: 12, color: "#D32F2F" }} />
                                            <Typography component="span" sx={{ fontSize: "0.75rem", color: "#212121" }}>
                                                คำนวณโดยระบบ
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box
                                        sx={{
                                            border: "1px solid #D9DEE5",
                                            borderRadius: 1,
                                            backgroundColor: "#F5F6F7",
                                            p: "8px 12px",
                                        }}
                                    >
                                        <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#212121" }}>
                                            {formatBaht(detail?.requestedTransferAmount)}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography sx={{ fontSize: "0.8rem", color: "#757575", mb: 0.5 }}>
                                        สาเหตุการปฏิเสธ <span style={{ color: "#D32F2F" }}>*</span>
                                    </Typography>
                                    {/* TODO: ยังไม่ต่อ API submit (UpdateIncreaseTransferLimitStatus) — option ตรงตาม design จริง */}
                                    <TextField
                                        select
                                        value={rejectReason}
                                        onChange={(event) => setRejectReason(event.target.value)}
                                        size="small"
                                        fullWidth
                                    >
                                        <MenuItem value="">สาเหตุการปฏิเสธ</MenuItem>
                                        <MenuItem value="wrong_calc">คำนวนยอดผิด</MenuItem>
                                        <MenuItem value="wrong_transfer">โอนผิดคน</MenuItem>
                                    </TextField>
                                </Grid>
                            </Grid>

                            <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 2, pb: 2 }}>
                                {/* TODO: ปุ่มอนุมัติ/ปฏิเสธ ยังไม่ต่อ API (UpdateIncreaseTransferLimitStatus) — ปิดปุ่มไว้ก่อน
                                    เมื่อ API พร้อม: useMutation + onSuccessCallback ตัดสินใจกับ detail */}
                                <Button variant="contained" disabled sx={{ backgroundColor: "#1B6CB2" }}>
                                    อนุมัติ
                                </Button>
                                <Button variant="outlined" color="error" disabled>
                                    ปฏิเสธ
                                </Button>
                            </Box>
                        </Box>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default IncreaseLimitDetailDialog;
