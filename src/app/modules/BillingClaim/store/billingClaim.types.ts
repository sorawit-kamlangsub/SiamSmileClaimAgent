import { Dayjs } from "dayjs";
import { BillingDocumentDto, BillingExpenseDto } from "../../../api/coreClaimApi.client";

/**
 * สถานะรายการวางบิลเคลมโรงพยาบาล — ตรงกับ contract จริงใน hospital-billing-fe.md ข้อ 4
 * (คนละความหมายกับตัวเลขที่เคยใช้ตอน mock — ห้ามสลับกลับ)
 */
export const BILLING_STATUS = {
    pendingReview: 1, // PendingReview / รอตรวจสอบ
    needsCorrection: 2, // NeedsCorrection / รอแก้ไข
    passed: 3, // Passed / ผ่าน — ไม่รองรับใน Filter, ส่ง statusId=3 จะได้ 400
    rejected: 4, // Rejected / ไม่ผ่าน
    cancelled: 5, // Cancelled / ยกเลิก
} as const;

export type BillingStatusId = (typeof BILLING_STATUS)[keyof typeof BILLING_STATUS];

export const BILLING_STATUS_LABEL: Record<BillingStatusId, string> = {
    [BILLING_STATUS.pendingReview]: "รอตรวจสอบ",
    [BILLING_STATUS.needsCorrection]: "รอแก้ไข",
    [BILLING_STATUS.passed]: "ผ่าน",
    [BILLING_STATUS.rejected]: "ไม่ผ่าน",
    [BILLING_STATUS.cancelled]: "ยกเลิก",
};

/** สถานะที่หน้า list / segmented filter ใช้ได้ (ไม่รวม "ผ่าน") */
export const BILLING_FILTER_STATUS_IDS = [
    BILLING_STATUS.pendingReview,
    BILLING_STATUS.needsCorrection,
    BILLING_STATUS.rejected,
    BILLING_STATUS.cancelled,
] as const;

/** ผลตรวจสอบที่กด submit ได้ใน Step 3 (ไม่รวม "รอตรวจสอบ" — เป็นสถานะเริ่มต้นเท่านั้น) */
export const BILLING_SUBMIT_STATUS_OPTIONS: { value: BillingStatusId; label: string }[] = [
    { value: BILLING_STATUS.passed, label: "ผ่าน" },
    { value: BILLING_STATUS.needsCorrection, label: "รอแก้ไข" },
    { value: BILLING_STATUS.rejected, label: "ไม่ผ่าน" },
    { value: BILLING_STATUS.cancelled, label: "ยกเลิก" },
];

/** ตัวเลือก segmented control ของหน้า list — ตรงกับ BILLING_FILTER_STATUS_IDS (ไม่รวม "ผ่าน") */
export const BILLING_FILTER_STATUS_OPTIONS: { value: BillingStatusId; label: string }[] = [
    { value: BILLING_STATUS.pendingReview, label: "รอตรวจสอบ" },
    { value: BILLING_STATUS.needsCorrection, label: "รอแก้ไข" },
    { value: BILLING_STATUS.rejected, label: "ไม่ผ่าน" },
    { value: BILLING_STATUS.cancelled, label: "ยกเลิก" },
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

/** เพิ่มแถวค่ารักษาใหม่ให้ `caseItemId` ว่างไว้ — BE รู้ว่าเป็นแถวใหม่จากตรงนี้ (handoff ข้อ 5) */
export type BillingExpenseFormItem = BillingExpenseDto & { _rowKey: string; _isNew: boolean };

/** เอกสารแก้ได้เฉพาะ `reviewStatusId` / `note` — field อื่นเป็นข้อมูลอ่านอย่างเดียวจาก BE (handoff ข้อ 5) */
export type BillingDocumentFormItem = BillingDocumentDto & { _rowKey: string };

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

    // expenses / documents / ส่วนลดท้ายบิล
    expenses: BillingExpenseFormItem[];
    documents: BillingDocumentFormItem[];
    ssEndDiscountAmount: number;

    // Step 3 — ผลการตรวจสอบ
    reviewStatusId: BillingStatusId | undefined;
    reviewRemark: string;
}
