import { Box, Button, CircularProgress, Dialog, DialogContent, DialogTitle, Grid, IconButton, Typography } from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import CloseIcon from "@mui/icons-material/Close";
import { FormikErrors, useFormik } from "formik";
import { useEffect, useState } from "react";
import { FormikDropdown, FormikTextField, swalError, swalSuccess, swalWarning } from "../../_common";
import { swalConfirmAction } from "../../_common/customSweetAlert";
import {
    useCaseRefundApproveUpdateStatus,
    useGetCaseRefundApproveDetail,
    useGetCaseRefundRejectReasons,
} from "../../Refund/refundAPI";
import { RefundApproveMonitorRow } from "../hooks/RefundApproveDataTableHook";

type ApproveRefundDialogProps = {
    open: boolean;
    row: RefundApproveMonitorRow | null;
    onClose: () => void;
    mode?: "approve" | "view";
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
    caseRefundId?: string;
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

const ApproveRefundDialog = ({ open, row, onClose, mode = "approve" }: ApproveRefundDialogProps) => {
    const caseId = row?.caseId ?? "";
    const { data: refundDetailRes, isLoading: isDetailLoading } = useGetCaseRefundApproveDetail(caseId);
    const { data: refundReasonsRes } = useGetCaseRefundRejectReasons();
    const [openSlipDialog, setOpenSlipDialog] = useState(false);
    const [slipFileUrl, setSlipFileUrl] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isPdfSlip = slipFileUrl.toLowerCase().endsWith(".pdf");
    const slipSrc = isPdfSlip ? `${slipFileUrl}#zoom=50` : slipFileUrl;

    const detail = refundDetailRes?.data as ApproveRefundDetail | undefined;
    const caseRefundId = detail?.caseRefundId ?? caseId;
    const reasonOptions = (refundReasonsRes?.data ?? []) as { id: number; name: string }[];

    const handleUpdateStatusSuccess = () => {
        setIsSubmitting(false);
        swalSuccess("ทำรายการสำเร็จ", "ทำรายการสำเร็จ");
        onClose();
    };

    const handleUpdateStatusError = (error: string) => {
        setIsSubmitting(false);
        swalError("แจ้งเตือน", error);
    };

    const handleUpdateStatusWarning = (error: string) => {
        setIsSubmitting(false);
        swalWarning("แจ้งเตือน", error);
    };

    const { mutate: updateStatusMutate } = useCaseRefundApproveUpdateStatus(
        handleUpdateStatusSuccess,
        handleUpdateStatusError,
        handleUpdateStatusWarning
    );

    const formik = useFormik<ApproveRefundDialogFormValues>({
        initialValues: defaultValues,
        validate: (values) => {
            const errors: FormikErrors<ApproveRefundDialogFormValues> = {};
            if (!values.rejectReasonId) {
                errors.rejectReasonId = "กรุณาเลือกสาเหตุปฏิเสธ";
            }
            return errors;
        },
        onSubmit: (values) => {
            setIsSubmitting(true);
            updateStatusMutate({
                caseRefundId,
                caseRefundStatusId: 4,
                caseRefundRejectReasonId: values.rejectReasonId,
                caseRefundRejectReasonRemark: values.note,
            });
        },
    });

    useEffect(() => {
        if (open) {
            formik.resetForm({ values: defaultValues });
        }
    }, [open, row?.caseId]);

    const handleApproveClick = async () => {
        formik.setFieldError("rejectReasonId", undefined);
        formik.setFieldTouched("rejectReasonId", false);
        const result = await swalConfirmAction({
            title: "ยืนยันการอนุมัติคืนเงิน?",
            text: "ต้องการอนุมัติการคืนเงินหรือไม่",
            confirmButtonText: "ยืนยัน",
            cancelButtonText: "ยกเลิก",
        });
        if (result.isConfirmed) {
            setIsSubmitting(true);
            updateStatusMutate({
                caseRefundId,
                caseRefundStatusId: 3,
            });
        }
    };

    const handleOpenSlip = () => {
        if (row?.refundNo) {
            setSlipFileUrl("https://docstorage.uatsiamsmile.com/files/2026/9/18/DOCST202691809034424712.pdf");
            setOpenSlipDialog(true);
        }
    };

    const handleRejectClick = async () => {
        const errors = await formik.validateForm();
        if (errors.rejectReasonId) {
            formik.handleSubmit();
            return;
        }
        const result = await swalConfirmAction({
            title: "ยืนยันปฏิเสธการโอนคืน?",
            text: "ต้องการปฏิเสธการโอนคืนหรือไม่",
            confirmButtonText: "ยืนยัน",
            cancelButtonText: "ยกเลิก",
        });
        if (result.isConfirmed) {
            formik.handleSubmit();
        }
    };

    return (
        <>
            <Dialog
                open={open}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        height: mode === "view" ? {xs: "50vh"} : { xs: "90vh", md: "65vh" },
                        overflow: "hidden",
                        borderRadius: 3,
                    },
                }}
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
                    disabled={isSubmitting}
                    sx={{ backgroundColor: "#FDECEC", color: "#E53935", "&:hover": { backgroundColor: "#FBD5D5" } }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>

            <DialogContent
                sx={{
                    minHeight: 0,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: mode === "view" ? "flex-start" : { xs: "flex-start", md: "center" },
                    pt: "15px",
                    pb: 0,
                }}
            >
                <Box sx={{ display: "flex", justifyContent: "flex-end", flexWrap: "wrap", gap: 1, mb: 1, mt: 2 }}>
                    <Button
                        variant="contained"
                        startIcon={<ImageIcon />}
                        onClick={handleOpenSlip}
                        disabled={isSubmitting}
                        sx={{ backgroundColor: "#0D4C8C", textTransform: "none", "&:hover": { backgroundColor: "#0A3D70" } }}
                    >
                        คลิกดูภาพ Slip การโอนเงิน
                    </Button>
                </Box>
                <Box sx={{ border: "1px solid #D9DEE5", borderRadius: 2, p: 2, mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: "1rem", color: "#0D4C8C" }}>ข้อมูลรายละเอียด</Typography>
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
                            {mode === "approve" && (
                                <Grid item xs={12} sm={6} md={4}>
                                    <Typography sx={{ fontSize: "0.75rem", color: "#757575" }}>แจ้งโอน :</Typography>
                                    <Typography sx={{ mt: 0.5, fontWeight: 600, color: "#1565C0" }}>
                                        {formatNumber(detail?.remainingAmount)}
                                    </Typography>
                                </Grid>
                            )}
                            <Grid item xs={12} sm={6} md={4}>
                                <Typography sx={{ fontSize: "0.75rem", color: "#757575" }}>โอนคืนรวม :</Typography>
                                <Typography sx={{ mt: 0.5, fontWeight: 600, color: "#1565C0" }}>
                                    {formatNumber(detail?.totalRefundAmount)}
                                </Typography>
                            </Grid>
                            {mode === "approve" && (
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
                            )}
                        </Grid>
                    </>
                )}
                </Box>

                {mode === "approve" && (
                    <Box sx={{ border: "1px solid #D9DEE5", borderRadius: 2, p: 2, mt: 2, mb: 0 }}>
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

                        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, pt: 2, pb: 0 }}>
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={handleRejectClick}
                                disabled={isSubmitting || isDetailLoading || !caseRefundId}
                            >
                                ปฏิเสธ
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<SyncAltIcon />}
                                onClick={handleApproveClick}
                                disabled={isSubmitting || isDetailLoading || !caseRefundId}
                                sx={{ backgroundColor: "#2E7D32", "&:hover": { backgroundColor: "#1B5E20" } }}
                            >
                                อนุมัติ
                            </Button>
                        </Box>
                    </Box>
                )}

                {mode === "view" && (
                    <Box sx={{ display: "flex", justifyContent: "center", pt: 2, pb: 0 }}>
                        <Button
                            variant="contained"
                            onClick={onClose}
                            sx={{ px: 6, backgroundColor: "#0D4C8C", textTransform: "none", "&:hover": { backgroundColor: "#0A3D70" } }}
                        >
                            ตกลง
                        </Button>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
<Dialog
            open={openSlipDialog}
            onClose={() => setOpenSlipDialog(false)}
sx={{ zIndex: 1400 }}
            PaperProps={{ sx: { m: 0, borderRadius: 3, width: "fit-content", maxWidth: "94vw", maxHeight: "90vh" } }}
        >
            <DialogTitle sx={{ fontSize: "1.1rem", fontWeight: 700, color: "#212121", pb: 1, textAlign: "center" }}>
                Slip การโอนเงิน
            </DialogTitle>
            <DialogContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, px: 3, pb: 3 }}>
                <Box
                    sx={{
                        border: "1px solid #E0E0E0",
                        borderRadius: 2,
                        p: 2,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 1,
                        color: "#9E9E9E",
                        ...(isPdfSlip
                            ? { width: "min(84vw, 840px)", height: "min(78vh, 950px)", overflow: "auto" }
                            : { maxWidth: "84vw", maxHeight: "78vh", overflow: "hidden" }),
                    }}
                >
                    {isPdfSlip ? (
                        <Box component="iframe" src={slipSrc} title="Slip การโอนเงิน" sx={{ width: "100%", flex: 1, border: "none" }} />
                    ) : (
                        <Box
                            component="img"
                            src={slipFileUrl}
                            alt="Slip การโอนเงิน"
                            sx={{ maxWidth: "100%", maxHeight: "100%", width: "auto", height: "auto" }}
                        />
                    )}
                </Box>
                <Button
                    variant="contained"
                    onClick={() => setOpenSlipDialog(false)}
                    sx={{ mt: 1, px: 6, backgroundColor: "#0D4C8C", textTransform: "none", "&:hover": { backgroundColor: "#0A3D70" } }}
                >
                    ตกลง
                </Button>
            </DialogContent>
        </Dialog>
        </>
    );
};

export default ApproveRefundDialog;