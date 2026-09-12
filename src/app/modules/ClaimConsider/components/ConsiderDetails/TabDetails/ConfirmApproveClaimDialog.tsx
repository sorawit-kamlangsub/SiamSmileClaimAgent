import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    Typography,
} from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionIcon from "@mui/icons-material/Description";
import FolderIcon from "@mui/icons-material/Folder";
import PaymentsIcon from "@mui/icons-material/Payments";
import InfoIcon from "@mui/icons-material/Info";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { numberWithCommas } from "../../../../../functionHelpers";

type RefCardProps = {
    icon: React.ReactNode;
    label: string;
    value: string | undefined;
};

const RefCard = ({ icon, label, value }: RefCardProps) => (
    <Box sx={{ border: "1px solid #E0E0E0", borderRadius: 2, padding: "10px 14px", height: "100%" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.25 }}>
            {icon}
            <Typography sx={{ fontSize: "0.75rem", color: "#757575" }}>{label}</Typography>
        </Box>
        <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#212121" }}>{value || "-"}</Typography>
    </Box>
);

export type ConfirmApproveClaimDialogProps = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    claimNo: string | undefined;
    caseNo: string | undefined;
    approvedAmount: number;
    isLoading?: boolean;
};

const ConfirmApproveClaimDialog = ({
    open,
    onClose,
    onConfirm,
    claimNo,
    caseNo,
    approvedAmount,
    isLoading = false,
}: ConfirmApproveClaimDialogProps) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                <Box
                    sx={{
                        width: 48,
                        height: 48,
                        minWidth: 48,
                        borderRadius: 2,
                        backgroundColor: "#E8F5E9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <VerifiedIcon sx={{ color: "#2E7D32", fontSize: 28 }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: "1.15rem", fontWeight: 700, color: "#212121" }}>
                        ยืนยันอนุมัติรายการ
                    </Typography>
                    <Typography sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
                        ตรวจสอบรายละเอียดก่อนยืนยันผลการพิจารณา
                    </Typography>
                </Box>
                <IconButton
                    onClick={onClose}
                    disabled={isLoading}
                    sx={{ backgroundColor: "#FDECEC", color: "#B32615", "&:hover": { backgroundColor: "#FBD5D5" } }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <Grid container spacing={1.5}>
                    <Grid item xs={12} sm={6}>
                        <RefCard
                            icon={<DescriptionIcon sx={{ color: "#0B7FC7", fontSize: 18 }} />}
                            label="เลขที่ Claim"
                            value={claimNo}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <RefCard
                            icon={<FolderIcon sx={{ color: "#0B7FC7", fontSize: 18 }} />}
                            label="เลขที่ Case"
                            value={caseNo}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Box
                            sx={{
                                border: "1px solid #A5D6A7",
                                backgroundColor: "#E8F5E9",
                                borderRadius: 2,
                                padding: "12px 14px",
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.25 }}>
                                <PaymentsIcon sx={{ color: "#2E7D32", fontSize: 18 }} />
                                <Typography sx={{ fontSize: "0.75rem", color: "#2E7D32" }}>
                                    จำนวนเงินที่อนุมัติ
                                </Typography>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                                <Typography sx={{ fontSize: "1.75rem", fontWeight: 700, color: "#1B5E20" }}>
                                    {numberWithCommas(approvedAmount, 2)}
                                </Typography>
                                <Typography sx={{ fontSize: "0.85rem", color: "#4C7C4F" }}>บาท</Typography>
                            </Box>
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Box
                            sx={{
                                backgroundColor: "#F5F7FA",
                                borderRadius: 2,
                                padding: "12px 14px",
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                            }}
                        >
                            <InfoIcon sx={{ color: "#1976D2", fontSize: 20, flexShrink: 0 }} />
                            <Box sx={{ flex: 1, textAlign: "center" }}>
                                <Typography sx={{ fontSize: "0.9rem", color: "#455A64" }}>
                                    เมื่อยืนยันแล้ว ระบบจะบันทึกผลการพิจารณาเป็น{" "}
                                    <Box component="span" sx={{ fontWeight: 700, color: "#2E7D32" }}>
                                        อนุมัติ
                                    </Box>
                                </Typography>
                                <Typography sx={{ fontSize: "0.9rem", color: "#455A64" }}>
                                    กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนดำเนินการ
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button variant="outlined" onClick={onClose} disabled={isLoading}>
                    ยกเลิก
                </Button>
                <Button
                    variant="contained"
                    startIcon={<CheckCircleIcon />}
                    onClick={onConfirm}
                    disabled={isLoading}
                    sx={{ bgcolor: "#2E7D32", "&:hover": { bgcolor: "#1B5E20" } }}
                >
                    ยืนยันอนุมัติ
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmApproveClaimDialog;
