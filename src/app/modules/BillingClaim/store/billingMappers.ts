import dayjs, { Dayjs } from "dayjs";
import {
    BillingClaimDto,
    BillingDocumentDto,
    BillingExpenseDto,
    BillingMedicalDto,
    BillingReviewDataDto,
    TimeSpan,
} from "../../../api/coreClaimApi.client";
import { BillingDocumentFormItem, BillingExpenseFormItem, BillingReviewFormValues } from "./billingClaim.types";

/**
 * Boundary ระหว่างรูปแบบข้อมูลบน HTTP กับ TypeScript type ที่ NSwag generate
 *
 * NSwag ไม่รู้จัก C# `TimeSpan` เลย generate เป็น type `TimeSpan` (object `{ticks, hours, ...}`) แต่ค่า
 * จริงบน wire เป็น string `"HH:mm:ss"` (hospital-billing-fe.md ข้อ 3) — แปลงตรงนี้ที่เดียว
 */
export const parseTimeSpan = (raw: unknown): Dayjs | undefined => {
    if (!raw) return undefined;
    if (typeof raw === "string") {
        const parsed = dayjs(`2000-01-01T${raw}`);
        return parsed.isValid() ? parsed : undefined;
    }
    // fallback เผื่อ BE ส่งเป็น object TimeSpan จริง ๆ (ยังไม่พบในทางปฏิบัติ แต่กันไว้)
    const obj = raw as Partial<TimeSpan>;
    if (obj.hours !== undefined || obj.minutes !== undefined || obj.seconds !== undefined) {
        return dayjs()
            .hour(obj.hours ?? 0)
            .minute(obj.minutes ?? 0)
            .second(obj.seconds ?? 0);
    }
    return undefined;
};

/** Dayjs (เวลาที่ผู้ใช้เลือกใน TimePicker) → string `"HH:mm:ss"` สำหรับส่งขึ้น BE */
export const toTimeSpanString = (value: Dayjs | undefined): string | undefined =>
    value && value.isValid() ? value.format("HH:mm:ss") : undefined;

/** เงินทุกช่องต้องมีทศนิยมไม่เกิน 2 ตำแหน่ง (hospital-billing-fe.md ข้อ 3, 6) */
export const round2 = (n: number | undefined): number => Math.round((n ?? 0) * 100) / 100;

/** สร้าง key สำหรับ React list — ใช้ `caseItemId`/`caseDocumentId` เดิมถ้ามี ไม่งั้นสร้างใหม่ */
const makeRowKey = () => `row-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const toExpenseFormItem = (item: BillingExpenseDto): BillingExpenseFormItem => ({
    ...item,
    _rowKey: item.caseItemId ?? makeRowKey(),
    _isNew: false,
});

export const toDocumentFormItem = (item: BillingDocumentDto): BillingDocumentFormItem => ({
    ...item,
    _rowKey: item.caseDocumentId ?? makeRowKey(),
});

/** DTO (ซ้อน claim/medical) → ฟอร์ม flat ตอนโหลด Detail */
export const toFormValues = (data: BillingReviewDataDto): BillingReviewFormValues => {
    const claim = data.claim ?? ({} as BillingClaimDto);
    const medical = data.medical ?? ({} as BillingMedicalDto);

    return {
        incidentTypeId: claim.incidentTypeId,
        incidentTypeName: undefined,
        coverageTypeId: claim.coverageTypeId,
        coverageTypeName: undefined,
        medicalTypeId: claim.medicalTypeId,
        medicalTypeName: undefined,
        chiefComplaintId: claim.chiefComplaintId,
        chiefComplaintId_selectedText: claim.chiefComplaint,
        diagnosis1Id: claim.diagnosis1Id,
        diagnosis2Id: claim.diagnosis2Id,
        diagnosis3Id: claim.diagnosis3Id,

        incidentDate: claim.incidentDate ? dayjs(claim.incidentDate) : undefined,
        incidentTime: parseTimeSpan(claim.incidentTime),
        symptomOnsetDate: claim.symptomOnsetDate ? dayjs(claim.symptomOnsetDate) : undefined,
        occurrenceDate: claim.occurrenceDate ? dayjs(claim.occurrenceDate) : undefined,
        occurrenceTime: parseTimeSpan(claim.occurrenceTime),
        admissionDate: claim.admissionDate ? dayjs(claim.admissionDate) : undefined,
        admissionTime: parseTimeSpan(claim.admissionTime),
        dischargeDate: claim.dischargeDate ? dayjs(claim.dischargeDate) : undefined,
        dischargeTime: parseTimeSpan(claim.dischargeTime),

        hn: claim.hn ?? "",
        vn: claim.vn ?? "",
        an: claim.an ?? "",
        note: claim.note ?? "",

        underlyingDiseaseDetail: medical.underlyingDiseaseDetail ?? "",
        illnessDetail: medical.illnessDetail ?? "",
        investigationResults: medical.investigationResults ?? "",
        isProcedurePerformed: medical.isProcedurePerformed,
        medicalLicenseNo: medical.medicalLicenseNo ?? "",
        physicianName: medical.physicianName ?? "",

        expenses: (data.expenses ?? []).map(toExpenseFormItem),
        documents: (data.documents ?? []).map(toDocumentFormItem),
        ssEndDiscountAmount: data.ssEndDiscountAmount ?? 0,

        reviewStatusId: undefined,
        reviewReasonId: undefined,
        reviewRemark: "",
        rejectionDocuments: [],

        // ฟิลด์ FE-only (ดู comment บน BillingReviewFormValues) — ยังไม่มีค่าจาก BE ให้ sync จึงใช้ default
        isContinuousClaim: false,
        continuousClaim: undefined,
        documentCompleteDate: dayjs(), // สเปค : Default วันที่ปัจจุบัน
        admitIndication: "",
        ipdDays: 0,
        icuDays: 0,
        simBCategory: "SimB2", // สเปค : Default Sim B2
        mergeCompensation: true,
    };
};

const toExpenseDto = (item: BillingExpenseFormItem): BillingExpenseDto => ({
    caseItemId: item._isNew ? undefined : item.caseItemId,
    standardMedicalExpenseId: item.standardMedicalExpenseId,
    itemName: item.itemName,
    claimAmount: round2(item.claimAmount),
    discountAmount: round2(item.discountAmount),
    nonCoveredAmount: round2(item.nonCoveredAmount),
    nonCoveredReasonId: item.nonCoveredAmount && item.nonCoveredAmount > 0 ? item.nonCoveredReasonId : undefined,
    note: item.note,
});

const toDocumentDto = (item: BillingDocumentFormItem): BillingDocumentDto => ({
    caseDocumentId: item.caseDocumentId,
    documentId: item.documentId,
    documentSubTypeId: item.documentSubTypeId,
    documentName: item.documentName,
    fileCount: item.fileCount,
    reviewStatusId: item.reviewStatusId,
    note: item.note,
});

/**
 * ฟอร์ม flat → DTO ซ้อน claim/medical ตอนสร้าง payload submit (ส่งเต็มชุด ไม่ใช่ PATCH)
 *
 * จงใจไม่ map ฟิลด์ FE-only ต่อไปนี้ขึ้น BE เพราะ `BillingReviewDataDto`/`BillingExpenseDto`/`BillingDocumentDto`
 * ยังไม่มี field รองรับ (ดู PENDING_BE_FIELDS ที่ billingPendingFields.ts) : isContinuousClaim, continuousClaim,
 * documentCompleteDate, admitIndication, ipdDays, icuDays, simBCategory, mergeCompensation, rejectionDocuments,
 * รวมถึง `_receiptAmount`/`_entitlementAmount`/`_isInsuranceExcess`/`_insuranceCompanyName` บนแต่ละแถว expenses
 * — ฟิลด์เหล่านี้อยู่ในฟอร์มเพื่อให้ UI bind ค่าได้เท่านั้น ยังไม่ round-trip ขึ้น BE จนกว่า contract จะรองรับ
 */
export const toReviewDataDto = (values: BillingReviewFormValues): BillingReviewDataDto => ({
    claim: {
        incidentTypeId: values.incidentTypeId,
        incidentDate: values.incidentDate,
        incidentTime: toTimeSpanString(values.incidentTime) as unknown as TimeSpan,
        symptomOnsetDate: values.symptomOnsetDate,
        coverageTypeId: values.coverageTypeId,
        medicalTypeId: values.medicalTypeId,
        occurrenceDate: values.occurrenceDate,
        occurrenceTime: toTimeSpanString(values.occurrenceTime) as unknown as TimeSpan,
        admissionDate: values.admissionDate,
        admissionTime: toTimeSpanString(values.admissionTime) as unknown as TimeSpan,
        dischargeDate: values.dischargeDate,
        dischargeTime: toTimeSpanString(values.dischargeTime) as unknown as TimeSpan,
        hn: values.hn,
        vn: values.vn,
        an: values.an,
        chiefComplaintId: values.chiefComplaintId,
        chiefComplaint: values.chiefComplaintId_selectedText,
        diagnosis1Id: values.diagnosis1Id,
        diagnosis2Id: values.diagnosis2Id,
        diagnosis3Id: values.diagnosis3Id,
        note: values.note,
    },
    medical: {
        underlyingDiseaseDetail: values.underlyingDiseaseDetail,
        illnessDetail: values.illnessDetail,
        investigationResults: values.investigationResults,
        isProcedurePerformed: values.isProcedurePerformed,
        medicalLicenseNo: values.medicalLicenseNo,
        physicianName: values.physicianName,
    },
    expenses: values.expenses.map(toExpenseDto),
    documents: values.documents.map(toDocumentDto),
    ssEndDiscountAmount: round2(values.ssEndDiscountAmount),
});
