import { useState } from "react";
import { Box, Button, Grid } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SaveIcon from "@mui/icons-material/Save";
import SaveAsIcon from "@mui/icons-material/SaveAs";
import StepToggleBar from "./SubDetailsTab/StepToggleBar";
import RecordClaimData from "./SubDetailsTab/RecordClaimData";
import {
    CalculateCaseClaim,
    CalculateCaseClaimDtoRequest,
    GetClaimDetailConsiderDtoResponse,
    GetCustomerDetailByIdDtoResponse,
} from "../../../../../api/coreClaimApi.client";
import DocumentScanTable from "../../../../CreatedClaim/components/CreateClaim/DocumentScanTable";
import ConsiderSection from "./SubDetailsTab/ConsiderSection";
import ExpenseDetails from "./SubDetailsTab/ExpenseDetails";
import useClaimDetailActionHook from "../../../hooks/ClaimConsiderDetail/ClaimDetailActionHook";
import useConsiderDetailHook from "../../../hooks/ClaimConsiderDetail/ConsiderDetailHook";
import { FormikProvider } from "formik";
import ClaimSummary from "./SubDetailsTab/ClaimSummary";
import { useAppSelector } from "../../../../../../redux";
import { claimConsiderSelector } from "../../../store/claimConsiderSlice";
import useClaimStepCalculateHook from "../../../hooks/ClaimConsiderDetail/ClaimStepCalculateHook";

type ClaimDetailsTabProps = {
    customerDetail: GetCustomerDetailByIdDtoResponse | undefined;
    detail: GetClaimDetailConsiderDtoResponse | undefined;
};
const ClaimDetailsTab = ({ customerDetail, detail }: ClaimDetailsTabProps) => {
    const steps = [{ label: "บันทึกข้อมูลเคลม" }, { label: "รายละเอียดค่าใช้จ่าย" }, { label: "สรุปรายการเคลม" }];
    const considerDetail = useConsiderDetailHook();
    const {
        formik,
        incidentType,
        incidentTypeLoading,
        coverageType,
        causeOfIncident,
        medicalType,
        incidentTypeMappingLoading,
        decisionReason,
        decisionReasonLoading,
        attachedDocuments,
        setAttachedDocuments,
    } = considerDetail;
    const { handleSaveDraft, handleConfirmConsider } = useClaimDetailActionHook(considerDetail);
    const { filledItems } = useAppSelector(claimConsiderSelector);
    const { activeStep, setActiveStep, furthestStep, isLastStep, isCalculating, handleNext, handleBack } =
        useClaimStepCalculateHook({
            formik,
            customerDetail,
            filledItems,
            stepsLength: steps.length,
        });
    return (
        <>
            <FormikProvider value={formik}>
                <Box>
                    <StepToggleBar
                        steps={steps}
                        activeStep={activeStep}
                        onStepChange={setActiveStep}
                        isStepClickable={(index) => index <= furthestStep}
                    />

                    <Box sx={{ marginTop: "20px" }}>
                        {activeStep === 0 && (
                            <div>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={12} md={12} lg={12}>
                                        <RecordClaimData
                                            incidentType={incidentType}
                                            incidentTypeLoading={incidentTypeLoading}
                                            coverageType={coverageType}
                                            causeOfIncident={causeOfIncident}
                                            medicalType={medicalType}
                                            incidentTypeMappingLoading={incidentTypeMappingLoading}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={12} md={12} lg={12}>
                                        <DocumentScanTable
                                            productTypeId={customerDetail?.productTypeId ?? 0}
                                            Header="สแกนเอกสาร"
                                            aplicationCode={customerDetail?.policyCode ?? ""}
                                            documentType="เอกสารประกอบการพิจารณาเคลม"
                                            onAttachedDocumentsChange={setAttachedDocuments}
                                        />
                                    </Grid>
                                </Grid>
                            </div>
                        )}
                        {activeStep === 1 && (
                            <div>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={12} md={12} lg={12}>
                                        <ExpenseDetails />
                                    </Grid>
                                </Grid>
                            </div>
                        )}
                        {activeStep === 2 && (
                            <div>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={12} md={12} lg={12}>
                                        <ClaimSummary
                                            attachedDocuments={attachedDocuments}
                                            createdClaimDate={detail?.createdDate}
                                        />
                                    </Grid>
                                </Grid>
                            </div>
                        )}
                        <Grid item xs={12} sm={12} md={12} lg={12}>
                            <ConsiderSection
                                productId={customerDetail?.productTypeId}
                                aplicationCode={customerDetail?.policyCode ?? ""}
                                decisionReason={decisionReason}
                                decisionReasonLoading={decisionReasonLoading}
                            />
                        </Grid>
                    </Box>

                    <Grid container justifyContent="space-between" alignItems="center">
                        <Grid item>
                            <Button
                                variant="outlined"
                                startIcon={<ArrowBackIcon />}
                                onClick={handleBack}
                                disabled={activeStep === 0}
                            >
                                กลับ
                            </Button>
                        </Grid>

                        <Grid item>
                            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", justifyContent: "flex-end" }}>
                                {!isLastStep && (
                                    <>
                                        <Button variant="outlined" startIcon={<SaveAsIcon />} onClick={handleSaveDraft}>
                                            บันทึกแบบร่าง
                                        </Button>

                                        <Button
                                            variant="contained"
                                            startIcon={<SaveIcon />}
                                            onClick={handleConfirmConsider}
                                            sx={{
                                                bgcolor: "#2E7D32",
                                                "&:hover": { bgcolor: "#1B5E20" },
                                            }}
                                        >
                                            ยืนยันบันทึกผลพิจารณา
                                        </Button>
                                        <Button
                                            variant="contained"
                                            endIcon={<ArrowForwardIcon />}
                                            onClick={handleNext}
                                            disabled={activeStep === 1 && isCalculating}
                                        >
                                            ถัดไป
                                        </Button>
                                    </>
                                )}

                                {isLastStep && (
                                    <Button
                                        variant="contained"
                                        startIcon={<CheckCircleIcon />}
                                        sx={{
                                            bgcolor: "#2E7D32",
                                            "&:hover": { bgcolor: "#1B5E20" },
                                        }}
                                        onClick={handleConfirmConsider}
                                    >
                                        อนุมัติ
                                    </Button>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </FormikProvider>
        </>
    );
};

export default ClaimDetailsTab;
