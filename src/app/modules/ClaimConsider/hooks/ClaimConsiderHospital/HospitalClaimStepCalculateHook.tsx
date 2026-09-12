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
import { ClaimConsiderValues, ClaimExpenseItem, setCalculateExpenseResult } from "../../store/claimConsiderSlice";

type UseHospitalClaimStepCalculateHookProps<TValues extends ClaimConsiderValues> = {
    formik: FormikProps<TValues>;
    customerDetail: GetCustomerDetailByIdDtoResponse | undefined;
    filledItems: ClaimExpenseItem[];
};

/**
 * เรียก /api/calculate/caseclaim สำหรับ "เคลมโรงพยาบาล" โดยเฉพาะ (Step 2 → Step 3)
 *
 * แยกออกจาก useClaimStepCalculateHook (เคลมลูกค้า) เพราะ payload ต่างกัน :
 *  - isSimulateCase = true — เคลม รพ. เป็นการจำลองยอด
 *  - caseAdjudicationId = undefined เสมอ — ไม่ผูก adjudication ของเคสจาก /standard-medical-expense/case
 *
 * ผล calculate เก็บไว้ที่ Redux (claimConsider.calculateResult) เหมือนเดิม
 */
const useHospitalClaimStepCalculateHook = <TValues extends ClaimConsiderValues>({
    formik,
    customerDetail,
    filledItems,
}: UseHospitalClaimStepCalculateHookProps<TValues>) => {
    const dispatch = useAppDispatch();
    const [isCalculating, setIsCalculating] = useState(false);

    const onErrorCallback = (error: string) => swalError("Error", error);
    const calculateCaseClaim = useCalculateCaseClaim(() => {}, onErrorCallback);

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
            // เคลม รพ. : ไม่ผูก adjudication ของเคส — ส่ง undefined เสมอ
            caseAdjudicationId: undefined,
            // เคลม รพ. : คำนวณแบบจำลองยอด
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

    return { isCalculating, handleCalculate };
};

export default useHospitalClaimStepCalculateHook;
