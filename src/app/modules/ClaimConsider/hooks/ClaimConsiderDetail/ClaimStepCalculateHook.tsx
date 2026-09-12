import { useState } from "react";
import { FormikErrors, FormikProps, FormikTouched } from "formik";
import {
    CalculateCaseClaim,
    CalculateCaseClaimDtoRequest,
    GetCustomerDetailByIdDtoResponse,
} from "../../../../api/coreClaimApi.client";
import { useAppDispatch, useAppSelector } from "../../../../../redux";
import { useCalculateCaseClaim } from "../../../../api/coreClaimApi";
import { swalError } from "../../../_common";
import {
    ClaimConsiderValues,
    ClaimExpenseItem,
    claimConsiderSelector,
    setCalculateExpenseResult,
} from "../../store/claimConsiderSlice";
import { getClaimAmountReconciliation, sumClaimExpenseItems } from "../../../ClaimSimulate/store/Claimsimulateutils";

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
    // sync มาจาก ClaimExpenseDetailHook (/standard-medical-expense/case) — อ่านจาก store แทนการรับเป็น param
    // เพื่อไม่ต้องแก้ call site ทั้งสองที่ของ hook นี้
    const { caseAdjudicationId } = useAppSelector(claimConsiderSelector);
    const [activeStep, setActiveStep] = useState(0);
    const [furthestStep, setFurthestStep] = useState(0);
    const [isCalculating, setIsCalculating] = useState(false);

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
            productId: customerDetail?.productId,
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
            })),
            disabilityList: [],
        };

        return {
            caseAdjudicationId: caseAdjudicationId ?? undefined,
            isSimulateCase: false,
            isCheckIncludeCompensate: false,
            isCheckIncludeCompensateAll: false,
            jsonDetail: calculateDetail,
        };
    };

    const handleCalculate = async () => {
        try {
            setIsCalculating(true);
            const payload = buildCalculatePayload();
            const res = await calculateCaseClaim.mutateAsync(payload);
            if (res?.isSuccess && res.data) {
                dispatch(setCalculateExpenseResult(res.data));
            }
        } catch {
            // error handled ใน onErrorCallback
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
        if (activeStep === 0) {
            const isValid = await validateStep1();
            if (!isValid) return;
        }

        if (activeStep === 1) {
            const totals = sumClaimExpenseItems(filledItems);
            const reconciliation = getClaimAmountReconciliation({ ...totals, paymentAmount });
            if (reconciliation.status === "error") {
                swalError("ไม่สามารถดำเนินการต่อได้", reconciliation.message);
                return;
            }
            await handleCalculate();
        }
        const next = Math.min(activeStep + 1, stepsLength - 1);
        setActiveStep(next);
        setFurthestStep((prev) => Math.max(prev, next));
        scrollToStepToggleBar();
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
        handleNext,
        handleBack,
        handleCalculate,
    };
};

export default useClaimStepCalculateHook;
