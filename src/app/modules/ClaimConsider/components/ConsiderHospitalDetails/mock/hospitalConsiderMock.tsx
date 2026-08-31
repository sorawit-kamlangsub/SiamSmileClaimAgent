import { ClaimTypeOption } from "../../../../CreatedClaim/components/CreateClaim/ClaimTypeSelector";
import { ChipOption } from "../../../../CreatedClaim/components/CreateClaim/ChipSelector";
import { COVERAGE_ICON_MAP, INCIDENT_ICON_MAP } from "../../../../CreatedClaim/components/CreateClaim/ClaimTypeOptions";
import { CauseOfIncident, CoverageType, IncidentType, MedicalType } from "../../../../../functionHelpers";

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

    notificationDate: "17/05/2569 09:38:00",
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
};

/** แปลงค่าจาก URL (?type=opd-full) เป็นประเภทรายการเคลม */
export const parseClaimListType = (value: string | null): ClaimListType =>
    value === CLAIM_LIST_TYPES.opdFull ? CLAIM_LIST_TYPES.opdFull : CLAIM_LIST_TYPES.opdHalf;

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

/** ผลการตรวจเอกสาร (เลือกได้ 1 สถานะต่อรายการ) */
export const DOCUMENT_CHECK_RESULTS = {
    passed: "passed",
    failed: "failed",
    waiting: "waiting",
} as const;

export type DocumentCheckResult = (typeof DOCUMENT_CHECK_RESULTS)[keyof typeof DOCUMENT_CHECK_RESULTS];

export const DOCUMENT_CHECK_RESULT_OPTIONS: { value: DocumentCheckResult; label: string; color: string }[] = [
    { value: DOCUMENT_CHECK_RESULTS.passed, label: "ผ่าน", color: "#178236" },
    { value: DOCUMENT_CHECK_RESULTS.failed, label: "ไม่ผ่าน", color: "#B32615" },
    { value: DOCUMENT_CHECK_RESULTS.waiting, label: "รอเอกสารเพิ่มเติม", color: "#A87808" },
];

export type DocumentCheckRow = {
    documentId: string;
    documentName: string;
    fileCount: number;
    checkResult: DocumentCheckResult | "";
    remark: string;
};

/** รายการเอกสารที่ต้องใช้ประกอบการพิจารณาเคลม ตาม Spec */
export const MOCK_DOCUMENT_CHECK_ROWS: DocumentCheckRow[] = [
    { documentId: "DOC-A", documentName: "แบบฟอร์ม A", fileCount: 2, checkResult: "", remark: "" },
    { documentId: "DOC-INV", documentName: "ใบแจ้งหนี้", fileCount: 1, checkResult: "", remark: "" },
    { documentId: "DOC-INV-DETAIL", documentName: "รายละเอียดใบแจ้งหนี้", fileCount: 1, checkResult: "", remark: "" },
    { documentId: "DOC-LAB", documentName: "ผลการตรวจ LAB / X-ray", fileCount: 0, checkResult: "", remark: "" },
    { documentId: "DOC-OTHER", documentName: "เอกสารอื่นๆ", fileCount: 0, checkResult: "", remark: "" },
    { documentId: "DOC-ID-CARD", documentName: "บัตรประชาชน", fileCount: 1, checkResult: "", remark: "" },
    { documentId: "DOC-BUNDLE", documentName: "ชุดรวมเอกสาร", fileCount: 0, checkResult: "", remark: "" },
];
