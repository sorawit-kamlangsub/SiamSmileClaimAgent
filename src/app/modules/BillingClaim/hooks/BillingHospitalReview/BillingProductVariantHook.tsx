import { isProductType, MedicalType, PRODUCT_TYPE_GROUP } from "../../../../functionHelpers";
import {
    CLAIM_LIST_TYPE_CONFIG,
    resolveClaimListType,
} from "../../../ClaimConsider/components/ConsiderHospitalDetails/mock/hospitalConsiderMock";

/**
 * รวมจุด gate ทุกอย่างที่ผูกกับ "ประเภทรายการเคลม" (variant A/B/C ของสเปค) และ product type (PA/PH)
 * ไว้ที่เดียว
 *
 * - IPD/DayCaseSurgery : อ่านจาก `medicalTypeId` ซึ่งมีจริงใน `BillingClaimDto`
 * - variant (OPD Half / OPD Full / IPD / Day Case) : `resolveClaimListType` ตัวเดียวกับหน้าพิจารณาเคลม รพ
 *   (DFUAT-033) — ตัดสินจาก `BillingDetailDto.medicalSubTypeCode` ก่อน แล้ว fallback เป็น `medicalTypeId`
 *   (เดิมอ่านจาก query param `?type=` ที่ไม่มีใคร set ทำให้ทุกเคสตกไป OPD Half)
 * - PA/PH : อ่านจาก `BillingDetailDto.productTypeId` (ไม่ส่งมา = false ทั้งคู่ ซ่อนไว้ก่อน = ปลอดภัยกว่า)
 */
const useBillingProductVariant = (
    medicalTypeId: number | undefined,
    productTypeId: number | undefined,
    medicalSubTypeCode: string | undefined
) => {
    const claimListType = resolveClaimListType(medicalTypeId, medicalSubTypeCode);
    const config = CLAIM_LIST_TYPE_CONFIG[claimListType];

    const isIPD = medicalTypeId === MedicalType.IPD;
    const isDayCase = medicalTypeId === MedicalType.DayCaseSurgery;
    const isIpdLike = isIPD || isDayCase;

    const isPA = isProductType(productTypeId, PRODUCT_TYPE_GROUP.PA);
    const isPH = isProductType(productTypeId, PRODUCT_TYPE_GROUP.PH);

    return {
        claimListType,
        claimListTypeLabel: config.label,
        isOPD: medicalTypeId === MedicalType.OPD,
        isIPD,
        isDayCase,
        isIpdLike,
        isPA,
        isPH,
        hasOcrSection: config.hasOcrReceipt,
        hasHospitalExpenseSummary: config.hasHospitalExpenseSummary,
        hasSimBSelector: config.hasSimBSelector,
        /** โอนค่าชดเชยแยกได้เฉพาะ PH + IPD/DayCase */
        allowSeparateCompensation: isPH && isIpdLike,
    };
};

export default useBillingProductVariant;
