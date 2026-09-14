import { ClaimTypeOption } from "../../../../CreatedClaim/components/CreateClaim/ClaimTypeSelector";
import { ChipOption } from "../../../../CreatedClaim/components/CreateClaim/ChipSelector";
import { COVERAGE_ICON_MAP, INCIDENT_ICON_MAP } from "../../../../CreatedClaim/components/CreateClaim/ClaimTypeOptions";
import { CauseOfIncident, CoverageType, IncidentType, MedicalType } from "../../../../../functionHelpers";
import { Dayjs } from "dayjs";

/**
 * Mock data สำหรับหน้า "พิจารณาเคลม - เคลมโรงพยาบาล (OPD Half)"
 *
 * หน้านี้เป็น Mock UI ตาม Spec ยังไม่ได้เชื่อม API ของฝั่งเคลมโรงพยาบาล
 * ข้อมูล Master (สถานพยาบาล / ICD10 / อาการสำคัญ) ยังใช้ Dropdown ตัวจริงของโปรเจค
 */

/** ข้อมูลผู้เอาประกัน + ข้อมูลเคลม ที่แสดงบน Header ของหน้า */
export const MOCK_HOSPITAL_CLAIM = {
    customerName: "นายกฤตภาส จันทร์เพ็ญ",
    idCardNo: "8220465383177",
    applicationId: "0001409",
    phoneNumber: "081-233-4444",
    appStatus: "ปกติ",
    appStatusId: 1,
    policyAgeText: "10 ปี 2 เดือน 9 วัน",
    coverageStartDate: "01/01/2559",
    coverageEndDate: "-",
    productDetail: "PH - ประกันสุขภาพ",

    createdDate: "17/05/2569 09:38:00",
    hospitalName: "โรงพยาบาลสินแพทย์",
    province: "กรุงเทพมหานคร",
    claimStatus: "Open",
    claimStatusId: 1,
    claimNo: "CL6905000124",
    caseNo: "CC6905000082",
    claimType: "เคลมโรงพยาบาล",
    createByUserName: "ระบบ SmileConnect",
    branchName: "สำนักงานใหญ่",
};

/**
 * ประเภทรายการเคลมของเคลมโรงพยาบาล
 *
 * Step 1 (บันทึกข้อมูลเคลม) ใช้ร่วมกันได้ทุกประเภท
 * ความต่างอยู่ที่ Step 2 (รายละเอียดค่าใช้จ่าย)
 */
export const CLAIM_LIST_TYPES = {
    opdHalf: "opd-half",
    opdFull: "opd-full",
    ipd: "ipd",
} as const;

export type ClaimListType = (typeof CLAIM_LIST_TYPES)[keyof typeof CLAIM_LIST_TYPES];

export type ClaimListTypeConfig = {
    /** ชื่อที่ใช้แสดงบนหน้าจอ */
    label: string;
    /**
     * ต้องอัปโหลดใบแจ้งค่ารักษาให้ OCR อ่านหรือไม่
     *
     * OPD Half โรงพยาบาลส่งมาแค่ยอดรวม ผู้พิจารณาต้องกรอกรายการค่ารักษาเอง
     * จึงมี OCR ช่วย ส่วน OPD Full โรงพยาบาลส่งรายการมาครบแล้ว
     */
    hasOcrReceipt: boolean;
    /** แสดง Section รายการค่ารักษา (จากโรงพยาบาล) ที่ดึงจาก SmileConnect */
    hasHospitalExpenseSummary: boolean;
    /** ให้เลือกประเภทรายการค่าใช้จ่าย Sim B1 / Sim B2 (Default Sim B2) */
    hasSimBSelector: boolean;
    /** จำนวนรายการค่ารักษาสูงสุดที่บันทึกได้ (undefined = ไม่จำกัด) */
    maxExpenseRows?: number;
};

export const CLAIM_LIST_TYPE_CONFIG: Record<ClaimListType, ClaimListTypeConfig> = {
    [CLAIM_LIST_TYPES.opdHalf]: {
        label: "OPD Half",
        hasOcrReceipt: true,
        hasHospitalExpenseSummary: true,
        hasSimBSelector: false,
        maxExpenseRows: 1,
    },
    [CLAIM_LIST_TYPES.opdFull]: {
        label: "OPD Full",
        hasOcrReceipt: false,
        hasHospitalExpenseSummary: false,
        hasSimBSelector: true,
    },
    [CLAIM_LIST_TYPES.ipd]: {
        label: "IPD",
        hasOcrReceipt: false,
        hasHospitalExpenseSummary: false,
        hasSimBSelector: true,
    },
};

/** แปลงค่าจาก URL (?type=opd-full) เป็นประเภทรายการเคลม */
export const parseClaimListType = (value: string | null): ClaimListType => {
    if (value === CLAIM_LIST_TYPES.opdFull) return CLAIM_LIST_TYPES.opdFull;
    if (value === CLAIM_LIST_TYPES.ipd) return CLAIM_LIST_TYPES.ipd;
    return CLAIM_LIST_TYPES.opdHalf;
};

/** เหตุของการเคลม (Spec : เจ็บป่วย / อุบัติเหตุ) */
export const MOCK_INCIDENT_TYPES: ClaimTypeOption[] = [
    { id: IncidentType.Illness, name: "เจ็บป่วย", icon: INCIDENT_ICON_MAP[IncidentType.Illness] },
    { id: IncidentType.Accident, name: "อุบัติเหตุ", icon: INCIDENT_ICON_MAP[IncidentType.Accident] },
];

/** ประเภทความคุ้มครอง (Spec : ค่ารักษา เป็นค่า Default) */
export const MOCK_COVERAGE_TYPES: ClaimTypeOption[] = [
    { id: CoverageType.Medical, name: "ค่ารักษา", icon: COVERAGE_ICON_MAP[CoverageType.Medical] },
];

/** ประเภทการรักษา (Spec : OPD / IPD / Day Case Surgery) */
export const MOCK_MEDICAL_TYPES: ChipOption[] = [
    { id: MedicalType.OPD, name: "OPD" },
    { id: MedicalType.IPD, name: "IPD" },
    { id: MedicalType.DayCaseSurgery, name: "Day Case Surgery" },
];

export const MOCK_CAUSE_OF_INCIDENTS: ChipOption[] = [
    { id: CauseOfIncident.Illness, name: "โรคทั่วไป" },
    { id: CauseOfIncident.Accident, name: "อุบัติเหตุทั่วไป" },
];

/** สาเหตุของผลการพิจารณา (รอเอกสาร / รอแก้ไข / ปฏิเสธ / ยกเลิก) */
export const MOCK_DECISION_REASONS = [
    { decisionReasonId: 1, decisionReasonName: "บันทึกข้อมูลในระบบไม่ถูกต้อง" },
    { decisionReasonId: 2, decisionReasonName: "บันทึกยอดเงินในระบบไม่ถูกต้อง" },
    { decisionReasonId: 3, decisionReasonName: "ข้อมูลผู้เอาประกันไม่ถูกต้อง" },
    { decisionReasonId: 4, decisionReasonName: "ข้อมูลการรักษาไม่ถูกต้อง" },
    { decisionReasonId: 5, decisionReasonName: "ไม่มีไฟล์สแกน" },
    { decisionReasonId: 6, decisionReasonName: "อนุมัติบางส่วน" },
    { decisionReasonId: 7, decisionReasonName: "อยู่ในระยะรอคอย" },
    { decisionReasonId: 8, decisionReasonName: "เป็นข้อยกเว้นของกรมธรรม์" },
    { decisionReasonId: 9, decisionReasonName: "เป็นโรคยกเว้นของกรมธรรม์" },
    { decisionReasonId: 10, decisionReasonName: "ไม่มีความคุ้มครอง" },
    { decisionReasonId: 11, decisionReasonName: "เต็มสิทธิ์ความคุ้มครอง" },
    { decisionReasonId: 12, decisionReasonName: "เกินระยะดำเนินการ" },
    { decisionReasonId: 13, decisionReasonName: "ผู้เอาประกันขอยกเลิกเคลม" },
    { decisionReasonId: 14, decisionReasonName: "โรงพยาบาลยกเลิกรายการ" },
    { decisionReasonId: 15, decisionReasonName: "แจ้งเคลมซ้ำ" },
    { decisionReasonId: 16, decisionReasonName: "บันทึกข้อมูลผิดรายการ" },
    { decisionReasonId: 17, decisionReasonName: "ไม่ประสงค์ดำเนินการต่อ" },
];

/** รายการเคลมที่เลือกได้ใน Modal "เลือกเคลมต่อเนื่อง" */
export type ContinuousClaimRow = {
    claimNo: string;
    chiefComplaint: string;
    incidentDate: string;
    totalClaimAmount: number;
    totalPaidAmount: number;
    admissionDate: string;
    claimInfo: string;
    diagnosis1: string;
    remainingLimit: number;

    /** เลขที่เคสของเคลมเดิม + สถานะ (ใช้แสดงความต่อเนื่องของการรักษา) */
    previousCaseNo: string;
    previousCaseStatus: string;

    /** ค่าดิบ (ไม่ format) ไว้ map ลง formik ตอนเลือกเคลมต่อเนื่อง — incidentDate/chiefComplaint ด้านบน
     * เป็น string ที่ format ไว้แสดงผลในตารางแล้วเท่านั้น ใช้ set ลง formik โดยตรงไม่ได้ */
    incidentDateRaw?: Dayjs;
    chiefComplaintIdRaw?: number;
};

export const MOCK_CONTINUOUS_CLAIMS: ContinuousClaimRow[] = [
    {
        claimNo: "CL6904000193",
        chiefComplaint: "0024 : ไข้ + ปวดท้อง",
        incidentDate: "25/03/2569",
        totalClaimAmount: 2350,
        totalPaidAmount: 1800,
        admissionDate: "28/04/2569",
        claimInfo: "เจ็บป่วย / ค่ารักษา / OPD",
        diagnosis1: "A050 : Food-borne staphylococcal intoxication | อาหารเป็นพิษ",
        remainingLimit: 3200,
        previousCaseNo: "CC6904000193-01",
        previousCaseStatus: "อนุมัติแล้ว",
    },
    {
        claimNo: "CL6903000021",
        chiefComplaint: "0031 : ไอ + เจ็บคอ",
        incidentDate: "11/02/2569",
        totalClaimAmount: 1500,
        totalPaidAmount: 1500,
        admissionDate: "11/02/2569",
        claimInfo: "เจ็บป่วย / ค่ารักษา / OPD",
        diagnosis1: "J02.9 : Acute pharyngitis, unspecified | คออักเสบเฉียบพลัน",
        remainingLimit: 8970,
        previousCaseNo: "CC6903000021-01",
        previousCaseStatus: "อนุมัติแล้ว",
    },
];

/**
 * ผลการตรวจเอกสาร (เลือกได้ 1 สถานะต่อรายการ)
 *
 * ค่าที่เก็บคือ documentReviewStatusId จาก /api/Masters/document/review/status
 * ตัวเลือก + ลำดับ ดึงจาก API ส่วนสีกำหนดฝั่ง FE (API ไม่ได้ส่งสีมา)
 */
export const DOCUMENT_CHECK_RESULTS = {
    passed: 2,
    failed: 3,
    waiting: 4,
} as const;

/** ค่าผลการตรวจเอกสาร = documentReviewStatusId */
export type DocumentCheckResult = number;

export type DocumentCheckResultOption = { value: DocumentCheckResult; label: string; color: string };

/** สีประจำผลการตรวจเอกสารแต่ละสถานะ (key = documentReviewStatusId) */
export const DOCUMENT_CHECK_RESULT_COLORS: Record<number, string> = {
    [DOCUMENT_CHECK_RESULTS.passed]: "#178236",
    [DOCUMENT_CHECK_RESULTS.failed]: "#B32615",
    [DOCUMENT_CHECK_RESULTS.waiting]: "#A87808",
};

/** สีสำรองเมื่อเจอสถานะที่ยังไม่ได้กำหนดสี */
export const DOCUMENT_CHECK_RESULT_FALLBACK_COLOR = "#5A6B7B";

/** ไฟล์สแกนของเอกสารแต่ละรายการ (ใช้แสดงในหน้าดูรายละเอียดเอกสาร) */
export type DocumentFile = {
    fileId: string;
    fileName: string;
    fileType: string;
    fileSize: string;
    uploadedDate: string;
    uploadedBy: string;
};

export type DocumentCheckRow = {
    documentId: string;
    /** documentSubTypeId จาก overview — ใช้ประกอบลิงก์ไปแนบเอกสารที่ DocStorage */
    documentSubTypeId?: number;
    /** documentCode (รูปแบบ DOC.....) จาก GET /document/case/filter — ส่งเป็น caseDocument[].documentNo */
    documentCode?: string;
    documentName: string;
    files: DocumentFile[];
    checkResult: DocumentCheckResult | "";
    remark: string;
};
