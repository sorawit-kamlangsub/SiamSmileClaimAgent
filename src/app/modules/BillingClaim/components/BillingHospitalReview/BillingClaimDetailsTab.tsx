import { useState } from "react";
import { Box, Button, Grid } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SaveIcon from "@mui/icons-material/Save";
import { FormikProvider } from "formik";
import { useNavigate } from "react-router-dom";

import StepToggleBar from "../../../ClaimConsider/components/ConsiderDetails/TabDetails/SubDetailsTab/StepToggleBar";
import { LoadingPlaceHolder } from "../../../_common";
import useBillingReviewDetailHook from "../../hooks/BillingHospitalReview/BillingReviewDetailHook";
import useBillingExpenseHook from "../../hooks/BillingHospitalReview/BillingExpenseHook";
import useBillingProductVariant from "../../hooks/BillingHospitalReview/BillingProductVariantHook";
import BillingContinuousClaimSection from "./SubDetailsTab/BillingContinuousClaimSection";
import BillingClaimInfoSection from "./SubDetailsTab/BillingClaimInfoSection";
import BillingTreatmentSection from "./SubDetailsTab/BillingTreatmentSection";
import BillingAttendingDoctorSection from "./SubDetailsTab/BillingAttendingDoctorSection";
import BillingDocumentTable from "./SubDetailsTab/BillingDocumentTable";
import BillingOcrReceiptViewer from "./SubDetailsTab/BillingOcrReceiptViewer";
import BillingHospitalExpenseSummary from "./SubDetailsTab/BillingHospitalExpenseSummary";
import BillingExpenseTable from "./SubDetailsTab/BillingExpenseTable";
import BillingExpenseSummaryCard from "./SubDetailsTab/BillingExpenseSummaryCard";
import BillingSummaryStep3 from "./SubDetailsTab/BillingSummaryStep3";
import BillingReviewResultSection from "./SubDetailsTab/BillingReviewResultSection";

const steps = [{ label: "บันทึกข้อมูลเคลม" }, { label: "รายละเอียดค่าใช้จ่าย" }, { label: "สรุปรายการเคลม" }];

type BillingClaimDetailsTabProps = {
    /** โหมดดูอย่างเดียว : ใช้ตอนเปิดจากปุ่ม "ดูรายละเอียด" ในหน้า Monitor */
    readOnly?: boolean;
};

/**
 * Tab "ข้อมูลเคลม" ของหน้าตรวจสอบรายการวางบิลโรงพยาบาล — flow 3 Step ต่อ API จริง
 * (Step 1 บันทึกข้อมูลเคลม · Step 2 รายละเอียดค่าใช้จ่าย · Step 3 สรุปรายการเคลม)
 *
 * สเปค : Step 1 กับ Step 2 เป็น Read-only ล้วน (ข้อมูลจาก SmileConnect) มีแค่ตรวจสอบเอกสาร + บล็อก
 * "แจ้งผลการพิจารณาโรงพยาบาล" ที่แก้ได้ — บล็อกนี้อยู่ทั้ง Step 1 และ Step 2 (ไม่ใช่แค่ Step สุดท้าย)
 * ส่วนปุ่ม "อนุมัติ" เป็นปุ่มเฉพาะของ Step 3 เท่านั้น (คนละบล็อกกับ "แจ้งผลการพิจารณาโรงพยาบาล")
 */
const BillingClaimDetailsTab = ({ readOnly = false }: BillingClaimDetailsTabProps) => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [furthestStep, setFurthestStep] = useState(0);

    const {
        formik,
        detail,
        detailLoading,
        isReadOnly,
        isSubmitting,
        reviewReason,
        reviewReasonLoading,
        canSubmitReview,
        validateStep1Documents,
        confirmStep2Amount,
        handleSubmitReviewResult,
        handleApprove,
    } = useBillingReviewDetailHook(readOnly);
    const expenseTotals = useBillingExpenseHook(formik);
    const variant = useBillingProductVariant(formik.values.medicalTypeId);

    const isLastStep = activeStep === steps.length - 1;

    const goToStep = (next: number) => {
        setActiveStep(next);
        setFurthestStep((prev) => Math.max(prev, next));
    };

    const handleBack = () => setActiveStep((prev) => Math.max(prev - 1, 0));

    const handleNext = async () => {
        if (activeStep === 0) {
            if (!validateStep1Documents()) return;
            goToStep(1);
            return;
        }
        if (activeStep === 1) {
            const ok = await confirmStep2Amount(expenseTotals.totalClaimedAmount);
            if (!ok) return;
            goToStep(2);
        }
    };

    /** ปุ่ม "ยืนยันบันทึกผลพิจารณา" (Step 1, 2) — ส่งค่าที่เลือกในบล็อก "แจ้งผลการพิจารณาโรงพยาบาล" แล้วกลับ Monitor */
    const handleSubmitReview = async () => {
        const ok = await handleSubmitReviewResult();
        if (ok) navigate("/billing/hospital");
    };

    /** ปุ่ม "อนุมัติ" (Step 3) */
    const handleApproveClick = async () => {
        const ok = await handleApprove();
        if (ok) navigate("/billing/hospital");
    };

    const submittedDate = detail?.submittedDate?.toString();

    return (
        <LoadingPlaceHolder
            isLoading={detailLoading}
            isEmpty={!detailLoading && !detail}
            emptyMessage="ไม่พบรายการวางบิลนี้"
        >
            <FormikProvider value={formik}>
                <Box>
                    <StepToggleBar
                        steps={steps}
                        activeStep={activeStep}
                        onStepChange={setActiveStep}
                        // โหมดดูอย่างเดียว (readOnly): ปุ่ม "ถัดไป" ถูกซ่อน furthestStep จึงค้างที่ 0 เสมอ —
                        // เปิดให้กดข้าม step ได้อิสระ ไม่งั้นผู้ดูจะไปดู Step 2/3 ไม่ได้เลย
                        isStepClickable={(index) => isReadOnly || index <= furthestStep}
                    />

                    <Box sx={{ marginTop: "20px" }}>
                        {activeStep === 0 ? (
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <BillingContinuousClaimSection
                                        applicationId={detail?.insured?.applicationId}
                                        readOnly={isReadOnly}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <BillingClaimInfoSection
                                        hospitalName={detail?.hospitalName}
                                        submittedDate={submittedDate}
                                        showStayDays={variant.isIpdLike}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <BillingTreatmentSection showIpdFields={variant.isIpdLike} />
                                </Grid>
                                <Grid item xs={12}>
                                    <BillingAttendingDoctorSection />
                                </Grid>
                                <Grid item xs={12}>
                                    <BillingDocumentTable
                                        requiredDocumentSubTypeIds={detail?.requiredDocumentSubTypeIds ?? []}
                                        readOnly={isReadOnly}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <BillingReviewResultSection
                                        readOnly={isReadOnly}
                                        reviewReason={reviewReason}
                                        reviewReasonLoading={reviewReasonLoading}
                                    />
                                </Grid>
                            </Grid>
                        ) : activeStep === 1 ? (
                            <Grid container spacing={2}>
                                {variant.hasOcrSection && (
                                    <Grid item xs={12}>
                                        <BillingOcrReceiptViewer />
                                    </Grid>
                                )}
                                {variant.hasHospitalExpenseSummary && (
                                    <Grid item xs={12}>
                                        <BillingHospitalExpenseSummary
                                            originalBilledAmount={detail?.originalBilledAmount}
                                        />
                                    </Grid>
                                )}
                                <Grid item xs={12}>
                                    <BillingExpenseTable showSimBSelector={variant.hasSimBSelector} />
                                </Grid>
                                <Grid item xs={12}>
                                    <BillingExpenseSummaryCard
                                        totalClaimedAmount={expenseTotals.totalClaimedAmount}
                                        totalDiscountAmount={expenseTotals.totalDiscountAmount}
                                        totalNonCoveredAmount={expenseTotals.totalNonCoveredAmount}
                                        netAmount={expenseTotals.netAmount}
                                        transferAmount={expenseTotals.transferAmount}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <BillingReviewResultSection
                                        readOnly={isReadOnly}
                                        reviewReason={reviewReason}
                                        reviewReasonLoading={reviewReasonLoading}
                                    />
                                </Grid>
                            </Grid>
                        ) : (
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <BillingSummaryStep3
                                        hospitalName={detail?.hospitalName}
                                        submittedDate={submittedDate}
                                        showStayDays={variant.isIpdLike}
                                        allowSeparateCompensation={variant.allowSeparateCompensation}
                                    />
                                </Grid>
                            </Grid>
                        )}
                    </Box>

                    <Grid container justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
                        <Grid item>
                            <Button
                                variant="outlined"
                                startIcon={<ArrowBackIcon />}
                                onClick={activeStep === 0 ? () => navigate(-1) : handleBack}
                            >
                                กลับ
                            </Button>
                        </Grid>

                        <Grid item>
                            <Box
                                sx={{
                                    display: isReadOnly ? "none" : "flex",
                                    gap: 1.5,
                                    flexWrap: "wrap",
                                    justifyContent: "flex-end",
                                }}
                            >
                                {!isLastStep && (
                                    <>
                                        <Button
                                            variant="outlined"
                                            startIcon={<SaveIcon />}
                                            disabled={!canSubmitReview || isSubmitting}
                                            onClick={handleSubmitReview}
                                        >
                                            {isSubmitting ? "กำลังบันทึก..." : "ยืนยันบันทึกผลพิจารณา"}
                                        </Button>
                                        <Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={handleNext}>
                                            ถัดไป
                                        </Button>
                                    </>
                                )}

                                {isLastStep && (
                                    <Button
                                        variant="contained"
                                        startIcon={<CheckCircleIcon />}
                                        disabled={isSubmitting}
                                        onClick={handleApproveClick}
                                        sx={{ bgcolor: "#2E7D32", "&:hover": { bgcolor: "#1B5E20" } }}
                                    >
                                        {isSubmitting ? "กำลังบันทึก..." : "อนุมัติ"}
                                    </Button>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </FormikProvider>
        </LoadingPlaceHolder>
    );
};

export default BillingClaimDetailsTab;
