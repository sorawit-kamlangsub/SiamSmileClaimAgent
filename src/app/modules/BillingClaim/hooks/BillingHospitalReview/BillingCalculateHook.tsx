import { useEffect, useRef, useState } from "react";
import {
    CalculateCaseClaim,
    CalculateCaseClaimDtoRequest,
    CalculateCaseClaimDtoResponse,
} from "../../../../api/coreClaimApi.client";
import { useCalculateCaseClaim } from "../../../../api/coreClaimApi";
import { swalError } from "../../../_common";
import { BillingReviewFormValues } from "../../store/billingClaim.types";

type UseBillingCalculateHookParams = {
    /** `BillingDetailDto.caseAdjudicationId` */
    caseAdjudicationId: string | undefined;
    /** `BillingDetailDto.productId` */
    productId: number | undefined;
    values: BillingReviewFormValues;
};

/**
 * `jsonDetail` ชุดเดียวกับที่หน้าพิจารณาเคลมโรงพยาบาลส่ง (HospitalClaimStepCalculateHook.buildCalculatePayload)
 *
 * ต่างจากหน้าพิจารณาเคลม :
 * - `customerDetailId` / `customerTypeCode` / `productName` : `BillingDetailDto` ยังไม่มี → ส่ง undefined
 * - รายการค่ารักษามาจาก `values.expenses` (BillingExpenseDto) : `claimAmount` ของ billing คือ "ยอดเงินตามใบเสร็จ"
 *   จึงใช้ทั้งเป็น `originalAmount` และ fallback ของ `receiptAmount` (ถ้าไม่มี `_receiptAmount` แยก)
 */
const buildCalculateDetail = (productId: number | undefined, values: BillingReviewFormValues): CalculateCaseClaim => ({
    productId,
    customerDetailId: undefined,
    customerTypeCode: undefined,
    productName: undefined,
    coverageTypeId: values.coverageTypeId,
    medicalTypeId: values.medicalTypeId,
    incidentTypeId: values.incidentTypeId,
    occurrenceDate: values.incidentDate,
    ipdCount: values.ipdDays,
    icuCount: values.icuDays,
    continueClaimNo: undefined,
    expenseList: values.expenses
        .filter((item) => !!item.standardMedicalExpenseId)
        .map((item) => ({
            standardMedicalExpenseId: item.standardMedicalExpenseId,
            description: item.itemName,
            originalAmount: item.claimAmount,
            discountAmount: item.discountAmount,
            nonCoverAmount: item.nonCoveredAmount,
            reasonId: item.nonCoveredReasonId,
            remark: item.note,
            receiptAmount: item._receiptAmount ?? item.claimAmount,
        })),
    disabilityList: [],
});

/**
 * ผลคำนวณสิทธิ์/ค่าชดเชยของรายการวางบิล สำหรับ Step 3 "สรุปรายการเคลม" — ยิง POST /calculate/caseclaim
 * (`useCalculateCaseClaim` ตัวเดียวกับหน้าพิจารณาเคลม รพ) :
 *  - `caseAdjudicationId` = `BillingDetailDto.caseAdjudicationId`
 *  - `jsonDetail` = ข้อมูลเคลม + รายการค่ารักษา ตาม field ที่หน้าพิจารณาเคลมโรงพยาบาลส่ง
 *  - `isSimulateCase` / `isCheckIncludeCompensate` / `isCheckIncludeCompensateAll` = false (ส่งชัดเจนทุกตัว)
 *
 * ยิงครั้งเดียวต่อการ mount (Step 3 ถูก mount ใหม่ทุกครั้งที่เข้า step นี้ — ทั้งจากปุ่ม "ถัดไป" และการกด
 * แถบ step ในโหมด readOnly) ค่าในฟอร์มเป็น Read-only ตั้งแต่โหลด detail จึงอ่านค่า ณ ตอนยิงได้เลย
 */
const useBillingCalculateHook = ({ caseAdjudicationId, productId, values }: UseBillingCalculateHookParams) => {
    const [result, setResult] = useState<CalculateCaseClaimDtoResponse>();
    const [isCalculating, setIsCalculating] = useState(false);
    const calculateCaseClaim = useCalculateCaseClaim(undefined, (error) => swalError("คำนวณสิทธิ์ไม่สำเร็จ", error));
    /** กันยิงซ้ำจาก effect ที่รันสองรอบ (React StrictMode) หรือ re-render ระหว่างรอผล */
    const hasRequestedRef = useRef(false);

    useEffect(() => {
        if (hasRequestedRef.current) return;
        hasRequestedRef.current = true;

        const payload: CalculateCaseClaimDtoRequest = {
            caseAdjudicationId,
            isSimulateCase: false,
            isCheckIncludeCompensate: false,
            isCheckIncludeCompensateAll: false,
            jsonDetail: buildCalculateDetail(productId, values),
        };

        setIsCalculating(true);
        calculateCaseClaim
            .mutateAsync(payload)
            .then((res) => {
                if (res?.isSuccess && res.data) setResult(res.data);
            })
            .catch(() => {
                // error แจ้งผ่าน onErrorCallback ของ useCalculateCaseClaim แล้ว
            })
            .finally(() => setIsCalculating(false));
    }, []);

    return { result, isCalculating };
};

export default useBillingCalculateHook;
