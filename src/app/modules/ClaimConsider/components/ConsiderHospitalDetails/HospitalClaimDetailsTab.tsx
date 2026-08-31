import { useState } from "react";
import { Box, Button, Grid, Paper } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SaveIcon from "@mui/icons-material/Save";
import SaveAsIcon from "@mui/icons-material/SaveAs";
import { FormikProvider } from "formik";
import { useNavigate } from "react-router-dom";

import StepToggleBar from "../ConsiderDetails/TabDetails/SubDetailsTab/StepToggleBar";
import RecordClaimData from "../ConsiderDetails/TabDetails/SubDetailsTab/RecordClaimData";
import ConsiderSection from "../ConsiderDetails/TabDetails/SubDetailsTab/ConsiderSection";
import { EMPTY_STATE_SX } from "../../../CreatedClaim/components/CreateClaim/ClaimPH/ClaimFormSection";
import { swalSuccess } from "../../../_common/sweetAlert";
import useHospitalConsiderDetailHook from "../../hooks/ClaimConsiderHospital/HospitalConsiderDetailHook";
import { MOCK_HOSPITAL_CLAIM } from "./mock/hospitalConsiderMock";
import ContinuousClaimSection from "./SubDetailsTab/ContinuousClaimSection";
import TreatmentInfoSection from "./SubDetailsTab/TreatmentInfoSection";
import AttendingDoctorSection from "./SubDetailsTab/AttendingDoctorSection";
import DocumentVerifyTable from "./SubDetailsTab/DocumentVerifyTable";

const steps = [{ label: "บันทึกข้อมูลเคลม" }, { label: "รายละเอียดค่าใช้จ่าย" }, { label: "สรุปรายการเคลม" }];

/**
 * Tab "ข้อมูลการเคลม" ของหน้าพิจารณาเคลมโรงพยาบาล (OPD Half)
 *
 * ตอนนี้ทำเฉพาะ Step 1 : บันทึกข้อมูลเคลม (Mock UI)
 * Step 2-3 ยังไม่ได้พัฒนา
 */
const HospitalClaimDetailsTab = () => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [furthestStep, setFurthestStep] = useState(0);

    const {
        formik,
        claimListTypeConfig,
        incidentType,
        coverageType,
        medicalType,
        causeOfIncident,
        decisionReason,
        continuousClaimRows,
        continuousClaimOpen,
        setContinuousClaimOpen,
        handleToggleContinuousClaim,
        handleSelectContinuousClaim,
        handleClearContinuousClaim,
        handleDocumentCheckChange,
    } = useHospitalConsiderDetailHook();

    const handleNext = () => {
        const next = Math.min(activeStep + 1, steps.length - 1);
        setActiveStep(next);
        setFurthestStep((prev) => Math.max(prev, next));
    };

    const handleBack = () => {
        if (activeStep === 0) return;
        setActiveStep((prev) => Math.max(prev - 1, 0));
    };

    return (
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
                                <ContinuousClaimSection
                                    rows={continuousClaimRows}
                                    open={continuousClaimOpen}
                                    onOpenChange={setContinuousClaimOpen}
                                    onToggle={handleToggleContinuousClaim}
                                    onSelect={handleSelectContinuousClaim}
                                    onClear={handleClearContinuousClaim}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <RecordClaimData
                                    incidentType={incidentType}
                                    incidentTypeLoading={false}
                                    coverageType={coverageType}
                                    causeOfIncident={causeOfIncident}
                                    medicalType={medicalType}
                                    incidentTypeMappingLoading={false}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TreatmentInfoSection />
                            </Grid>
                            <Grid item xs={12}>
                                <AttendingDoctorSection />
                            </Grid>
                            <Grid item xs={12}>
                                <DocumentVerifyTable onChange={handleDocumentCheckChange} />
                            </Grid>
                            <Grid item xs={12}>
                                <ConsiderSection
                                    productId={6}
                                    aplicationCode={MOCK_HOSPITAL_CLAIM.applicationId}
                                    decisionReason={decisionReason}
                                    decisionReasonLoading={false}
                                />
                            </Grid>
                        </Grid>
                    ) : (
                        <Paper variant="outlined" sx={EMPTY_STATE_SX}>
                            {`${steps[activeStep].label} (${claimListTypeConfig.label}) : อยู่ระหว่างการพัฒนา`}
                        </Paper>
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
                        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", justifyContent: "flex-end" }}>
                            <Button
                                variant="outlined"
                                startIcon={<SaveAsIcon />}
                                onClick={() =>
                                    swalSuccess("บันทึกแบบร่างเรียบร้อย", "ข้อมูลนี้เป็น Mock ยังไม่ได้บันทึกลงระบบ")
                                }
                            >
                                บันทึกแบบร่าง
                            </Button>

                            <Button
                                variant="contained"
                                startIcon={<SaveIcon />}
                                disabled={!formik.values.considerResult}
                                onClick={() =>
                                    swalSuccess("บันทึกผลพิจารณาเรียบร้อย", "ข้อมูลนี้เป็น Mock ยังไม่ได้บันทึกลงระบบ")
                                }
                                sx={{ bgcolor: "#2E7D32", "&:hover": { bgcolor: "#1B5E20" } }}
                            >
                                ยืนยันบันทึกผลพิจารณา
                            </Button>

                            <Button
                                variant="contained"
                                endIcon={<ArrowForwardIcon />}
                                onClick={handleNext}
                                disabled={activeStep === steps.length - 1}
                            >
                                ถัดไป
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </FormikProvider>
    );
};

export default HospitalClaimDetailsTab;
