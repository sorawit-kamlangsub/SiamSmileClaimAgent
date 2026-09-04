import { useState } from "react";
import { Box, Button, Grid } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { FormikProvider } from "formik";
import { useNavigate } from "react-router-dom";

import StepToggleBar from "../../../ClaimConsider/components/ConsiderDetails/TabDetails/SubDetailsTab/StepToggleBar";
import { LoadingPlaceHolder } from "../../../_common";
import useBillingReviewDetailHook from "../../hooks/BillingHospitalReview/BillingReviewDetailHook";
import useBillingExpenseHook from "../../hooks/BillingHospitalReview/BillingExpenseHook";
import BillingClaimInfoSection from "./SubDetailsTab/BillingClaimInfoSection";
import BillingTreatmentSection from "./SubDetailsTab/BillingTreatmentSection";
import BillingAttendingDoctorSection from "./SubDetailsTab/BillingAttendingDoctorSection";
import BillingDocumentTable from "./SubDetailsTab/BillingDocumentTable";
import BillingExpenseTable from "./SubDetailsTab/BillingExpenseTable";
import BillTailDiscountCard from "./SubDetailsTab/BillTailDiscountCard";
import BillingSummaryStep3 from "./SubDetailsTab/BillingSummaryStep3";
import BillingReviewResultSection from "./SubDetailsTab/BillingReviewResultSection";

const steps = [{ label: "บันทึกข้อมูลเคลม" }, { label: "รายละเอียดค่าใช้จ่าย" }, { label: "สรุปรายการเคลม" }];

type BillingClaimDetailsTabProps = {
    /** โหมดดูอย่างเดียว : ใช้ตอนเปิดจากปุ่ม "ดูรายละเอียด" ในหน้า Monitor */
    readOnly?: boolean;
};

/**
 * Tab "ข้อมูลเคลม" ของหน้าตรวจสอบรายการวางบิลโรงพยาบาล — flow 3 Step ต่อ API จริง
 * (Step 1 บันทึกข้อมูลเคลม · Step 2 รายละเอียดค่าใช้จ่าย · Step 3 สรุปรายการเคลม + ยืนยันผลตรวจสอบ)
 */
const BillingClaimDetailsTab = ({ readOnly = false }: BillingClaimDetailsTabProps) => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [furthestStep, setFurthestStep] = useState(0);

    const { formik, detail, detailLoading, isReadOnly, isSubmitting, handleConfirmReview } =
        useBillingReviewDetailHook(readOnly);
    const expenseTotals = useBillingExpenseHook(formik);

    const isLastStep = activeStep === steps.length - 1;

    const handleNext = () => {
        const next = Math.min(activeStep + 1, steps.length - 1);
        setActiveStep(next);
        setFurthestStep((prev) => Math.max(prev, next));
    };

    const handleBack = () => setActiveStep((prev) => Math.max(prev - 1, 0));

    const handleSubmitReview = async () => {
        const ok = await handleConfirmReview({
            totalClaimedAmount: expenseTotals.totalClaimedAmount,
            hasUncoveredWithoutReason: expenseTotals.hasUncoveredWithoutReason,
            hasDiscountExceedsClaim: expenseTotals.hasDiscountExceedsClaim,
        });
        if (ok) navigate("/billing/hospital");
    };

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
                        isStepClickable={(index) => index <= furthestStep}
                    />

                    <Box sx={{ marginTop: "20px" }}>
                        {activeStep === 0 ? (
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <BillingClaimInfoSection readOnly={isReadOnly} />
                                </Grid>
                                <Grid item xs={12}>
                                    <BillingTreatmentSection readOnly={isReadOnly} />
                                </Grid>
                                <Grid item xs={12}>
                                    <BillingAttendingDoctorSection readOnly={isReadOnly} />
                                </Grid>
                                <Grid item xs={12}>
                                    <BillingDocumentTable
                                        requiredDocumentSubTypeIds={detail?.requiredDocumentSubTypeIds ?? []}
                                        readOnly={isReadOnly}
                                    />
                                </Grid>
                            </Grid>
                        ) : activeStep === 1 ? (
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <BillingExpenseTable readOnly={isReadOnly} />
                                </Grid>
                                <Grid item xs={12}>
                                    <BillTailDiscountCard
                                        totalClaimedAmount={expenseTotals.totalClaimedAmount}
                                        netBillableAmount={expenseTotals.netBillableAmount}
                                        readOnly={isReadOnly}
                                    />
                                </Grid>
                            </Grid>
                        ) : (
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <BillingSummaryStep3
                                        claimCode={detail?.claimCode}
                                        hospitalName={detail?.hospitalName}
                                        claimType={detail?.claimType}
                                        billingAmount={detail?.originalBilledAmount ?? 0}
                                        totalClaimedAmount={expenseTotals.totalClaimedAmount}
                                        totalDiscountAmount={expenseTotals.totalDiscountAmount}
                                        totalNonCoveredAmount={expenseTotals.totalNonCoveredAmount}
                                        netBillableAmount={expenseTotals.netBillableAmount}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <BillingReviewResultSection readOnly={isReadOnly} />
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
                                    <Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={handleNext}>
                                        ถัดไป
                                    </Button>
                                )}

                                {isLastStep && (
                                    <Button
                                        variant="contained"
                                        startIcon={<CheckCircleIcon />}
                                        disabled={!formik.values.reviewStatusId || isSubmitting}
                                        onClick={handleSubmitReview}
                                        sx={{ bgcolor: "#2E7D32", "&:hover": { bgcolor: "#1B5E20" } }}
                                    >
                                        {isSubmitting ? "กำลังบันทึก..." : "ยืนยันผลตรวจสอบ"}
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
