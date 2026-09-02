import { useState } from "react";
import { Box, Button, FormControlLabel, Grid, Paper, Radio, RadioGroup, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SaveIcon from "@mui/icons-material/Save";
import SaveAsIcon from "@mui/icons-material/SaveAs";
import { FormikProvider } from "formik";
import { useNavigate } from "react-router-dom";

import StepToggleBar from "../ConsiderDetails/TabDetails/SubDetailsTab/StepToggleBar";
import RecordClaimData from "../ConsiderDetails/TabDetails/SubDetailsTab/RecordClaimData";
import ConsiderSection from "../ConsiderDetails/TabDetails/SubDetailsTab/ConsiderSection";
import ClaimSummary from "../ConsiderDetails/TabDetails/SubDetailsTab/ClaimSummary";
import ClaimSummaryStep3 from "./SubDetailsTab/ExpensesTabs/ClaimSummaryStep3";
import { swalError } from "../../../_common";
import { MedicalType, PRODUCT_TYPE_GROUP, isProductType } from "../../../../functionHelpers";
import { useGetCustomerBankAccount } from "../../../../api/coreClaimApi";
import useHospitalConsiderDetailHook from "../../hooks/ClaimConsiderHospital/HospitalConsiderDetailHook";
import useClaimDetailActionHook from "../../hooks/ClaimConsiderDetail/ClaimDetailActionHook";
import useClaimExpenseDetailHook from "../../hooks/ClaimConsiderDetail/ClaimExpenseDetailHook";
import { DOCUMENT_CHECK_RESULTS } from "./mock/hospitalConsiderMock";
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
 * Tab "ข้อมูลการเคลม" ของหน้าพิจารณาเคลมโรงพยาบาล (OPD Half / OPD Full)
 *
 * Step 1 บันทึกข้อมูลเคลม · Step 2 รายละเอียดค่าใช้จ่าย (OCR + รายการค่ารักษา)
 * · Step 3 สรุปรายการเคลม + ปุ่มอนุมัติ
 */
const HospitalClaimDetailsTab = ({ readOnly = false }: HospitalClaimDetailsTabProps) => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [furthestStep, setFurthestStep] = useState(0);

    const {
        formik,
        validateStep1,
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
        claimListTypeConfig,
        detailData,
        customerDetailData,
    } = useHospitalConsiderDetailHook();

    /** OPD Full : ประเภทรายการค่าใช้จ่าย Sim B1 / Sim B2 (Default Sim B2) */
    const [simBCategory, setSimBCategory] = useState<"SimB1" | "SimB2">("SimB2");

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

    const { hasDiscountError, hasNotCoveredError, expenseItems, totalClaim, totalNotCovered, netClaimAmount } =
        useClaimExpenseDetailHook();

    /** map รายการค่าใช้จ่าย (Step 2) → ตารางรายการค่ารักษาในหน้าสรุป (Step 3) */
    const step3TreatmentRows = expenseItems.map((item) => ({
        benefitName: `${item.code ?? ""} ${item.description ?? ""}`.trim() || "-",
        amountNet: item.claimAmount ?? 0,
        payAmount: (item.claimAmount ?? 0) - (item.discount ?? 0) - (item.notCovered ?? 0),
        unPayAmount: item.notCovered ?? 0,
    }));

    const detail = detailData?.data;
    const customerDetail = customerDetailData?.data;
    const continuousClaim = formik.values.continuousClaim;
    const isLastStep = activeStep === steps.length - 1;

    /**
     * "โอนค่าชดเชยรวมกับค่ารักษา" : PA / OPD ทุกผลิตภัณฑ์ = บังคับโอนรวม
     * เฉพาะ IPD / Day Case ที่ไม่ใช่ PA ผู้ใช้ถึงเลือกโอนแยกได้ (และมีการ์ดบัญชีรับเงินค่าชดเชย)
     */
    const allowSeparateCompensation =
        !isProductType(customerDetail?.productTypeId, PRODUCT_TYPE_GROUP.PA) &&
        (formik.values.medicalTypeId === MedicalType.IPD ||
            formik.values.medicalTypeId === MedicalType.DayCaseSurgery);

    const { data: bankAccountData } = useGetCustomerBankAccount(
        allowSeparateCompensation ? customerDetail?.policyCode : undefined
    );
    const defaultBankAccount = bankAccountData?.data?.[0];

    /** เลขที่เคส + สถานะของเคลมที่กำลังพิจารณาอยู่ */
    const currentCaseNo = detail?.caseNo ?? "";
    const currentCaseStatus = detail?.claimStatusName ?? undefined;

    /** เอกสารที่มีไฟล์แนบต้องเลือกผลการตรวจครบก่อนกด "ถัดไป" (ชีท row 104-105) */
    const isDocumentResultAllSelected = () =>
        !formik.values.documentChecks.some((doc) => doc.files.length > 0 && doc.checkResult === "");

    const handleNext = async () => {
        // Step 1 : ต้องผ่าน Validate + เลือกผลการตรวจเอกสารครบ ก่อนจึงไป Step 2 ได้ (อ้างอิงชีท)
        if (activeStep === 0) {
            const isValid = await validateStep1();
            if (!isValid) return;
            if (!isDocumentResultAllSelected()) {
                swalError(
                    "ยังดำเนินการต่อไม่ได้",
                    "กรุณาเลือกผลการตรวจให้ครบทุกรายการที่มีเอกสารก่อนดำเนินการถัดไป"
                );
                return;
            }
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

    /**
     * เอกสารที่มีไฟล์แนบทุกรายการต้องมีผลการตรวจเป็น "ผ่าน" ก่อนอนุมัติ
     * (ชีท : Document Count > 0 และ Document Result ≠ ผ่าน → ไม่สามารถอนุมัติ)
     */
    const isDocumentResultAllPassed = () =>
        !formik.values.documentChecks.some(
            (doc) => doc.files.length > 0 && doc.checkResult !== DOCUMENT_CHECK_RESULTS.passed
        );

    /** อนุมัติ (Step 3) : ผ่าน Validate Step 1 + เอกสารผ่านครบ + ยอดค่าใช้จ่ายถูกต้อง */
    const handleApprove = async () => {
        const isValid = await validateStep1();
        if (!isValid) {
            setActiveStep(0);
            return;
        }
        if (!isDocumentResultAllPassed()) {
            swalError("ไม่สามารถอนุมัติได้", "กรุณาเลือกผลการตรวจเป็น ผ่าน ให้ครบทุกรายการที่มีเอกสาร");
            return;
        }
        if (hasDiscountError || hasNotCoveredError) {
            swalError("ไม่สามารถอนุมัติได้", "กรุณาตรวจสอบยอดส่วนลด / ยอดไม่คุ้มครองให้ไม่เกินยอดเบิก");
            return;
        }
        // ปุ่มอนุมัติ = decisionId 2
        await handleConfirmConsider(2);
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
                                    // เคลม รพ. OPD ไม่มีปุ่ม "รอเอกสาร" (decisionId 3)
                                    hiddenDecisionIds={[3]}
                                />
                            </Grid>
                        </Grid>
                    ) : activeStep === 1 ? (
                        <Grid container spacing={2}>
                            {claimListTypeConfig.hasSimBSelector && (
                                <Grid item xs={12}>
                                    <Paper variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
                                        <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>
                                            ประเภทรายการค่าใช้จ่าย
                                        </Typography>
                                        <RadioGroup
                                            row
                                            value={simBCategory}
                                            onChange={(e) => setSimBCategory(e.target.value as "SimB1" | "SimB2")}
                                        >
                                            <FormControlLabel value="SimB1" control={<Radio />} label="Sim B1" />
                                            <FormControlLabel value="SimB2" control={<Radio />} label="Sim B2" />
                                        </RadioGroup>
                                    </Paper>
                                </Grid>
                            )}
                            <Grid item xs={12}>
                                <TreatmentCostTable />
                            </Grid>
                        </Grid>
                    ) : (
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <ClaimSummary attachedDocuments={[]} createdClaimDate={detail?.createdDate} />
                            </Grid>
                            <Grid item xs={12}>
                                <ClaimSummaryStep3
                                    treatmentRows={step3TreatmentRows}
                                    summary={{
                                        medicalNet: totalClaim,
                                        medicalCoverPay: netClaimAmount,
                                        medicalPay: netClaimAmount,
                                        medicalUnpay: totalNotCovered,
                                    }}
                                    allowSeparateCompensation={allowSeparateCompensation}
                                    payoutAccount={{
                                        phone: customerDetail?.mobilePhoneNumber ?? undefined,
                                        accountName: defaultBankAccount?.bankAccountName ?? undefined,
                                        bankName: defaultBankAccount?.bankName ?? undefined,
                                        accountNo: defaultBankAccount?.bankAccountNo ?? undefined,
                                        relationLabel: defaultBankAccount?.bankAccountRelationTypeName ?? undefined,
                                    }}
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
                                display: readOnly ? "none" : "flex",
                                gap: 1.5,
                                flexWrap: "wrap",
                                justifyContent: "flex-end",
                            }}
                        >
                            <Button variant="outlined" startIcon={<SaveAsIcon />} onClick={handleSaveDraft}>
                                บันทึกแบบร่าง
                            </Button>

                            {!isLastStep && (
                                <>
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
                                    >
                                        ถัดไป
                                    </Button>
                                </>
                            )}

                            {isLastStep && (
                                <Button
                                    variant="contained"
                                    startIcon={<CheckCircleIcon />}
                                    onClick={handleApprove}
                                    sx={{ bgcolor: "#2E7D32", "&:hover": { bgcolor: "#1B5E20" } }}
                                >
                                    อนุมัติ
                                </Button>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </FormikProvider>
    );
};

export default HospitalClaimDetailsTab;
