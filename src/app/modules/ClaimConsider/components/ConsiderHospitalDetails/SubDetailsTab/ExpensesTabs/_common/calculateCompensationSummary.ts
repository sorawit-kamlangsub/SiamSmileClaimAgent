/**
 * ตรรกะ "โอนค่าชดเชยรวมกับค่ารักษา" ของหน้าสรุปรายการเคลม (Step 3)
 * ย้ายมาจาก ClaimSimulate/components/ConfirmCalaulateModal.tsx เพื่อใช้ซ้ำ
 */

export interface CompensationSummaryData {
    /** ค่าชดเชยรวม */
    compensateNet: number;
    /** ค่าชดเชย (รวมในสิทธิ์ความคุ้มครอง) */
    compensateInclude: number;
    /** ค่าชดเชยคงเหลือ (โอนให้ลูกค้า) */
    compensateRemain: number;

    /** ยอดเบิกรวม */
    medicalNet: number;
    /** สิทธิ์ความคุ้มครอง */
    medicalCoverPay: number;
    /** ค่าชดเชยที่รวมเข้าในค่ารักษา */
    medicalCompensateInclude: number;
    /** สิทธิ์โรงพยาบาลตั้งเบิกกับบริษัท */
    medicalPay: number;
    /** ส่วนเกิน (ลูกค้าจ่าย) */
    medicalUnpay: number;
}

/** "single" = โอนรวมเท่าที่มีส่วนเกิน · "all" = โอนรวมทั้งหมด · null = ไม่โอนรวม */
export type MergeOption = "single" | "all" | null;

export const calculateCompensationSummary = (
    data: CompensationSummaryData,
    mergeOption: MergeOption
): CompensationSummaryData => {
    const result: CompensationSummaryData = { ...data };

    result.compensateInclude = 0;
    result.medicalCompensateInclude = 0;
    result.compensateRemain = result.compensateNet;

    // โอนค่าชดเชยรวมกับค่ารักษา (เท่าที่มีส่วนเกิน)
    if (mergeOption === "single") {
        if (result.medicalUnpay > 0) {
            if (result.medicalUnpay >= result.compensateNet) {
                result.medicalCompensateInclude = result.compensateNet;
                result.compensateRemain = 0;
            } else {
                result.medicalCompensateInclude = result.medicalUnpay;
                result.compensateRemain = result.compensateNet - result.medicalCompensateInclude;
            }

            result.compensateInclude = result.medicalCompensateInclude;
            result.medicalPay += result.medicalCompensateInclude;
            result.medicalUnpay -= result.medicalCompensateInclude;
        }
    }

    // โอนค่าชดเชยรวมกับค่ารักษาทั้งหมด
    if (mergeOption === "all") {
        result.medicalCompensateInclude = result.compensateNet;
        result.compensateInclude = result.compensateNet;
        result.compensateRemain = 0;

        result.medicalPay += result.medicalCompensateInclude;
        result.medicalUnpay -= result.medicalCompensateInclude;

        if (result.medicalUnpay < 0) {
            result.medicalUnpay = 0;
        }
    }

    return result;
};
