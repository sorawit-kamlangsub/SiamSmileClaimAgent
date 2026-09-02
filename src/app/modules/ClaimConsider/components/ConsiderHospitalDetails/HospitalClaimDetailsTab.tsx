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
import useHospitalConsiderDetailHook from "../../hooks/ClaimConsiderHospital/HospitalConsiderDetailHook";
import useClaimDetailActionHook from "../../hooks/ClaimConsiderDetail/ClaimDetailActionHook";
import ContinuousClaimBanner from "./SubDetailsTab/ContinuousClaimBanner";
import ContinuousClaimSection from "./SubDetailsTab/ContinuousClaimSection";
import TreatmentInfoSection from "./SubDetailsTab/TreatmentInfoSection";
import AttendingDoctorSection from "./SubDetailsTab/AttendingDoctorSection";
import DocumentVerifyTable from "./SubDetailsTab/DocumentVerifyTable";
import TreatmentCostTable from "./SubDetailsTab/ExpensesTabs/TreatmentCostTable";

const steps = [{ label: "บันทึกข้อมูลเคลม" }, { label: "รายละเอียดค่าใช้จ่าย" }, { label: "สรุปรายการเคลม" }];

/** BE ต้องการ documentId เป็น GUID เท่านั้น ใช้กรอง mock row ที่ยังเป็น string ธรรมดาออก */
const isGuid = (value: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

type HospitalClaimDetailsTabProps = {
    /**
     * โหมดดูอย่างเดียว : แสดงข้อมูลชุดเดียวกับหน้าพิจารณา แต่แก้ไขไม่ได้
     * และเหลือปุ่มกลับปุ่มเดียว
     */
    readOnly?: boolean;
};

/**
 * Tab "ข้อมูลการเคลม" ของหน้าพิจารณาเคลมโรงพยาบาล (OPD Half)
 *
 * ตอนนี้ทำเฉพาะ Step 1 : บันทึกข้อมูลเคลม (Mock UI)
 * Step 2-3 ยังไม่ได้พัฒนา
 */
const HospitalClaimDetailsTab = ({ readOnly = false }: HospitalClaimDetailsTabProps) => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [furthestStep, setFurthestStep] = useState(0);

    const {
        formik,
        validateStep1,
        claimListTypeConfig,
        incidentType,
        incidentTypeLoading,
        coverageType,
        medicalType,
        causeOfIncident,
        incidentTypeMappingLoading,
        decisionReason,
        decisionReasonLoading,
        continuousClaimRows,
        continuousClaimOpen,
        setContinuousClaimOpen,
        handleToggleContinuousClaim,
        handleSelectContinuousClaim,
        handleClearContinuousClaim,
        handleDocumentCheckChange,
        documentCheckResultOptions,
        detailData,
        customerDetailData,
    } = useHospitalConsiderDetailHook();

    const { handleSaveDraft, handleConfirmConsider } = useClaimDetailActionHook({
        formik,
        detailData,
        customerDetailData,
        caseFields: {
            hn: formik.values.hn || undefined,
            vn: formik.values.vn || undefined,
        },
        // ตารางตรวจสอบเอกสาร -> case.caseDocument[].documentReviewStatusId
        // ส่งเฉพาะแถวที่มี documentId เป็น GUID จริง (ตอนนี้ยังเป็น mock row จึงถูกกรองออกหมด)
        documentReviews: formik.values.documentChecks
            .filter((doc) => doc.checkResult !== "" && isGuid(doc.documentId))
            .map((doc) => ({
                documentId: doc.documentId,
                documentNo: doc.documentName,
                documentReviewStatusId: doc.checkResult || undefined,
                caseDocumentDetail: [],
            })),
    });

    const detail = detailData?.data;
    const customerDetail = customerDetailData?.data;
    const continuousClaim = formik.values.continuousClaim;

    /** เลขที่เคส + สถานะของเคลมที่กำลังพิจารณาอยู่ */
    const currentCaseNo = detail?.caseNo ?? "";
    const currentCaseStatus = detail?.claimStatusName ?? undefined;

    const handleNext = async () => {
        // Step 1 : ต้องผ่าน Validate ก่อนจึงไป Step 2 ได้ (อ้างอิงชีท พิจารณาเคลม รพ. OPD Half)
        if (activeStep === 0) {
            const isValid = await validateStep1();
            if (!isValid) return;
        }

        const next = Math.min(activeStep + 1, steps.length - 1);
        setActiveStep(next);
        setFurthestStep((prev) => Math.max(prev, next));
    };

    /** ยืนยันบันทึกผลพิจารณา (รอแก้ไข / ปฏิเสธ / ยกเลิก) : ต้องผ่าน Validate Step 1 ทั้งหมดก่อน */
    const handleConfirmConsiderResult = async () => {
        const isValid = await validateStep1();
        if (!isValid) return;

        await handleConfirmConsider();
    };

    const handleBack = () => {
        if (activeStep === 0) return;
        setActiveStep((prev) => Math.max(prev - 1, 0));
    };

    /** ปิดการโต้ตอบกับส่วนที่เป็นฟอร์มทั้งหมดเมื่ออยู่ในโหมดดูอย่างเดียว */
    const readOnlySx = readOnly ? { "& > *": { pointerEvents: "none" } } : undefined;

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
                            {continuousClaim && (
                                <Grid item xs={12}>
                                    <ContinuousClaimBanner
                                        claim={continuousClaim}
                                        currentCaseNo={currentCaseNo}
                                        currentCaseStatus={currentCaseStatus}
                                    />
                                </Grid>
                            )}
                            <Grid item xs={12} sx={readOnlySx}>
                                <ContinuousClaimSection
                                    rows={continuousClaimRows}
                                    open={continuousClaimOpen}
                                    onOpenChange={setContinuousClaimOpen}
                                    onToggle={handleToggleContinuousClaim}
                                    onSelect={handleSelectContinuousClaim}
                                    onClear={handleClearContinuousClaim}
                                />
                            </Grid>
                            <Grid item xs={12} sx={readOnlySx}>
                                <RecordClaimData
                                    incidentType={incidentType}
                                    incidentTypeLoading={incidentTypeLoading}
                                    coverageType={coverageType}
                                    causeOfIncident={causeOfIncident}
                                    medicalType={medicalType}
                                    incidentTypeMappingLoading={incidentTypeMappingLoading}
                                />
                            </Grid>
                            <Grid item xs={12} sx={readOnlySx}>
                                <TreatmentInfoSection />
                            </Grid>
                            <Grid item xs={12} sx={readOnlySx}>
                                <AttendingDoctorSection />
                            </Grid>
                            <Grid item xs={12}>
                                <DocumentVerifyTable
                                    onChange={handleDocumentCheckChange}
                                    options={documentCheckResultOptions}
                                    readOnly={readOnly}
                                />
                            </Grid>
                            <Grid item xs={12} sx={readOnlySx}>
                                <ConsiderSection
                                    productId={customerDetail?.productTypeId}
                                    aplicationCode={customerDetail?.policyCode ?? ""}
                                    decisionReason={decisionReason}
                                    decisionReasonLoading={decisionReasonLoading}
                                />
                            </Grid>
                        </Grid>
                    ) : activeStep === 1 ? (
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={12} md={12} lg={12}>
                                <TreatmentCostTable />
                            </Grid>
                            <Grid item xs={12} sm={12} md={12} lg={12}></Grid>
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
                        <Box
                            sx={{
                                display: readOnly ? "none" : "flex",
                                gap: 1.5,
                                flexWrap: "wrap",
                                justifyContent: "flex-end",
                            }}
                        >
                            <Button variant="outlined" startIcon={<SaveAsIcon />} onClick={handleSaveDraft}>
                                บันทึกแบบร่าง
                            </Button>

                            <Button
                                variant="contained"
                                startIcon={<SaveIcon />}
                                disabled={!formik.values.considerResult}
                                onClick={handleConfirmConsiderResult}
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
