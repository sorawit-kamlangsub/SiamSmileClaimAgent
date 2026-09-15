import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { isProductType, MedicalType, PRODUCT_TYPE_GROUP } from "../../../../functionHelpers";
import {
    BILLING_CLAIM_LIST_TYPE_CONFIG,
    BillingClaimListType,
    parseBillingClaimListType,
} from "../../store/billingClaim.types";

/**
 * รวมจุด gate ทุกอย่างที่ผูกกับ "ประเภทรายการเคลม" (variant A/B/C ของสเปค) และ product type (PA/PH)
 * ไว้ที่เดียว — เพื่อให้สลับไปอ่านจาก contract จริงได้ในจุดเดียวเมื่อ BE เพิ่มฟิลด์
 *
 * วันนี้:
 * - IPD/DayCaseSurgery : อ่านจาก `medicalTypeId` ซึ่งมีจริงใน `BillingClaimDto`
 * - variant (OPD Half / OPD Full / IPD) : อ่านจาก query param `?type=` ชั่วคราว (PENDING_BE_FIELDS.claimListTypeId)
 * - PA/PH : ยังไม่มี `productTypeId` ใน `BillingDetailDto` เลย → คืน false เสมอ (ซ่อนไว้ก่อน = ปลอดภัยกว่า)
 */
const useBillingProductVariant = (medicalTypeId: number | undefined) => {
    const [searchParams] = useSearchParams();

    const claimListType: BillingClaimListType = useMemo(
        () => parseBillingClaimListType(searchParams.get("type")),
        [searchParams]
    );
    const config = BILLING_CLAIM_LIST_TYPE_CONFIG[claimListType];

    const isIPD = medicalTypeId === MedicalType.IPD;
    const isDayCase = medicalTypeId === MedicalType.DayCaseSurgery;
    const isIpdLike = isIPD || isDayCase;

    // PENDING-BE: PRODUCT_TYPE_GROUP.PA/.PH ต้องการ productTypeId ที่ BillingDetailDto ยังไม่ส่งมา
    const productTypeId: number | undefined = undefined;
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
        /** โอนค่าชดเชยแยกได้เฉพาะ PH + IPD/DayCase — วันนี้ isPH เป็น false เสมอ จึงยัง false เสมอ */
        allowSeparateCompensation: isPH && isIpdLike,
    };
};

export default useBillingProductVariant;
