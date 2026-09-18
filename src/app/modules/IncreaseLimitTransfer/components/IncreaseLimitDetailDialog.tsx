import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    Typography,
} from "@mui/material";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionIcon from "@mui/icons-material/Description";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { FormikErrors, useFormik } from "formik";
import { useEffect } from "react";
import { FormikDropdown, swalError, swalSuccess } from "../../_common";
import { swalConfirmAction } from "../../_common/customSweetAlert";
import { useGetIncreaseTransferLimitDetail, useUpdateIncreaseTransferLimitStatus } from "../increaseLimitTransferAPI";
import type {
    IncreaseTransferLimitDetailDto,
    UpdateIncreaseTransferLimitStatusDtoServiceResponse,
} from "../increaseLimitTransferAPI";
import { IncreaseTransferMonitorRow } from "../hooks/ClaimDetailsDataTableHook";

type IncreaseLimitDetailDialogProps = {
    open: boolean;
    row: IncreaseTransferMonitorRow | null;
    onClose: () => void;
};

type IncreaseLimitDetailDialogFormValues = {
    rejectReasonCode: string | undefined;
};

const defaultValues: IncreaseLimitDetailDialogFormValues = {
    rejectReasonCode: undefined,
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
    const caseId = row?.caseId ?? "";
    const { data: detailRes, isLoading: isDetailLoading } = useGetIncreaseTransferLimitDetail(caseId);

    const detail = detailRes?.data as IncreaseTransferLimitDetailDto | undefined;
    const claimId = detail?.claimId ?? "";
    const rejectReasonOptions = (detail?.rejectReasons ?? []) as { code: string; name: string }[];

    const handleUpdateStatusSuccess = (response: UpdateIncreaseTransferLimitStatusDtoServiceResponse) => {
        swalSuccess(response.data?.message ?? "ทำรายการสำเร็จ", "ระบบบันทึกการทำรายการเรียบร้อยแล้ว");
        onClose();
    };

    const handleUpdateStatusError = (error: string) => {
        swalError("แจ้งเตือน", error);
    };

    const { mutate: updateStatusMutate, isLoading: isUpdatingStatus } = useUpdateIncreaseTransferLimitStatus(
        handleUpdateStatusSuccess,
        handleUpdateStatusError
    );

    const formik = useFormik<IncreaseLimitDetailDialogFormValues>({
        initialValues: defaultValues,
        validate: (values) => {
            const errors: FormikErrors<IncreaseLimitDetailDialogFormValues> = {};
            if (!values.rejectReasonCode) {
                errors.rejectReasonCode = "กรุณาเลือกสาเหตุการปฏิเสธ";
            }
            return errors;
        },
        onSubmit: (values) => {
            updateStatusMutate({
                caseId,
                claimId,
                increaseTransferLimitStatusId: 4,
                // draft: backend ยังไม่มี field rejectReasonsId — map จาก rejectReasonCode ชั่วคราว
                rejectReasonsId: values.rejectReasonCode,
            });
        },
    });

    useEffect(() => {
        if (open) {
            formik.resetForm({ values: defaultValues });
        }
    }, [open, row?.caseId]);

    const handleApproveClick = async () => {
        const result = await swalConfirmAction({
            title: "ยืนยันอนุมัติขยายวงเงิน?",
            text: "เมื่ออนุมัติ ระบบจะเพิ่มวงเงินและดำเนินการโอนเงินทันที",
            confirmButtonText: "ยืนยัน",
            cancelButtonText: "ยกเลิก",
        });
        if (result.isConfirmed) {
            updateStatusMutate({
                caseId,
                claimId,
                increaseTransferLimitStatusId: 3,
            });
        }
    };

    const handleRejectClick = async () => {
        const errors = await formik.validateForm();
        if (errors.rejectReasonCode) {
            formik.handleSubmit();
            return;
        }
        const result = await swalConfirmAction({
            title: "ยืนยันปฏิเสธการขยายวงเงิน?",
            text: "ต้องการปฏิเสธการขยายวงเงินหรือไม่",
            confirmButtonText: "ยืนยัน",
            cancelButtonText: "ยกเลิก",
        });
        if (result.isConfirmed) {
            formik.handleSubmit();
        }
    };

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
                    disabled={isUpdatingStatus}
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
                                        <Typography sx={{ fontSize: "0.8rem", color: "#757575" }}>เลข CL :</Typography>
                                        <Typography sx={{ mt: 0.5, fontWeight: 600, color: "#1565C0" }}>
                                            {detail?.claimNo ?? row?.claimNo ?? "-"}
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
                                            {detail?.insuredName ?? "-"}
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
                                            {formatBaht(detail?.amount)}
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
                                            {formatNumber(detail?.currentLimitAmount)}
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
                                            {formatNumber(detail?.usedLimitAmount)}
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
                                        {formatBaht(detail?.remainingLimitAmount)}
                                    </Typography>
                                </Box>
                            </Box>

                            <Grid container spacing={2} sx={{ mt: 2 }}>
                                <Grid item xs={6}>
                                    <Typography sx={{ fontSize: "0.85rem", color: "#5F6773", mb: 0.5 }}>
                                        วงเงินที่ขอเพิ่ม{" "}
                                        <Box component="span" sx={{ color: "#D62828" }}>
                                            *
                                        </Box>
                                    </Typography>
                                    <Box
                                        sx={{
                                            p: "10px 14px",
                                            borderRadius: 1.5,
                                            border: "1px solid #D9DEE5",
                                            backgroundColor: "#FAFBFD",
                                            fontWeight: 700,
                                            fontSize: "1rem",
                                            color: "#212121",
                                        }}
                                    >
                                        {formatBaht(detail?.requestedIncreaseAmount)}
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography
                                        sx={{
                                            fontSize: "0.65rem",
                                            color: "#5F6773",
                                            mb: 0.5,
                                            visibility: "hidden",
                                        }}
                                    >
                                        วงเงินที่ขอเพิ่ม{" "}
                                        <Box component="span" sx={{ color: "#D62828" }}>
                                            *
                                        </Box>
                                    </Typography>
                                    <FormikDropdown
                                        name="rejectReasonCode"
                                        formik={formik}
                                        label="สาเหตุการปฏิเสธ"
                                        data={rejectReasonOptions}
                                        valueFieldName="code"
                                        displayFieldName="name"
                                        fullWidth
                                        firstItemText="กรุณาเลือกสาเหตุการปฏิเสธ"
                                        disableFirstItem
                                        required
                                        disabled={isDetailLoading || !caseId}
                                    />
                                </Grid>
                            </Grid>

                            <Box sx={{ mt: 2, p: "10px 14px", borderRadius: 2, backgroundColor: "#E6F4EA" }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography sx={{ fontSize: "0.9rem", color: "#137333" }}>
                                        วงเงินคงเหลือ (ครั้งใหม่) :
                                    </Typography>
                                    <Typography sx={{ fontWeight: 700, color: "#137333" }}>
                                        {formatBaht(detail?.newRemainingLimitAmount)}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, py: 2 }}>
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={handleRejectClick}
                                disabled={
                                    isDetailLoading || !caseId || !formik.values.rejectReasonCode || isUpdatingStatus
                                }
                            >
                                ปฏิเสธ
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<AutorenewIcon />}
                                onClick={handleApproveClick}
                                disabled={isDetailLoading || !caseId || isUpdatingStatus}
                                sx={{ backgroundColor: "#2E7D32", "&:hover": { backgroundColor: "#1B5E20" } }}
                            >
                                อนุมัติ
                            </Button>
                        </Box>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default IncreaseLimitDetailDialog;
