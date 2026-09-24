import { Dayjs } from "dayjs";
import { BillingDocumentDto, BillingExpenseDto } from "../../../api/coreClaimApi.client";
import { ContinuousClaimSelection } from "../../CheckEligible/components/ContinuousClaimDialog";

/**
 * สถานะรายการวางบิลเคลมโรงพยาบาล — ตรงกับ master BillingReviewStatusId ใน DB (ตรวจ 2026-09-24):
 * 2 รอตรวจสอบ / 3 รอแก้ไข / 4 ผ่าน / 5 ปฏิเสธ / 6 ยกเลิก / 7 รอสร้างรายการ (7 ยังไม่ใช้ในหน้านี้)
 * — ไม่ใช่ ClaimTransactionTypeId (อนุมัติ = 9 เป็นของ master นั้น ห้ามใช้ที่นี่)
 */
export const BILLING_STATUS = {
    pendingReview: 2, // รอพิจารณา / รอตรวจสอบ
    needsCorrection: 3, // รอเอกสาร / รอแก้ไข
    passed: 4, // ผ่าน / อนุมัติ — ไม่รองรับใน Filter
    rejected: 5, // ปฏิเสธ
    cancelled: 6, // ยกเลิก
} as const;

export type BillingStatusId = (typeof BILLING_STATUS)[keyof typeof BILLING_STATUS];

export const BILLING_STATUS_LABEL: Record<BillingStatusId, string> = {
    [BILLING_STATUS.pendingReview]: "รอตรวจสอบ",
    [BILLING_STATUS.needsCorrection]: "รอแก้ไข",
    [BILLING_STATUS.passed]: "อนุมัติ",
    [BILLING_STATUS.rejected]: "ปฏิเสธ",
    [BILLING_STATUS.cancelled]: "ยกเลิก",
};

/** ประเภทรายการเคลมของหน้านี้ — BE ตัด `claimType` ออกจาก Billing DTO แล้ว (codegen 2026-09-08) */
export const BILLING_CLAIM_TYPE_LABEL = "เคลมโรงพยาบาล";

/**
 * decisionId ของ Decision master ที่ผูกกับผลตรวจสอบวางบิลแต่ละสถานะ
 * เลขชุดเดียวกับ ConsiderSection ของ ClaimConsider (3 รอเอกสาร / 4 รอแก้ไข / 5 ปฏิเสธ / 6 ยกเลิก)
 * — ยืนยันกับ BE แล้วว่าตรงกับ master ClaimTransactionTypeId (2026-09-23)
 *
 * TODO(billing-reject-reason): สถานะ "ปฏิเสธ" (BILLING_STATUS.rejected) ใช้ entry นี้ (decisionId=5)
 * เพื่อดึงรายการเหตุผลมาโชว์บนจอชั่วคราวเท่านั้น — hospital-billing-fe.md ข้อ 9 ระบุว่า `rejectReasonId`
 * เป็นคนละ master กับ DecisionReason และ repository ยังไม่มี HTTP endpoint อ่าน RejectReason ห้าม
 * reuse master นี้ถาวร เมื่อ BE เพิ่ม endpoint ให้ย้าย status rejected ไปเรียก master ใหม่แยกจาก
 * BILLING_DECISION_ID
 */
export const BILLING_DECISION_ID: Partial<Record<BillingStatusId, number>> = {
    [BILLING_STATUS.needsCorrection]: 4,
    [BILLING_STATUS.rejected]: 5,
    [BILLING_STATUS.cancelled]: 6,
};

/** สถานะที่หน้า list / segmented filter ใช้ได้ (ไม่รวม "อนุมัติ") */
export const BILLING_FILTER_STATUS_IDS = [
    BILLING_STATUS.pendingReview,
    BILLING_STATUS.needsCorrection,
    BILLING_STATUS.rejected,
    BILLING_STATUS.cancelled,
] as const;

/** ผลตรวจสอบที่กด submit ได้ใน Step 3 (ไม่รวม "รอตรวจสอบ" — เป็นสถานะเริ่มต้นเท่านั้น) */
export const BILLING_SUBMIT_STATUS_OPTIONS: { value: BillingStatusId; label: string }[] = [
    { value: BILLING_STATUS.passed, label: BILLING_STATUS_LABEL[BILLING_STATUS.passed] },
    { value: BILLING_STATUS.needsCorrection, label: BILLING_STATUS_LABEL[BILLING_STATUS.needsCorrection] },
    { value: BILLING_STATUS.rejected, label: BILLING_STATUS_LABEL[BILLING_STATUS.rejected] },
    { value: BILLING_STATUS.cancelled, label: BILLING_STATUS_LABEL[BILLING_STATUS.cancelled] },
];

/** ตัวเลือก segmented control ของหน้า list — ตรงกับ BILLING_FILTER_STATUS_IDS (ไม่รวม "อนุมัติ") */
export const BILLING_FILTER_STATUS_OPTIONS: { value: BillingStatusId; label: string }[] = [
    { value: BILLING_STATUS.pendingReview, label: BILLING_STATUS_LABEL[BILLING_STATUS.pendingReview] },
    { value: BILLING_STATUS.needsCorrection, label: BILLING_STATUS_LABEL[BILLING_STATUS.needsCorrection] },
    { value: BILLING_STATUS.rejected, label: BILLING_STATUS_LABEL[BILLING_STATUS.rejected] },
    { value: BILLING_STATUS.cancelled, label: BILLING_STATUS_LABEL[BILLING_STATUS.cancelled] },
];

/** ตัวเลือก "ค้นหาจาก" — ค่า `value` ต้องตรงกับ `searchBy` ที่ BE รับ (hospital-billing-fe.md ข้อ 4) */
export const BILLING_SEARCH_BY = {
    insuredName: "insuredName",
    hospital: "hospital",
    claimCode: "claimCode",
    idCard: "idCard",
    studentCard: "studentCard",
} as const;

export type BillingSearchByField = (typeof BILLING_SEARCH_BY)[keyof typeof BILLING_SEARCH_BY];

export const BILLING_SEARCH_BY_OPTIONS: { value: BillingSearchByField; label: string }[] = [
    { value: BILLING_SEARCH_BY.insuredName, label: "ชื่อ-สกุลผู้เอาประกัน" },
    { value: BILLING_SEARCH_BY.idCard, label: "เลขบัตรประชาชน" },
    { value: BILLING_SEARCH_BY.studentCard, label: "เลขที่บัตรประกันนักเรียน" },
    { value: BILLING_SEARCH_BY.hospital, label: "ชื่อสถานพยาบาล" },
    { value: BILLING_SEARCH_BY.claimCode, label: "เลขที่ CL" },
];

/**
 * ผลการตรวจเอกสาร (documentReviewStatusId) — ตัวเลขชุดเดียวกับหน้าพิจารณาเคลม
 * (`DOCUMENT_CHECK_RESULTS` ใน ClaimConsider/.../mock/hospitalConsiderMock.tsx) แต่ประกาศแยกไว้ที่นี่
 * เพราะไฟล์ต้นทางชื่อ "mock" ปนข้อมูล mock กับค่าจริง ไม่ควร import ข้ามโมดูล
 * TODO: ยืนยันเลขกับ BE — ไม่มีเอกสารสัญญาระบุไว้ตรง ๆ
 */
export const BILLING_DOCUMENT_REVIEW_STATUS = {
    passed: 2,
    failed: 3,
    waiting: 4,
} as const;

/** สีประจำผลการตรวจเอกสารแต่ละสถานะ (key = documentReviewStatusId) — ชุดสีเดียวกับ DOCUMENT_CHECK_RESULT_COLORS ของหน้าพิจารณาเคลม */
export const BILLING_DOCUMENT_REVIEW_STATUS_COLOR: Record<number, string> = {
    [BILLING_DOCUMENT_REVIEW_STATUS.passed]: "#178236",
    [BILLING_DOCUMENT_REVIEW_STATUS.failed]: "#B32615",
    [BILLING_DOCUMENT_REVIEW_STATUS.waiting]: "#A87808",
};

/** สีสำรองเมื่อเจอ documentReviewStatusId ที่ยังไม่ได้กำหนดสี */
export const BILLING_DOCUMENT_REVIEW_STATUS_FALLBACK_COLOR = "#5A6B7B";

/** เพิ่มแถวค่ารักษาใหม่ให้ `caseItemId` ว่างไว้ — BE รู้ว่าเป็นแถวใหม่จากตรงนี้ (handoff ข้อ 5) */
export type BillingExpenseFormItem = BillingExpenseDto & {
    _rowKey: string;
    _isNew: boolean;
    // ฟิลด์ FE-only ที่สเปคใหม่ต้องการแต่ยังไม่มีใน BillingExpenseDto — ดู PENDING_BE_FIELDS
    // toExpenseDto (billingMappers.ts) เป็น whitelist mapping จึงไม่รั่วไหลขึ้น BE โดยไม่ตั้งใจ
    _receiptAmount?: number;
    _entitlementAmount?: number;
    _isInsuranceExcess?: boolean;
    _insuranceCompanyName?: string;
};

/** เอกสารแก้ได้เฉพาะ `reviewStatusId` / `note` — field อื่นเป็นข้อมูลอ่านอย่างเดียวจาก BE (handoff ข้อ 5) */
export type BillingDocumentFormItem = BillingDocumentDto & { _rowKey: string };

/**
 * ประเภทรายการเคลมของหน้าวางบิลโรงพยาบาล (Sheet 2-4 ของสเปค) — วันนี้ derive จาก query param `?type=`
 * เพราะ `BillingDetailDto` ยังไม่มีฟิลด์บอกประเภทโดยตรง (PENDING_BE_FIELDS.claimListTypeId)
 */
export const BILLING_CLAIM_LIST_TYPES = {
    opdHalf: "opd-half", // Sheet 2 : มี OCR ใบแจ้งค่ารักษา + รายการค่ารักษา(จากโรงพยาบาล)
    opdFull: "opd-full", // Sheet 3 : ไม่มี OCR, มี Sim B1/B2
    ipd: "ipd", // Sheet 4 : IPD — AN, ข้อบ่งชี้ Admit, วันนอน, สรุปค่าชดเชย
} as const;

export type BillingClaimListType = (typeof BILLING_CLAIM_LIST_TYPES)[keyof typeof BILLING_CLAIM_LIST_TYPES];

export type BillingClaimListTypeConfig = {
    label: string;
    hasOcrReceipt: boolean;
    hasHospitalExpenseSummary: boolean;
    hasSimBSelector: boolean;
};

export const BILLING_CLAIM_LIST_TYPE_CONFIG: Record<BillingClaimListType, BillingClaimListTypeConfig> = {
    [BILLING_CLAIM_LIST_TYPES.opdHalf]: {
        label: "OPD Half",
        hasOcrReceipt: true,
        hasHospitalExpenseSummary: true,
        hasSimBSelector: false,
    },
    [BILLING_CLAIM_LIST_TYPES.opdFull]: {
        label: "OPD Full",
        hasOcrReceipt: false,
        hasHospitalExpenseSummary: false,
        hasSimBSelector: true,
    },
    [BILLING_CLAIM_LIST_TYPES.ipd]: {
        label: "IPD",
        hasOcrReceipt: false,
        hasHospitalExpenseSummary: false,
        hasSimBSelector: true,
    },
};

/** แปลงค่าจาก URL (?type=opd-full) เป็นประเภทรายการเคลม — ค่าอื่น/ไม่ระบุ = opd-half (default) */
export const parseBillingClaimListType = (value: string | null): BillingClaimListType => {
    if (value === BILLING_CLAIM_LIST_TYPES.opdFull) return BILLING_CLAIM_LIST_TYPES.opdFull;
    if (value === BILLING_CLAIM_LIST_TYPES.ipd) return BILLING_CLAIM_LIST_TYPES.ipd;
    return BILLING_CLAIM_LIST_TYPES.opdHalf;
};

/**
 * Section "ข้อมูลอุบัติเหตุจากการจราจร" — CR: Traffic Accident and Hospital Document Review
 * ยังไม่มีฟิลด์รองรับใน `BillingClaimDto` (ดู PENDING_BE_FIELDS.trafficAccident) จึงเป็น FE-only
 * ทั้งชุด อยู่ท้าย `BillingReviewFormValues` เหมือนฟิลด์ FE-only อื่น ๆ
 */
export const TRAFFIC_VEHICLE_TYPE = {
    motorcycle: "motorcycle",
    car: "car",
    other: "other",
} as const;
export type TrafficVehicleType = (typeof TRAFFIC_VEHICLE_TYPE)[keyof typeof TRAFFIC_VEHICLE_TYPE];

export const TRAFFIC_VEHICLE_TYPE_OPTIONS: { value: TrafficVehicleType; label: string }[] = [
    { value: TRAFFIC_VEHICLE_TYPE.motorcycle, label: "มอเตอร์ไซค์" },
    { value: TRAFFIC_VEHICLE_TYPE.car, label: "รถยนต์" },
    { value: TRAFFIC_VEHICLE_TYPE.other, label: "อื่นๆ" },
];

export const TRAFFIC_CASUALTY_STATUS = {
    driver: "driver",
    passenger: "passenger",
} as const;
export type TrafficCasualtyStatus = (typeof TRAFFIC_CASUALTY_STATUS)[keyof typeof TRAFFIC_CASUALTY_STATUS];

export const TRAFFIC_CASUALTY_STATUS_OPTIONS: { value: TrafficCasualtyStatus; label: string }[] = [
    { value: TRAFFIC_CASUALTY_STATUS.driver, label: "ผู้ขับขี่" },
    { value: TRAFFIC_CASUALTY_STATUS.passenger, label: "ผู้โดยสาร" },
];

/** เป็นส่วนเกิน พ.ร.บ. — เก็บเป็น boolean ตรง ๆ (ใช่ = true / ไม่ใช่ = false) */
export const TRAFFIC_POROBO_EXCESS_OPTIONS: { value: boolean; label: string }[] = [
    { value: true, label: "ใช่" },
    { value: false, label: "ไม่ใช่" },
];

/**
 * ค่าฟอร์มหน้า "ตรวจสอบรายการวางบิล" — เก็บแบบ flat (ไม่ซ้อนตาม claim/medical ของ DTO)
 *
 * เหตุผล: `ClaimTypeSelector`/`ChipSelector` (ที่ reuse มาเลือก incidentType/coverageType/medicalType)
 * อ่าน `formik.values[idFieldName]` แบบ bracket ตรง ๆ ไม่รองรับ dot-path ซ้อน object จึงต้องเก็บฟิลด์
 * เหล่านี้ไว้ระดับบนสุด ให้เข้ากับ component เดิมได้โดยไม่ต้องแก้ — mapper (`billingMappers.ts`) เป็นตัว
 * ประกอบกลับเป็น `BillingReviewDataDto` ตอนโหลด/ส่ง
 *
 * ฟิลด์ที่ลงท้าย `Name` / `_selectedText` เป็นค่าที่ใช้แสดงผลเท่านั้น ไม่ส่งขึ้น BE ตรง ๆ
 * (ยกเว้น `chiefComplaintId_selectedText` ที่ mapper ใช้เติมค่า `claim.chiefComplaint` แบบ freetext)
 */
export interface BillingReviewFormValues {
    // claim — master IDs
    incidentTypeId: number | undefined;
    incidentTypeName: string | undefined;
    coverageTypeId: number | undefined;
    coverageTypeName: string | undefined;
    medicalTypeId: number | undefined;
    medicalTypeName: string | undefined;
    chiefComplaintId: number | undefined;
    chiefComplaintId_selectedText: string | undefined;
    diagnosis1Id: number | undefined;
    diagnosis2Id: number | undefined;
    diagnosis3Id: number | undefined;

    // claim — วันที่ / เวลา (TimeSpan ของ BE = Dayjs ฝั่งฟอร์ม แปลงตอน map)
    incidentDate: Dayjs | undefined;
    incidentTime: Dayjs | undefined;
    symptomOnsetDate: Dayjs | undefined;
    occurrenceDate: Dayjs | undefined;
    occurrenceTime: Dayjs | undefined;
    admissionDate: Dayjs | undefined;
    admissionTime: Dayjs | undefined;
    dischargeDate: Dayjs | undefined;
    dischargeTime: Dayjs | undefined;

    // claim — ข้อความ
    hn: string;
    vn: string;
    an: string;
    note: string;

    // medical
    underlyingDiseaseDetail: string;
    illnessDetail: string;
    investigationResults: string;
    isProcedurePerformed: boolean | undefined;
    medicalLicenseNo: string;
    physicianName: string;

    // expenses / documents
    expenses: BillingExpenseFormItem[];
    documents: BillingDocumentFormItem[];

    // Step 3 — ผลการตรวจสอบ
    reviewStatusId: BillingStatusId | undefined;
    /** สาเหตุของผลตรวจสอบ — mapper เป็นตัวตัดสินว่าส่งเป็น rejectReasonId (สถานะ 4) หรือ decisionReasonId (2/5) */
    reviewReasonId: number | undefined;
    reviewRemark: string;

    /*
     * ฟิลด์ต่อจากนี้เป็น FE-only ทั้งหมด — เพิ่มเพื่อรองรับ UI ตามสเปคใหม่ที่ contract ปัจจุบันยังไม่มีข้อมูล
     * (ดู PENDING_BE_FIELDS) `toReviewDataDto` (billingMappers.ts) จงใจไม่ map ฟิลด์กลุ่มนี้ขึ้น BE เลย
     * เก็บไว้ในฟอร์มเพื่อให้ section ที่เกี่ยวข้อง bind ค่าได้ตามปกติ (echo-back / placeholder เท่านั้น)
     */

    // เคลมต่อเนื่อง (Step 1)
    isContinuousClaim: boolean;
    continuousClaim: ContinuousClaimSelection | undefined;

    // รายละเอียดเคลม (Step 1) — ฟิลด์ที่สเปคเพิ่มมาแต่ DTO ยังไม่มี
    documentCompleteDate: Dayjs | undefined;
    admitIndication: string;
    ipdDays: number;
    icuDays: number;

    // รายละเอียดค่าใช้จ่าย (Step 2)
    simBCategory: string;

    // สรุปรายการเคลม (Step 3)
    mergeCompensation: boolean;

    // ข้อมูลอุบัติเหตุจากการจราจร (Step 1) — วางบิลเคลมโรงพยาบาล : read-only เสมอ (CR-02)
    trafficVehicleType: TrafficVehicleType | undefined;
    trafficVehicleOther: string;
    trafficCasualtyStatus: TrafficCasualtyStatus | undefined;
    trafficIsPoroboExcess: boolean | undefined;
    trafficNoPoroboReason: string;
}
