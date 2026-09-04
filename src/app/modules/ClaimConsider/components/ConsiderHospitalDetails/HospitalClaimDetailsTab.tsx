import { useState } from "react";
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    Grid,
    Paper,
    Radio,
    RadioGroup,
    Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SaveIcon from "@mui/icons-material/Save";
import SaveAsIcon from "@mui/icons-material/SaveAs";
import { FormikProvider } from "formik";
import { useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../../../../../redux";
import { claimConsiderSelector, setClaimForm } from "../../store/claimConsiderSlice";
import useClaimStepCalculateHook from "../../hooks/ClaimConsiderDetail/ClaimStepCalculateHook";
import StepToggleBar from "../ConsiderDetails/TabDetails/SubDetailsTab/StepToggleBar";
import RecordClaimData from "../ConsiderDetails/TabDetails/SubDetailsTab/RecordClaimData";
import ConsiderSection from "../ConsiderDetails/TabDetails/SubDetailsTab/ConsiderSection";
import ClaimSummary from "../ConsiderDetails/TabDetails/SubDetailsTab/ClaimSummary";
import ClaimSummaryStep3, { Step3PayoutAccount } from "./SubDetailsTab/ExpensesTabs/ClaimSummaryStep3";
import { swalError } from "../../../_common";
import { MedicalType, PRODUCT_TYPE_GROUP, isProductType } from "../../../../functionHelpers";
import { useGetCustomerBankAccount } from "../../../../api/coreClaimApi";
import { useGetBank } from "../../../../api/coreClaimMastersApi";
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

const fmtBaht = (n: number) => n.toLocaleString("th-TH", { minimumFractionDigits: 2 });

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
    const dispatch = useAppDispatch();
    const [activeStep, setActiveStep] = useState(0);
    const [furthestStep, setFurthestStep] = useState(0);

    const { filledItems, calculateResult } = useAppSelector(claimConsiderSelector);

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

    /** Step 3 : "โอนค่าชดเชยรวมกับค่ารักษา" (Default โอนรวม) ยกมาไว้ที่นี่เพื่อคุม flow ปุ่มอนุมัติ */
    const [mergeCompensation, setMergeCompensation] = useState(true);
    /** ข้อมูลบัญชีรับเงินค่าชดเชยตามที่ผู้ใช้แก้ไขใน Step 3 (มีผลเฉพาะรายการนี้) */
    const [editedPayoutAccount, setEditedPayoutAccount] = useState<Step3PayoutAccount>();
    /** Modal "ยืนยันการทำรายการ" ก่อนอนุมัติ กรณีโอนค่าชดเชยแยก (IPD PH) */
    const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);

    const {
        handleSaveDraft,
        handleConfirmConsider,
        handleApprove: submitApproveDecision,
    } = useClaimDetailActionHook({
        formik,
        detailData,
        customerDetailData,
        // "โอนค่าชดเชยรวมกับค่ารักษา" (ติ๊ก = โอนรวม) → payload อนุมัติ isCombinedWithMedicalAll
        isCombinedWithMedicalAll: mergeCompensation,
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

    const { hasDiscountError, hasNotCoveredError } = useClaimExpenseDetailHook();

    const detail = detailData?.data;
    const customerDetail = customerDetailData?.data;
    const continuousClaim = formik.values.continuousClaim;
    const isLastStep = activeStep === steps.length - 1;

    /** Step 2 → Step 3 : เรียก /api/calculate/caseclaim แล้วเก็บผลไว้ที่ Redux (calculateResult) */
    const { isCalculating, handleCalculate } = useClaimStepCalculateHook({
        formik,
        customerDetail,
        filledItems,
        stepsLength: steps.length,
    });

    /** ตารางรายการค่ารักษา (Step 3) : จากผล API calculate ไม่ใช่ผลรวมฝั่ง FE */
    const step3TreatmentRows = (calculateResult?.medicalExpense ?? []).map((item) => ({
        benefitName: item.benefitName ?? "-",
        amountNet: item.net ?? 0,
        payAmount: item.pay ?? 0,
        unPayAmount: item.unPay ?? 0,
    }));

    /** ตารางค่าชดเชย (Step 3) : จากผล API calculate */
    const step3CompensationRows = (calculateResult?.compensateExpense ?? []).map((item) => ({
        description: item.benefitName ?? "-",
        amount: item.pay ?? 0,
    }));

    /** ยอดสรุป (Step 3) : จากผล API calculate */
    const step3Summary = {
        compensateNet: calculateResult?.compensateNet ?? 0,
        compensateInclude: calculateResult?.compensateInclude ?? 0,
        compensateRemain: calculateResult?.compensateRemain ?? 0,
        medicalNet: calculateResult?.medicalNet ?? 0,
        medicalCoverPay: calculateResult?.medicalCoverPay ?? 0,
        medicalCompensateInclude: calculateResult?.medicalCompensateInclude ?? 0,
        medicalPay: calculateResult?.medicalPay ?? 0,
        medicalUnpay: calculateResult?.medicalUnpay ?? 0,
    };

    /**
     * "โอนค่าชดเชยรวมกับค่ารักษา" : Default บังคับโอนรวม
     * เลือกโอนแยกได้เฉพาะผลิตภัณฑ์ PH + IPD / Day Case (ชีท IPD row 858 : Enable เฉพาะ PH)
     * และเมื่อโอนแยกจึงมีการ์ดบัญชีรับเงินค่าชดเชย
     */
    const allowSeparateCompensation =
        isProductType(customerDetail?.productTypeId, PRODUCT_TYPE_GROUP.PH) &&
        (formik.values.medicalTypeId === MedicalType.IPD ||
            formik.values.medicalTypeId === MedicalType.DayCaseSurgery);

    const { data: bankAccountData } = useGetCustomerBankAccount(
        allowSeparateCompensation ? customerDetail?.policyCode : undefined
    );
    const defaultBankAccount = bankAccountData?.data?.[0];

    /** ชื่อธนาคารจาก customerDetail.bankId (จับจาก master bank) */
    const { data: bankListData } = useGetBank();
    const customerBankName = customerDetail?.bankId
        ? bankListData?.data?.find((b) => b.organizeId === customerDetail.bankId)?.organizeName
        : undefined;

    /** ประเภทการรักษา IPD : แสดงการ์ดสรุปจำนวนวันนอน + ช่อง AN / ข้อบ่งชี้การ Admit */
    const isIPD = formik.values.medicalTypeId === MedicalType.IPD;
    const stayDays = isIPD
        ? {
              ipdDays: formik.values.ipdDays,
              icuDays: formik.values.icuDays,
              totalDays: (formik.values.ipdDays || 0) + (formik.values.icuDays || 0),
          }
        : undefined;

    /** บัญชีรับเงินค่าชดเชย : ใช้ค่าที่ผู้ใช้แก้ไขใน Step 3 ถ้ามี ไม่งั้น default จาก customerDetail แล้วค่อย fallback API */
    const payoutAccount: Step3PayoutAccount = editedPayoutAccount ?? {
        phone: customerDetail?.mobilePhoneNumber ?? undefined,
        accountName: customerDetail?.bankAccountName ?? defaultBankAccount?.bankAccountName ?? undefined,
        bankName: customerBankName ?? defaultBankAccount?.bankName ?? undefined,
        accountNo: customerDetail?.bankAccountNo ?? defaultBankAccount?.bankAccountNo ?? undefined,
        relationLabel: defaultBankAccount?.bankAccountRelationTypeName ?? undefined,
    };

    /** โอนค่าชดเชยแยก (ไม่ติ๊กโอนรวม) → ต้องยืนยันผ่าน Modal ก่อนอนุมัติ */
    const isSeparateCompensation = allowSeparateCompensation && !mergeCompensation;

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

        // Step 2 → Step 3 : sync ฟอร์มลง Redux แล้วเรียก /api/calculate/caseclaim
        if (activeStep === 1) {
            dispatch(setClaimForm(formik.values));
            await handleCalculate();
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
        // ยอดค่าใช้จ่าย / สิทธิ์ / ยอดที่จ่าย ต้องคำนวณเสร็จก่อน (ชีท : ต้องไม่มีรายการค้างสถานะ)
        if (!calculateResult) {
            swalError("ไม่สามารถอนุมัติได้", "ระบบยังคำนวณยอดไม่เสร็จ กรุณากลับไป Step 2 แล้วกดถัดไปอีกครั้ง");
            return;
        }
        // ชีท IPD row 972 : เปิด Modal ยืนยันการทำรายการก่อนยิง /decision "เฉพาะ" กรณี UnChecked
        // โอนค่าชดเชยรวมกับค่ารักษา (โอนค่าชดเชยแยก) ; กรณีอื่นอนุมัติตรง
        if (isSeparateCompensation) {
            setConfirmApproveOpen(true);
            return;
        }
        // ปุ่มอนุมัติ → POST /claim/decision/approve (decisionId 2)
        await submitApproveDecision();
    };

    /** ปุ่ม "ยืนยันการทำรายการ" ใน Modal : ยิง /claim/decision/approve จริง */
    const handleConfirmApprove = async () => {
        setConfirmApproveOpen(false);
        // ปุ่มอนุมัติ → POST /claim/decision/approve (decisionId 2)
        await submitApproveDecision();
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
                                <ClaimSummary
                                    attachedDocuments={[]}
                                    createdClaimDate={detail?.createdDate}
                                    headerOnly
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <ClaimSummaryStep3
                                    treatmentRows={step3TreatmentRows}
                                    compensationRows={step3CompensationRows}
                                    summary={step3Summary}
                                    allowSeparateCompensation={allowSeparateCompensation}
                                    stayDays={stayDays}
                                    mergeChecked={mergeCompensation}
                                    onMergeChange={setMergeCompensation}
                                    payoutAccount={payoutAccount}
                                    onPayoutAccountChange={setEditedPayoutAccount}
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
                                        disabled={isCalculating}
                                    >
                                        {isCalculating ? "กำลังคำนวณ..." : "ถัดไป"}
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

                {/* Modal ยืนยันการทำรายการ : ก่อนอนุมัติกรณีโอนค่าชดเชยแยก (ชีท IPD row 972-1009) */}
                <Dialog open={confirmApproveOpen} onClose={() => setConfirmApproveOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ fontWeight: 700 }}>ยืนยันการทำรายการ</DialogTitle>
                    <DialogContent dividers>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                            ตรวจสอบผลการอนุมัติเคลมก่อนส่งรายการ กรุณาตรวจสอบยอดตั้งเบิก ยอดค่าชดเชย
                            และข้อมูลบัญชีรับเงินให้ถูกต้องก่อนยืนยันการทำรายการ
                        </Typography>

                        <Box display="flex" justifyContent="space-between" py={0.5}>
                            <Typography variant="body2">สิทธิ์โรงพยาบาลตั้งเบิกกับบริษัท</Typography>
                            <Typography variant="body2" fontWeight={700}>
                                {fmtBaht(step3Summary.medicalPay)}
                            </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" py={0.5}>
                            <Typography variant="body2">ค่าชดเชยคงเหลือ (โอนให้ลูกค้า)</Typography>
                            <Typography variant="body2" fontWeight={700} color="#15803d">
                                {fmtBaht(step3Summary.compensateRemain)}
                            </Typography>
                        </Box>

                        {isSeparateCompensation && step3Summary.compensateRemain > 0 && (
                            <>
                                <Divider sx={{ my: 1.5 }} />

                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        mb: 0.5,
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <Typography variant="body2" fontWeight={700}>
                                        บัญชีรับเงินค่าชดเชย
                                    </Typography>
                                    <Chip
                                        label={payoutAccount.relationLabel ?? "ผู้ชำระเบี้ยในระบบ"}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                    />
                                </Box>
                                <Box display="flex" justifyContent="space-between" py={0.25}>
                                    <Typography variant="body2" color="text.secondary">
                                        ธนาคาร
                                    </Typography>
                                    <Typography variant="body2">{payoutAccount.bankName ?? "-"}</Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between" py={0.25}>
                                    <Typography variant="body2" color="text.secondary">
                                        เลขที่บัญชี
                                    </Typography>
                                    <Typography variant="body2">{payoutAccount.accountNo ?? "-"}</Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between" py={0.25}>
                                    <Typography variant="body2" color="text.secondary">
                                        ชื่อบัญชี
                                    </Typography>
                                    <Typography variant="body2">{payoutAccount.accountName ?? "-"}</Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between" py={0.25}>
                                    <Typography variant="body2" color="text.secondary">
                                        เบอร์โทรศัพท์
                                    </Typography>
                                    <Typography variant="body2">{payoutAccount.phone ?? "-"}</Typography>
                                </Box>
                            </>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ px: 3, py: 2 }}>
                        <Button variant="outlined" onClick={() => setConfirmApproveOpen(false)}>
                            ยกเลิก
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleConfirmApprove}
                            sx={{ bgcolor: "#2E7D32", "&:hover": { bgcolor: "#1B5E20" } }}
                        >
                            ยืนยันการทำรายการ
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </FormikProvider>
    );
};

export default HospitalClaimDetailsTab;
