import { Box, Button, CircularProgress, Dialog, DialogContent, DialogTitle, Grid, IconButton, Typography } from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import CloseIcon from "@mui/icons-material/Close";
import { FormikErrors, useFormik } from "formik";
import { useEffect } from "react";
import { FormikDropdown, FormikTextField } from "../../_common";
import { useGetCaseRefundApproveDetail, useGetRefundReasons } from "../../Refund/refundAPI";
import { RefundApproveMonitorRow } from "../hooks/RefundApproveDataTableHook";

type ApproveRefundDialogProps = {
    open: boolean;
    row: RefundApproveMonitorRow | null;
    onClose: () => void;
};

type ApproveRefundDialogFormValues = {
    rejectReasonId: number | undefined;
    note: string;
};

type ApproveRefundCaseDetail = {
    caseId?: string;
    caseNo?: string;
    customerName?: string;
    coverageTypeNameTH?: string;
    totalNetPaidAmount?: number;
    additionalAmount?: number;
};

type ApproveRefundDetail = {
    claimNo?: string;
    customerName?: string;
    createdBy?: string;
    countItem?: number;
    refundCount?: number;
    remainingAmount?: number;
    totalNetPaidAmount?: number;
    totalRefundAmount?: number;
    claimId?: string;
    caseDetails?: ApproveRefundCaseDetail[];
};

const defaultValues: ApproveRefundDialogFormValues = {
    rejectReasonId: undefined,
    note: "",
};

const formatNumber = (value: number | undefined | null) =>
    value == null
        ? "-"
        : value.toLocaleString("th-TH", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });

const ApproveRefundDialog = ({ open, row, onClose }: ApproveRefundDialogProps) => {
    const caseId = row?.caseId ?? "";
    const { data: refundDetailRes, isLoading: isDetailLoading } = useGetCaseRefundApproveDetail(caseId);
    const { data: refundReasonsRes } = useGetRefundReasons();

    const detail = refundDetailRes?.data as ApproveRefundDetail | undefined;
    const reasonOptions = (refundReasonsRes?.data ?? []) as { id: number; name: string }[];

    const formik = useFormik<ApproveRefundDialogFormValues>({
        initialValues: defaultValues,
        validate: (values) => {
            const errors: FormikErrors<ApproveRefundDialogFormValues> = {};
            if (!values.rejectReasonId) {
                errors.rejectReasonId = "กรุณาเลือกสาเหตุปฎิเสธ";
            }
            return errors;
        },
        onSubmit: (values) => {
            console.log("reject refund", {
                caseId,
                refundNo: row?.refundNo,
                rejectReasonId: values.rejectReasonId,
                note: values.note,
            });
            onClose();
        },
    });

    useEffect(() => {
        if (open) {
            formik.resetForm({ values: defaultValues });
        }
    }, [open, row?.caseId]);

    const handleApproveClick = () => {
        console.log("approve refund", {
            caseId,
            refundNo: row?.refundNo,
        });
        onClose();
    };

    const handleOpenSlip = () => {
        if (row?.refundNo) {
            window.open(`/slip/${row.refundNo}`, "_blank", "noopener,noreferrer");
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { height: "54vh", overflow: "hidden", borderRadius: 3 } }}
        >
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, p: "16px 24px", borderBottom: "1px solid #E0E0E0" }}>
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
                    <SyncAltIcon sx={{ color: "#1565C0", fontSize: 18 }} />
                </Box>
                <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, color: "#212121", flex: 1 }}>
                    อนุมัติคืนเงิน
                </Typography>
                <IconButton
                    size="small"
                    onClick={onClose}
                    sx={{ backgroundColor: "#FDECEC", color: "#E53935", "&:hover": { backgroundColor: "#FBD5D5" } }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ minHeight: 0, display: "flex", flexDirection: "column", justifyContent: "center", pt: "15px", pb: 0 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1, mb: 2 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: "1rem", color: "#0D4C8C" }}>ข้อมูลรายละเอียด</Typography>
                    <Button
                        variant="contained"
                        startIcon={<ImageIcon />}
                        onClick={handleOpenSlip}
                        sx={{ backgroundColor: "#0D4C8C", textTransform: "none", "&:hover": { backgroundColor: "#0A3D70" } }}
                    >
                        คลิกดูภาพ Slip การโอนเงิน
                    </Button>
                </Box>

                {isDetailLoading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={4}>
                                <Typography sx={{ fontSize: "0.75rem", color: "#757575" }}>เลขที่เคลม :</Typography>
                                <Typography sx={{ mt: 0.5, fontWeight: 600, color: "#1565C0" }}>{row?.claimNo ?? "-"}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Typography sx={{ fontSize: "0.75rem", color: "#757575" }}>เลขที่เคส :</Typography>
                                <Typography sx={{ mt: 0.5, fontWeight: 600, color: "#1565C0" }}>{row?.caseNo ?? "-"}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Typography sx={{ fontSize: "0.75rem", color: "#757575" }}>สาขา :</Typography>
                                <Typography sx={{ mt: 0.5, fontWeight: 600, color: "#1565C0" }}>
                                    {row?.branceName ?? "-"}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Typography sx={{ fontSize: "0.75rem", color: "#757575" }}>ชื่อ - สกุล ผู้เอาประกัน :</Typography>
                                <Typography sx={{ mt: 0.5, fontWeight: 600, color: "#1565C0" }}>
                                    {detail?.customerName ?? row?.customerName ?? "-"}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Typography sx={{ fontSize: "0.75rem", color: "#757575" }}>ผู้ทำรายการ :</Typography>
                                <Typography sx={{ mt: 0.5, fontWeight: 600, color: "#1565C0" }}>
                                    {detail?.createdBy ?? "-"}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Typography sx={{ fontSize: "0.75rem", color: "#757575" }}>จำนวนเคลมคืนเงิน :</Typography>
                                <Typography sx={{ mt: 0.5, fontWeight: 600, color: "#1565C0" }}>
                                    {detail?.refundCount ?? "-"}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Typography sx={{ fontSize: "0.75rem", color: "#757575" }}>แจ้งโอน :</Typography>
                                <Typography sx={{ mt: 0.5, fontWeight: 600, color: "#1565C0" }}>
                                    {formatNumber(detail?.remainingAmount)}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Typography sx={{ fontSize: "0.75rem", color: "#757575" }}>โอนคืนรวม :</Typography>
                                <Typography sx={{ mt: 0.5, fontWeight: 600, color: "#1565C0" }}>
                                    {formatNumber(detail?.totalRefundAmount)}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Typography sx={{ fontSize: "0.75rem", color: "#757575" }}>คงเหลือ :</Typography>
                                <Typography sx={{ mt: 0.5, fontWeight: 600, color: "#1565C0" }}>
                                    {formatNumber(
                                        detail?.remainingAmount != null && detail?.totalRefundAmount != null
                                            ? detail.remainingAmount - detail.totalRefundAmount
                                            : undefined
                                    )}
                                </Typography>
                            </Grid>
                        </Grid>
                    </>
                )}

                <Grid container spacing={2} sx={{ mt: 0 }}>
                    <Grid item xs={12} sm={6}>
                        <FormikDropdown
                            name="rejectReasonId"
                            formik={formik}
                            label="สาเหตุที่ปฏิเสธ"
                            data={reasonOptions}
                            valueFieldName="id"
                            displayFieldName="name"
                            fullWidth
                            firstItemText="กรุณาเลือกสาเหตุที่ปฏิเสธ"
                            disableFirstItem
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormikTextField formik={formik} name="note" label="หมายเหตุ" placeholder="หมายเหตุ" fullWidth />
                    </Grid>
                </Grid>

                <Box sx={{ display: "flex", justifyContent: "center", gap: 2, py: 2 }}>
                    <Button variant="outlined" color="error" onClick={() => formik.handleSubmit()}>
                        ปฏิเสธ
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<SyncAltIcon />}
                        onClick={handleApproveClick}
                        sx={{ backgroundColor: "#2E7D32", "&:hover": { backgroundColor: "#1B5E20" } }}
                    >
                        อนุมัติ
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default ApproveRefundDialog;