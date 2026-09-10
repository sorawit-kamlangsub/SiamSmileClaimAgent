import { useState } from "react";
import {
    Box,
    Button,
    CircularProgress,
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
import { claimConsiderSelector, resetState, setClaimForm } from "../../store/claimConsiderSlice";
import useHospitalClaimStepCalculateHook from "../../hooks/ClaimConsiderHospital/HospitalClaimStepCalculateHook";
import StepToggleBar from "../ConsiderDetails/TabDetails/SubDetailsTab/StepToggleBar";
import RecordClaimData from "../ConsiderDetails/TabDetails/SubDetailsTab/RecordClaimData";
import ConsiderSection from "../ConsiderDetails/TabDetails/SubDetailsTab/ConsiderSection";
import ClaimSummary from "../ConsiderDetails/TabDetails/SubDetailsTab/ClaimSummary";
import ClaimSummaryStep3, { Step3PayoutAccount } from "./SubDetailsTab/ExpensesTabs/ClaimSummaryStep3";
import { calculateCompensationSummary } from "./SubDetailsTab/ExpensesTabs/_common/calculateCompensationSummary";
import { swalError, swalLoading, swalSuccess } from "../../../_common";
import { swalHospitalApproveTransferSuccess } from "../../../_common/customSweetAlert";
import { MedicalType, PRODUCT_TYPE_GROUP, isProductType } from "../../../../functionHelpers";
import { useGetCustomerBankAccount } from "../../../../api/coreClaimApi";
import { useGetBank } from "../../../../api/coreClaimMastersApi";
import useHospitalConsiderDetailHook from "../../hooks/ClaimConsiderHospital/HospitalConsiderDetailHook";
import useClaimDetailActionHook from "../../hooks/ClaimConsiderDetail/ClaimDetailActionHook";
import useClaimExpenseDetailHook from "../../hooks/ClaimConsiderDetail/ClaimExpenseDetailHook";
import useHospitalConsiderPayment from "../../hooks/ClaimConsiderHospital/useHospitalConsiderPayment";
import { DOCUMENT_CHECK_RESULTS } from "./mock/hospitalConsiderMock";
import ContinuousClaimBanner from "./SubDetailsTab/ContinuousClaimBanner";
import TreatmentInfoSection from "./SubDetailsTab/TreatmentInfoSection";
import AttendingDoctorSection from "./SubDetailsTab/AttendingDoctorSection";
import DocumentVerifyTable from "./SubDetailsTab/DocumentVerifyTable";
import TreatmentCostTable from "./SubDetailsTab/ExpensesTabs/TreatmentCostTable";
import ConfirmHospitalCompensationTransferModal from "./ConfirmHospitalCompensationTransferModal";

const steps = [{ label: "บันทึกข้อมูลเคลม" }, { label: "รายละเอียดค่าใช้จ่าย" }, { label: "สรุปรายการเคลม" }];

/** เคลมโรงพยาบาล : ปุ่ม "รอแก้ไข" (decisionId 4) ของ ConsiderSection แสดงเป็น "แจ้งแก้ไข" — CR Ver2 ข้อ 2 */
const HOSPITAL_DECISION_LABEL_OVERRIDES: Partial<Record<number, string>> = { 4: "แจ้งแก้ไข" };

/** หน้ารายการพิจารณาเคลมโรงพยาบาล — index ของ path นี้คือ ConsiderHospitalMonitorPage */
const CONSIDER_HOSPITAL_MONITOR_PATH = "/consider/hospital-monitor";

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
        isStep1Loading,
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
        handleDocumentScan,
        documentCheckResultOptions,
        documentInfoByDocId,
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

    const detail = detailData?.data;
    const customerDetail = customerDetailData?.data;

    /**
     * จบงานบนหน้านี้แล้วกลับไปหน้า Monitor พิจารณาเคลม - เคลมโรงพยาบาล
     * ล้างทุกอย่างทันทีก่อนออก ไม่ให้รั่วไปเคสถัดไป : Redux (claimConsider), Formik และ state ของ stepper
     */
    const leaveToMonitor = () => {
        dispatch(resetState());
        formik.resetForm();
        setActiveStep(0);
        setFurthestStep(0);
        navigate(CONSIDER_HOSPITAL_MONITOR_PATH);
    };

    /**
     * "โอนค่าชดเชยรวมกับค่ารักษา" : Default บังคับโอนรวม
     * เลือกโอนแยกได้เฉพาะผลิตภัณฑ์ PH + IPD / Day Case (ชีท IPD row 858 : Enable เฉพาะ PH)
     * และเมื่อโอนแยกจึงมีการ์ดบัญชีรับเงินค่าชดเชย
     */
    const allowSeparateCompensation =
        isProductType(customerDetail?.productTypeId, PRODUCT_TYPE_GROUP.PH) &&
        (formik.values.medicalTypeId === MedicalType.IPD || formik.values.medicalTypeId === MedicalType.DayCaseSurgery);

    const { data: bankAccountData } = useGetCustomerBankAccount(
        allowSeparateCompensation ? customerDetail?.policyCode : undefined
    );
    const defaultBankAccount = bankAccountData?.data?.[0];

    /** ชื่อธนาคารจาก customerDetail.bankId (จับจาก master bank) */
    const { data: bankListData } = useGetBank();
    const customerBankName = customerDetail?.bankId
        ? bankListData?.data?.find((b) => b.organizeId === customerDetail.bankId)?.organizeName
        : undefined;

    /**
     * บัญชีรับเงินค่าชดเชย (default) — 2 แหล่ง :
     * - customerDetail.bank* : GET /customer/{customerId}/detail (useGetCustomerDetailById) — ใช้ก่อน
     * - defaultBankAccount   : GET /customer/{policyCode}/bank-account (useGetCustomerBankAccount) — fallback
     */
    const defaultPayoutAccount: Step3PayoutAccount = {
        phone: customerDetail?.mobilePhoneNumber ?? undefined,
        accountName: customerDetail?.bankAccountName ?? defaultBankAccount?.bankAccountName ?? undefined,
        bankId: defaultBankAccount?.bankId ?? customerDetail?.bankId ?? undefined,
        bankName: customerBankName ?? defaultBankAccount?.bankName ?? undefined,
        accountNo: customerDetail?.bankAccountNo ?? defaultBankAccount?.bankAccountNo ?? undefined,
        relationLabel: defaultBankAccount?.bankAccountRelationTypeName ?? undefined,
    };

    /**
     * ค่าจริงที่ใช้แสดง/โอน : ถ้าผู้ใช้แก้ field ใดใน Step 3 (editedPayoutAccount) ให้ทับเฉพาะ field นั้น
     * field ที่ไม่ได้แก้ยังใช้ค่า default จาก API
     */
    const payoutAccount: Step3PayoutAccount = { ...defaultPayoutAccount, ...editedPayoutAccount };

    /**
     * ยอดค่าชดเชย/ค่ารักษา ที่ปรับตามตัวเลือก "โอนค่าชดเชยรวมกับค่ารักษา" แล้ว (สูตรเดียวกับการ์ด Step 3)
     * - ไม่ติ๊ก (โอนแยก) → "ค่าชดเชยคงเหลือ (โอนให้ลูกค้า)" = ค่าชดเชยรวมทั้งก้อน
     * - ติ๊ก (โอนรวม)   → merge เข้ากับ "ส่วนเกิน (ลูกค้าจ่าย)" เท่าที่มี ส่วนที่เกินจากนั้นยังเป็นคงเหลือ
     * calculateResult ดิบจาก API ไม่รู้เรื่อง split — ต้องคำนวณฝั่ง FE ก่อนเอาไปแสดง/โอน/ยิง payload
     */
    const isCompensationMerged = !allowSeparateCompensation || mergeCompensation;
    const effectiveCompensation = calculateCompensationSummary(
        {
            compensateNet: calculateResult?.compensateNet ?? 0,
            compensateInclude: calculateResult?.compensateInclude ?? 0,
            compensateRemain: calculateResult?.compensateRemain ?? 0,
            medicalNet: calculateResult?.medicalNet ?? 0,
            medicalCoverPay: calculateResult?.medicalCoverPay ?? 0,
            medicalCompensateInclude: calculateResult?.medicalCompensateInclude ?? 0,
            medicalPay: calculateResult?.medicalPay ?? 0,
            medicalUnpay: calculateResult?.medicalUnpay ?? 0,
        },
        isCompensationMerged ? "single" : null
    );

    /** ยอดค่าชดเชยคงเหลือที่ต้องโอนให้ลูกค้าจริง (หลังปรับตามตัวเลือกโอนรวม) */
    const compensateRemainToCustomer = effectiveCompensation.compensateRemain;

    /**
     * มีค่าชดเชยคงเหลือต้องโอนให้ลูกค้าแยก → โอนผ่าน POST /Transfer/v1/CreatePayment (claimFund)
     * แยกจาก /claim/decision/approve จึง "ไม่" แนบบัญชีลูกค้าใน casePayable ของ approve ซ้ำ
     * (เกิดได้ทั้งกรณีไม่ติ๊กโอนรวม และกรณีติ๊กแต่ค่าชดเชยเกินส่วนเกินจนมีคงเหลือ)
     */
    const hasCompensationToTransfer = allowSeparateCompensation && compensateRemainToCustomer > 0;

    /** ยอดที่ปรับแล้ว ส่งแทน calculateResult ดิบให้ payload อนุมัติ (casePayable / caseAdjudication) */
    const calculateOverride = calculateResult
        ? {
              ...calculateResult,
              compensateInclude: effectiveCompensation.compensateInclude,
              compensateRemain: effectiveCompensation.compensateRemain,
              medicalCompensateInclude: effectiveCompensation.medicalCompensateInclude,
              medicalPay: effectiveCompensation.medicalPay,
              medicalUnpay: effectiveCompensation.medicalUnpay,
          }
        : null;

    /** โอนค่าชดเชยคงเหลือให้ลูกค้าหลังอนุมัติ (claimFund CreatePayment + EncryptText) */
    const { transferCompensation } = useHospitalConsiderPayment();

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
        // ค่าดิบ — hook เป็นคนกรอง/แปลงเป็น case.caseDocument[].documentReviewStatusId
        documentChecks: formik.values.documentChecks,
        // ยอดที่ปรับตามตัวเลือก "โอนค่าชดเชยรวมกับค่ารักษา" แล้ว — ให้ payload อนุมัติใช้ยอดนี้แทน calculateResult ดิบ
        calculateOverride,
        // ไม่มีค่าชดเชยคงเหลือต้องโอนแยก → ส่งบัญชีปลายทางใน casePayable เหมือนเดิม
        // มีคงเหลือต้องโอนแยก → ค่าชดเชยไปทาง CreatePayment แล้ว จึงไม่แนบบัญชีลูกค้าใน casePayable ซ้ำ
        payoutAccount: hasCompensationToTransfer
            ? undefined
            : {
                  bankId: payoutAccount.bankId,
                  bankName: payoutAccount.bankName,
                  bankAccountNo: payoutAccount.accountNo,
              },
        // บันทึกแบบร่างสำเร็จ → แจ้งผล แล้วกลับหน้า Monitor + ล้างทุกอย่าง
        onSaveDraftSuccess: () => {
            swalSuccess("บันทึกแบบร่างสำเร็จ", "เพิ่มในรายการประวัติการทำรายการเรียบร้อยแล้ว").then(() =>
                leaveToMonitor()
            );
        },
        // ยืนยันบันทึกผลพิจารณาสำเร็จ → แจ้งผล แล้วกลับหน้า Monitor + ล้างทุกอย่าง
        onConfirmConsiderSuccess: () => {
            swalSuccess("บันทึกผลพิจารณาสำเร็จ", "เพิ่มในรายการประวัติการทำรายการเรียบร้อยแล้ว").then(() =>
                leaveToMonitor()
            );
        },
        // อนุมัติสำเร็จ → (ถ้ามีค่าชดเชยคงเหลือ) โอนให้ลูกค้า "ทันที" แล้วแจ้งผล + กลับหน้า Monitor + ล้างทุกอย่าง
        onApproveSuccess: async (response) => {
            if (hasCompensationToTransfer && response.data) {
                // block จอไว้ระหว่างโอน ไม่ให้ผู้ใช้ทำอย่างอื่น
                swalLoading("กำลังโอนค่าชดเชยให้ลูกค้า", "กรุณารอสักครู่ อย่าปิดหน้าต่างนี้");
                const result = await transferCompensation({
                    approveResult: response.data,
                    payoutAccount,
                    compensateRemain: compensateRemainToCustomer,
                });
                if (!result.isSuccess) {
                    await swalError(
                        "อนุมัติสำเร็จ แต่โอนค่าชดเชยไม่สำเร็จ",
                        result.message ?? "กรุณาตรวจสอบและทำรายการโอนค่าชดเชยให้ลูกค้าอีกครั้งภายหลัง"
                    );
                    leaveToMonitor();
                    return;
                }
                // โอนสำเร็จ → แสดงเลขที่ Claim/Case + รหัสการโอนเงิน (CPG) + จำนวนเงิน
                await swalHospitalApproveTransferSuccess({
                    claimNo: response.data.claimNo,
                    caseNo: response.data.caseNo,
                    paymentCode: result.paymentCode,
                    transferAmount: compensateRemainToCustomer,
                    bankName: payoutAccount.bankName,
                    bankAccountNo: payoutAccount.accountNo,
                });
                leaveToMonitor();
                return;
            }

            swalSuccess("อนุมัติผลพิจารณาสำเร็จ", "เพิ่มในรายการประวัติการทำรายการเรียบร้อยแล้ว").then(() =>
                leaveToMonitor()
            );
        },
    });

    const { hasDiscountError, hasNotCoveredError } = useClaimExpenseDetailHook({ detailData, customerDetailData });

    const continuousClaim = formik.values.continuousClaim;
    const isLastStep = activeStep === steps.length - 1;

    /**
     * Step 2 → Step 3 : เรียก /api/calculate/caseclaim (payload เฉพาะเคลมโรงพยาบาล :
     * isSimulateCase = true, caseAdjudicationId = undefined) แล้วเก็บผลไว้ที่ Redux (calculateResult)
     */
    const { isCalculating, handleCalculate } = useHospitalClaimStepCalculateHook({
        formik,
        customerDetail,
        filledItems,
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

    /** ประเภทการรักษา IPD : แสดงการ์ดสรุปจำนวนวันนอน + ช่อง AN / ข้อบ่งชี้การ Admit */
    const isIPD = formik.values.medicalTypeId === MedicalType.IPD;
    const stayDays = isIPD
        ? {
              ipdDays: formik.values.ipdDays,
              icuDays: formik.values.icuDays,
              totalDays: (formik.values.ipdDays || 0) + (formik.values.icuDays || 0),
          }
        : undefined;

    /** มีค่าชดเชยคงเหลือต้องโอนให้ลูกค้า → ต้องยืนยันผ่าน Modal ก่อนอนุมัติ + โอนผ่าน CreatePayment */
    const isSeparateCompensation = hasCompensationToTransfer;

    /** เลขที่เคส + สถานะของเคลมที่กำลังพิจารณาอยู่ */
    const currentCaseNo = detail?.caseNo ?? "";
    const currentCaseStatus = detail?.claimStatusName ?? undefined;

    /** จำนวนไฟล์จริงใน DocStorage ของ documentId นั้น (0 = ยังไม่มีเอกสารแนบ) */
    const getFileCount = (documentId: string) => documentInfoByDocId[documentId]?.fileCount ?? 0;

    /** เอกสารที่มีไฟล์แนบต้องเลือกผลการตรวจครบก่อนกด "ถัดไป" (ชีท row 104-105) */
    const isDocumentResultAllSelected = () =>
        !formik.values.documentChecks.some((doc) => getFileCount(doc.documentId) > 0 && doc.checkResult === "");

    const handleNext = async () => {
        // Step 1 : ต้องผ่าน Validate + เลือกผลการตรวจเอกสารครบ ก่อนจึงไป Step 2 ได้ (อ้างอิงชีท)
        if (activeStep === 0) {
            const isValid = await validateStep1();
            if (!isValid) return;
            if (!isDocumentResultAllSelected()) {
                swalError("ยังดำเนินการต่อไม่ได้", "กรุณาเลือกผลการตรวจให้ครบทุกรายการที่มีเอกสารก่อนดำเนินการถัดไป");
                return;
            }
            // Step 1 → Step 2 : sync coverage/medical ลง Redux ให้ ExpenseRecords ใช้กรองรายการค่ารักษา
            // ส่งเฉพาะ 2 ฟิลด์นี้ — ห้ามส่ง formik.values ทั้งก้อน เพราะมี Dayjs (incidentDate ฯลฯ)
            // ที่ไม่ serializable ปนอยู่ ทำให้ Redux Toolkit ต้อง deep-scan ทั้ง store ทุกครั้งที่ dispatch จนหน้าค้าง
            dispatch(
                setClaimForm({
                    coverageTypeId: formik.values.coverageTypeId,
                    medicalTypeId: formik.values.medicalTypeId,
                })
            );
        }

        // Step 2 → Step 3 : sync coverage/medical ลง Redux (เผื่อผู้ใช้แก้ค่า) แล้วเรียก /api/calculate/caseclaim
        if (activeStep === 1) {
            dispatch(
                setClaimForm({
                    coverageTypeId: formik.values.coverageTypeId,
                    medicalTypeId: formik.values.medicalTypeId,
                })
            );
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
            (doc) => getFileCount(doc.documentId) > 0 && doc.checkResult !== DOCUMENT_CHECK_RESULTS.passed
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
        swalLoading("กำลังอนุมัติรายการ", "กรุณารอสักครู่");
        await submitApproveDecision();
    };

    /** ปุ่ม "ยืนยันการทำรายการ" ใน Modal : ยิง /claim/decision/approve จริง แล้วโอนค่าชดเชยต่อทันทีใน onApproveSuccess */
    const handleConfirmApprove = async () => {
        setConfirmApproveOpen(false);
        // ปุ่มอนุมัติ → POST /claim/decision/approve (decisionId 2)
        swalLoading("กำลังอนุมัติรายการ", "กรุณารอสักครู่");
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
                        <Box sx={{ position: "relative" }}>
                            {isStep1Loading && (
                                <Box
                                    sx={{
                                        position: "absolute",
                                        inset: 0,
                                        zIndex: 20,
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 1.5,
                                        bgcolor: "rgba(255, 255, 255, 0.65)",
                                        borderRadius: 2,
                                    }}
                                >
                                    <CircularProgress />
                                    <Typography variant="body2" color="text.secondary">
                                        กำลังโหลดข้อมูลเคลม...
                                    </Typography>
                                </Box>
                            )}
                            <Grid
                                container
                                spacing={2}
                                sx={isStep1Loading ? { pointerEvents: "none", opacity: 0.5 } : undefined}
                            >
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
                                    <RecordClaimData
                                        incidentType={incidentType}
                                        incidentTypeLoading={incidentTypeLoading}
                                        coverageType={coverageType}
                                        causeOfIncident={causeOfIncident}
                                        medicalType={medicalType}
                                        incidentTypeMappingLoading={incidentTypeMappingLoading}
                                        continuousClaimRows={continuousClaimRows}
                                        continuousClaimOpen={continuousClaimOpen}
                                        onContinuousClaimOpenChange={setContinuousClaimOpen}
                                        onContinuousClaimToggle={handleToggleContinuousClaim}
                                        onContinuousClaimSelect={handleSelectContinuousClaim}
                                        onContinuousClaimClear={handleClearContinuousClaim}
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
                                        onScan={handleDocumentScan}
                                        options={documentCheckResultOptions}
                                        documentInfoByDocumentId={documentInfoByDocId}
                                        readOnly={readOnly}
                                    />
                                </Grid>
                                <Grid item xs={12} sx={readOnlySx}>
                                    <ConsiderSection
                                        productId={customerDetail?.productTypeId}
                                        aplicationCode={customerDetail?.policyCode ?? ""}
                                        decisionReason={decisionReason}
                                        decisionReasonLoading={decisionReasonLoading}
                                        // เคลม รพ. OPD ไม่มีปุ่ม "รอเอกสาร" (decisionId 3) และ "ยกเลิก" (decisionId 6) — CR Ver2
                                        hiddenDecisionIds={[3, 6]}
                                        headingText="แจ้งผลการพิจารณาโรงพยาบาล"
                                        labelOverrides={HOSPITAL_DECISION_LABEL_OVERRIDES}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
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
                                <TreatmentCostTable
                                    formik={formik}
                                    detailData={detailData}
                                    customerDetailData={customerDetailData}
                                />
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
                            sx={{ bgcolor: "#fff" }}
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
                            {!isLastStep && (
                                <>
                                    <Button
                                        variant="outlined"
                                        startIcon={<SaveAsIcon />}
                                        onClick={handleSaveDraft}
                                        disabled={isStep1Loading}
                                    >
                                        บันทึกแบบร่าง
                                    </Button>
                                    <Button
                                        variant="contained"
                                        startIcon={<SaveIcon />}
                                        disabled={!formik.values.considerResult || isStep1Loading}
                                        onClick={handleConfirmConsiderResult}
                                        sx={{ bgcolor: "#2E7D32", "&:hover": { bgcolor: "#1B5E20" } }}
                                    >
                                        ยืนยันบันทึกผลพิจารณา
                                    </Button>

                                    <Button
                                        variant="contained"
                                        endIcon={<ArrowForwardIcon />}
                                        onClick={handleNext}
                                        disabled={isCalculating || isStep1Loading}
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

                {/* ยืนยันการทำรายการ : ก่อนอนุมัติ + โอนค่าชดเชยให้ลูกค้า (ชีท IPD row 972-1009) */}
                <ConfirmHospitalCompensationTransferModal
                    open={confirmApproveOpen}
                    onClose={() => setConfirmApproveOpen(false)}
                    onConfirm={handleConfirmApprove}
                    customerName={customerDetail?.customerName}
                    phone={payoutAccount.phone}
                    payoutAccount={{
                        bankId: payoutAccount.bankId,
                        bankName: payoutAccount.bankName,
                        accountNo: payoutAccount.accountNo,
                        accountName: payoutAccount.accountName,
                    }}
                    hospitalPayableAmount={effectiveCompensation.medicalPay}
                    transferAmount={compensateRemainToCustomer}
                />
            </Box>
        </FormikProvider>
    );
};

export default HospitalClaimDetailsTab;
