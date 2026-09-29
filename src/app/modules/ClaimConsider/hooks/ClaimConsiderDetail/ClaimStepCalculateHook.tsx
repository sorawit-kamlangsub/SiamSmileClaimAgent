import { useRef, useState } from "react";
import Swal from "sweetalert2";
import { FormikErrors, FormikProps, FormikTouched } from "formik";
import {
    CalculateCaseClaim,
    CalculateCaseClaimDtoRequest,
    GetCustomerDetailByIdDtoResponse,
} from "../../../../api/coreClaimApi.client";
import { useAppDispatch } from "../../../../../redux";
import { useCalculateCaseClaim } from "../../../../api/coreClaimApi";
import { swalError } from "../../../_common";
import { ClaimConsiderValues, ClaimExpenseItem, setCalculateExpenseResult } from "../../store/claimConsiderSlice";
import {
    getClaimAmountReconciliation,
    hasMissingReasonError,
    sumClaimExpenseItems,
} from "../../../ClaimSimulate/store/Claimsimulateutils";

/**
 * แจ้งเตือนว่ายังไม่เลือกสาเหตุไม่คุ้มครอง แล้ว (หลังปิด alert) เลื่อนไป focus ช่องสาเหตุของแถวแรกที่ยังไม่เลือก
 * ในตาราง "รายการค่ารักษา(เบื้องต้น)" (ExpenseRecords ติด data-missing-reason) — ใช้ทั้งเคลมลูกค้าและเคลมโรงพยาบาล
 */
export const alertMissingNonCoveredReason = () => {
    const alert = swalError("ไม่สามารถดำเนินการต่อได้", "กรุณาเลือกสาเหตุไม่คุ้มครอง");
    // popup เปิดแล้วตอนนี้ — line-height ปกติเตี้ยเกินสระล่างภาษาไทย (ุ ู) จนโดนตัด ปรับเฉพาะ alert นี้ ไม่แตะ theme
    const htmlContainer = Swal.getHtmlContainer();
    if (htmlContainer) htmlContainer.style.lineHeight = "1.6";
    return alert.then(() => {
        const cell = document.querySelector<HTMLElement>('[data-missing-reason="true"]');
        cell?.scrollIntoView({ behavior: "smooth", block: "center" });
        cell?.querySelector<HTMLElement>('[role="combobox"], [tabindex="0"]')?.focus({ preventScroll: true });
    });
};

const STEP_1_ERROR_ORDER: (keyof ClaimConsiderValues)[] = [
    "incidentTypeId",
    "coverageTypeId",
    "medicalTypeId",
    "createdDate",
    "documentCompleteDate",
    "incidentDate",
    "incidentTime",
    "admissionDate",
    "admissionTime",
    "dischargeDate",
    "dischargeTime",
    "hospitalId",
    "chiefComplaintId",
    "diagnoses",
];

type UseClaimStepCalculateHookProps<TValues extends ClaimConsiderValues> = {
    formik: FormikProps<TValues>;
    customerDetail: GetCustomerDetailByIdDtoResponse | undefined;
    filledItems: ClaimExpenseItem[];
    stepsLength: number;
    /** ยอดที่จ่ายจริง (detail.paymentAmount) — ใช้เช็คยอดเงิน ClaimLine ก่อนปล่อยผ่าน Step 2 */
    paymentAmount?: number;
};

const useClaimStepCalculateHook = <TValues extends ClaimConsiderValues>({
    formik,
    customerDetail,
    filledItems,
    stepsLength,
    paymentAmount,
}: UseClaimStepCalculateHookProps<TValues>) => {
    const dispatch = useAppDispatch();
    const [activeStep, setActiveStep] = useState(0);
    const [furthestStep, setFurthestStep] = useState(0);
    const [isCalculating, setIsCalculating] = useState(false);
    // กันกดปุ่ม "ถัดไป" ซ้ำระหว่างรอ validate/calculate อยู่ (ครอบทั้ง handleNext ไม่ใช่แค่ตอน calculate)
    const [isAdvancing, setIsAdvancing] = useState(false);
    // state อัปเดตหลัง render ถัดไป คลิกซ้ำเร็วๆ ในเฟรมเดียวกันจะยังอ่านได้ false — ใช้ ref เป็นตัวกันจริง ส่วน state ไว้ disable ปุ่ม
    const isAdvancingRef = useRef(false);

    const onErrorCallback = (error: string) => swalError("Error", error);
    const calculateCaseClaim = useCalculateCaseClaim(() => {}, onErrorCallback);

    const isLastStep = activeStep === stepsLength - 1;

    const scrollToStepToggleBar = () => {
        window.setTimeout(() => {
            document
                .querySelector<HTMLElement>("[data-step-toggle-bar]")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 0);
    };

    const buildCalculatePayload = (): CalculateCaseClaimDtoRequest => {
        const calculateDetail: CalculateCaseClaim = {
            productId: customerDetail?.productId ?? undefined,
            customerDetailId: customerDetail?.customerDetailId ?? undefined,
            customerTypeCode: customerDetail?.customerTypeCode ?? undefined,
            productName: customerDetail?.productName ?? undefined,
            coverageTypeId: formik.values.coverageTypeId,
            medicalTypeId: formik.values.medicalTypeId,
            incidentTypeId: formik.values.incidentTypeId,
            occurrenceDate: formik.values.incidentDate,
            ipdCount: formik.values.ipdDays,
            icuCount: formik.values.icuDays,
            continueClaimNo: undefined,
            expenseList: filledItems.map((item) => ({
                standardMedicalExpenseId: item.standardMedicalExpenseId,
                description: item.description,
                originalAmount: item.claimAmount,
                discountAmount: item.discount,
                nonCoverAmount: item.notCovered,
                reasonId: item.reason,
                remark: item.remark,
                receiptAmount: item.receiptAmount,
            })),
            disabilityList: [],
        };

        return {
            // ไม่ผูก adjudication ของเคส + คำนวณแบบจำลองยอด (เหมือนเคลม รพ.) — jsonDetail จะส่งไปอีกรอบตอนอนุมัติ
            caseAdjudicationId: undefined,
            isSimulateCase: true,
            isCheckIncludeCompensate: false,
            isCheckIncludeCompensateAll: false,
            jsonDetail: calculateDetail,
        };
    };

    /** @returns สำเร็จหรือไม่ — handleNext ต้องเช็คก่อนเลื่อน step ต่อ ไม่งั้นเลื่อนไปหน้าสรุปทั้งที่ยอดคำนวณผิด/ไม่มี */
    const handleCalculate = async (): Promise<boolean> => {
        try {
            setIsCalculating(true);
            const payload = buildCalculatePayload();
            const res = await calculateCaseClaim.mutateAsync(payload);
            if (res?.isSuccess && res.data) {
                dispatch(setCalculateExpenseResult(res.data));
                return true;
            }
            return false;
        } catch {
            // error handled ใน onErrorCallback
            return false;
        } finally {
            setIsCalculating(false);
        }
    };

    const validateStep1 = async (): Promise<boolean> => {
        const errors: FormikErrors<TValues> = await formik.validateForm();

        if (Object.keys(errors).length === 0) {
            return true;
        }

        const touched: FormikTouched<TValues> = {
            ...formik.touched,
            incidentTypeId: errors.incidentTypeId ? true : formik.touched.incidentTypeId,
            coverageTypeId: errors.coverageTypeId ? true : formik.touched.coverageTypeId,
            medicalTypeId: errors.medicalTypeId ? true : formik.touched.medicalTypeId,
            createdDate: errors.createdDate ? true : formik.touched.createdDate,
            documentCompleteDate: errors.documentCompleteDate ? true : formik.touched.documentCompleteDate,
            incidentDate: errors.incidentDate ? true : formik.touched.incidentDate,
            incidentTime: errors.incidentTime ? true : formik.touched.incidentTime,
            admissionDate: errors.admissionDate ? true : formik.touched.admissionDate,
            admissionTime: errors.admissionTime ? true : formik.touched.admissionTime,
            dischargeDate: errors.dischargeDate ? true : formik.touched.dischargeDate,
            dischargeTime: errors.dischargeTime ? true : formik.touched.dischargeTime,
            chiefComplaintId: errors.chiefComplaintId ? true : formik.touched.chiefComplaintId,
            hospitalId: errors.hospitalId ? true : formik.touched.hospitalId,
            diagnoses: errors.diagnoses ? [{ icd10Id: true }] : formik.touched.diagnoses,
        };
        await formik.setTouched(touched, false);

        const firstErrorField = STEP_1_ERROR_ORDER.find((field) => errors[field]);
        if (firstErrorField) {
            window.setTimeout(() => {
                const fieldWrapper = document.querySelector<HTMLElement>(`[data-field-name="${firstErrorField}"]`);
                fieldWrapper?.scrollIntoView({ behavior: "smooth", block: "center" });
                fieldWrapper
                    ?.querySelector<HTMLElement>(
                        'input, textarea, button, [role="combobox"], [tabindex]:not([tabindex="-1"])'
                    )
                    ?.focus({ preventScroll: true });
            }, 0);
        }

        return false;
    };

    const handleNext = async () => {
        if (isAdvancingRef.current) return;
        isAdvancingRef.current = true;
        setIsAdvancing(true);
        try {
            if (activeStep === 0) {
                const isValid = await validateStep1();
                if (!isValid) return;
            }

            if (activeStep === 1) {
                // ตาราง "รายการค่ารักษา(เบื้องต้น)" โชว์ error ที่ช่องสาเหตุแล้ว แต่ไม่ได้กันปุ่มถัดไป — ต้องบล็อกที่นี่
                if (filledItems.some((item) => hasMissingReasonError(item))) {
                    alertMissingNonCoveredReason();
                    return;
                }
                const totals = sumClaimExpenseItems(filledItems);
                // ห้าม fallback paymentAmount เป็น 0 — undefined/null ("ยังไม่มีข้อมูลยอดโอน") ต้องแยกจาก 0
                // ("ยืนยันแล้วว่าไม่ได้โอน") ไม่งั้น getClaimAmountReconciliation จะขึ้น status "error" ผิดๆ
                // ทั้งที่ควรเป็น "pending" (ดู ClaimAmountReconciliationInput.paymentAmount)
                const reconciliation = getClaimAmountReconciliation({ ...totals, paymentAmount });
                if (reconciliation.status === "error") {
                    swalError("ไม่สามารถดำเนินการต่อได้", reconciliation.message);
                    return;
                }
                const calculated = await handleCalculate();
                if (!calculated) return;
            }
            const next = Math.min(activeStep + 1, stepsLength - 1);
            setActiveStep(next);
            setFurthestStep((prev) => Math.max(prev, next));
            scrollToStepToggleBar();
        } finally {
            isAdvancingRef.current = false;
            setIsAdvancing(false);
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => Math.max(prev - 1, 0));
        scrollToStepToggleBar();
    };

    return {
        activeStep,
        setActiveStep,
        furthestStep,
        isLastStep,
        isCalculating,
        isAdvancing,
        handleNext,
        handleBack,
        handleCalculate,
    };
};

export default useClaimStepCalculateHook;
