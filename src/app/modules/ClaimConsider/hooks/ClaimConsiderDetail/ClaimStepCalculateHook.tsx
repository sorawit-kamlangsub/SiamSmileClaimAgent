import { useState } from "react";
import { FormikProps } from "formik";
import {
    CalculateCaseClaim,
    CalculateCaseClaimDtoRequest,
    GetCustomerDetailByIdDtoResponse,
} from "../../../../api/coreClaimApi.client";
import { useAppDispatch } from "../../../../../redux";
import { useCalculateCaseClaim } from "../../../../api/coreClaimApi";
import { swalError } from "../../../_common";
import { ClaimExpenseItem, setCalculateExpenseResult } from "../../store/claimConsiderSlice";

type UseClaimStepCalculateHookProps = {
    formik: FormikProps<any>;
    customerDetail: GetCustomerDetailByIdDtoResponse | undefined;
    filledItems: ClaimExpenseItem[];
    stepsLength: number;
};

const useClaimStepCalculateHook = ({
    formik,
    customerDetail,
    filledItems,
    stepsLength,
}: UseClaimStepCalculateHookProps) => {
    const dispatch = useAppDispatch();
    const [activeStep, setActiveStep] = useState(0);
    const [furthestStep, setFurthestStep] = useState(0);
    const [isCalculating, setIsCalculating] = useState(false);

    const onErrorCallback = (error: string) => swalError("Error", error);
    const calculateCaseClaim = useCalculateCaseClaim(() => {}, onErrorCallback);

    const isLastStep = activeStep === stepsLength - 1;

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
            caseAdjudicationId: undefined,
            isSimulateCase: true,
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

    const handleNext = async () => {
        if (activeStep === 1) {
            await handleCalculate();
        }
        const next = Math.min(activeStep + 1, stepsLength - 1);
        setActiveStep(next);
        setFurthestStep((prev) => Math.max(prev, next));
    };

    const handleBack = () => {
        setActiveStep((prev) => Math.max(prev - 1, 0));
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
