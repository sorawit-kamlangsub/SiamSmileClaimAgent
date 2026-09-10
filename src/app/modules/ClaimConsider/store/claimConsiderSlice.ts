import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import dayjs, { Dayjs } from "dayjs";
import { RootState } from "../../../../redux";
import { CalculateCaseClaimDtoResponse } from "../../../api/coreClaimApi.client";
import { ContinuousClaimRow } from "../components/ConsiderHospitalDetails/mock/hospitalConsiderMock";

export interface DiagnosisModel {
    icd10Id?: number;
    icd10Detail?: string;
}
export interface CaseDocumentConsiderRequest {
    caseDocumentId?: string;
    documentId?: string;
    documentNo?: string | undefined;
    documentSubTypeId?: number | undefined;
    caseDocumentDetail?: OcrReceiptRequest[] | undefined;
}
export interface OcrReceiptRequest {
    caseDocumentDetailId?: string;
    firstName?: string | undefined;
    lastName?: string | undefined;
    fullName?: string | undefined;
    hospitalName?: string | undefined;
    receiptAdmissionDate?: dayjs.Dayjs | undefined;
    receiptNumber?: string | undefined;
    receiptAmount?: number | undefined;
    ocrDocumentTypeId?: number | undefined;
    ocrResult?: string | undefined;
}

export interface ClaimExpenseItem {
    id?: number;
    standardMedicalExpenseId?: number | undefined;
    inputToStandardMappingId?: number | undefined;
    caseItemId?: string | undefined;
    code?: string | undefined;
    description?: string | undefined;
    receiptAmount?: number;
    claimAmount?: number;
    discount?: number | undefined;
    notCovered?: number;
    reason?: number | undefined;
    remark?: string | undefined;
    color?: string;
    disabled: boolean;
    maximumLimit?: number | undefined;
    bodyPartId?: number | undefined;
}

export interface ClaimConsiderValues {
    //เหตุของการเคลม
    incidentTypeId: number | undefined;
    incidentTypeName: string | undefined;
    //ประเภทความคุ้มครอง
    coverageTypeId: number | undefined;
    coverageTypeName: string | undefined;
    //ประเภทการรักษา
    medicalTypeId: number | undefined;
    medicalTypeName: string | undefined;
    // //สาเหตุการเสียชีวิต/สูญเสียอวัยวะ
    // causeOfIncidentId: number | undefined;
    // causeOfIncidentName: string | undefined;
    incidentDate: Dayjs | undefined; //วันที่เกิดเหตุ
    incidentTime: Dayjs | undefined;
    admissionDate: Dayjs | undefined; //วันที่เข้า รพ
    admissionTime: Dayjs | undefined;
    dischargeDate: Dayjs | undefined; //วันที่ออก รพ
    dischargeTime: Dayjs | undefined;
    documentCompleteDate: Dayjs | undefined; //วันที่เอกสารครบ
    createdDate: Dayjs | undefined; //วันที่แจ้ง
    // deathDate: Dayjs | undefined; //วันที่เสียชีวิต
    // deathTime: Dayjs | undefined;
    /** เคลมต่อเนื่อง */
    isContinuousClaim: boolean;
    continuousClaim: ContinuousClaimRow | undefined;
    ipdDays: number;
    icuDays: number;
    totalDays: number;
    hospitalId: number | undefined;
    hospitalName: string | undefined;
    diagnoses: DiagnosisModel[];
    accidentPlace: string | undefined;
    chiefComplaintId: number | undefined;
    chiefComplaintId_selectedText: string | undefined;
    detail: string | undefined;
    considerResult: number | undefined;
    decisionReasonId: number | undefined;
    decisionReasonDetail: string | undefined;
    considerDocument: CaseDocumentConsiderRequest[] | undefined;
}

/** ข้อมูลแบบร่างที่กำลังเปิดดู (กดจากปุ่มดวงตาในแท็บ "ประวัติการทำรายการ") — 3 field ล่างมาจากแถว
 * transaction log โดยตรง ไม่ใช่จาก draft API เก็บเป็น string เท่านั้น (Dayjs ไม่ serializable ทำให้ RTK
 * ต้อง deep-scan ทั้ง store ทุก dispatch จนหน้าค้าง) */
export interface ViewingDraftInfo {
    draftRevisionId: string;
    createdDate?: string;
    employeeName?: string;
    transactionLogRemark?: string;
}

interface ClaimConsiderState {
    form: ClaimConsiderValues;
    filledItems: ClaimExpenseItem[];
    /** caseId ที่ filledItems ชุดปัจจุบันเป็นของจริง — resetState() ตอน unmount หน้าเก่ามาไม่ทันเสมอ เพราะ
     * React render โครงสร้างของหน้าเคสใหม่ (รวม useFormik lazy-init ที่อ่าน filledItems) เสร็จก่อน effect
     * cleanup ของ instance เก่าจะรันเสมอ (render phase มาก่อน commit/effect phase) ต้องแปะ caseId มากับ
     * filledItems เองแล้วให้ ClaimExpenseDetailHook เช็คตรงนี้แทนที่จะเชื่อ filledItems เฉย ๆ */
    filledItemsCaseId: string | null;
    calculateResult: CalculateCaseClaimDtoResponse | null;
    /** adjudication ของ case ที่กำลังพิจารณา ได้จาก /standard-medical-expense/case ส่งต่อให้ payload คำนวณ */
    caseAdjudicationId: string | null;
    viewingDraft: ViewingDraftInfo | null;
    /** revisionId ที่ merge ลง filledItems ไปแล้ว — เก็บใน Redux ไม่ใช่ ref เพราะ ExpenseDetails
     * ถูก unmount ทุกครั้งที่สลับ step (activeStep === 1) ถ้าใช้ ref จะ merge ทับงานที่ผู้ใช้แก้ไปแล้วซ้ำ */
    draftExpenseAppliedRevisionId: string | null;
}
const defaultForm: ClaimConsiderValues = {
    incidentTypeId: undefined,
    incidentTypeName: undefined,
    coverageTypeId: undefined,
    coverageTypeName: undefined,
    medicalTypeId: undefined,
    medicalTypeName: undefined,
    // causeOfIncidentId: undefined,
    // causeOfIncidentName: undefined,
    incidentDate: undefined,
    incidentTime: undefined,
    admissionDate: undefined,
    admissionTime: undefined,
    dischargeDate: undefined,
    dischargeTime: undefined,
    // deathDate: undefined,
    // deathTime: undefined,
    isContinuousClaim: false,
    continuousClaim: undefined,
    ipdDays: 0,
    icuDays: 0,
    totalDays: 0,
    documentCompleteDate: undefined,
    createdDate: undefined,
    hospitalId: undefined,
    hospitalName: undefined,
    diagnoses: [
        { icd10Id: undefined, icd10Detail: undefined },
        { icd10Id: undefined, icd10Detail: undefined },
        { icd10Id: undefined, icd10Detail: undefined },
    ],
    accidentPlace: undefined,
    chiefComplaintId: undefined,
    chiefComplaintId_selectedText: undefined,
    detail: undefined,
    considerResult: undefined,
    decisionReasonId: undefined,
    decisionReasonDetail: undefined,
    considerDocument: undefined,
};
const initialState: ClaimConsiderState = {
    form: defaultForm,
    filledItems: [],
    filledItemsCaseId: null,
    calculateResult: null,
    caseAdjudicationId: null,
    viewingDraft: null,
    draftExpenseAppliedRevisionId: null,
};

const claimConsiderSlice = createSlice({
    name: "claimConsider",
    initialState,
    reducers: {
        setClaimForm(state, action: PayloadAction<Partial<ClaimConsiderValues>>) {
            state.form = { ...state.form, ...action.payload };
        },
        resetClaimForm(state) {
            state.form = defaultForm;
        },
        setFilledClaimLineItems(
            state,
            action: PayloadAction<{ items: ClaimExpenseItem[]; caseId: string | undefined }>
        ) {
            state.filledItems = action.payload.items;
            state.filledItemsCaseId = action.payload.caseId ?? null;
        },
        updateFilledClaimLineItem(state, action: PayloadAction<ClaimExpenseItem>) {
            const idx = state.filledItems.findIndex((i) => i.id === action.payload.id);
            if (idx !== -1) state.filledItems[idx] = action.payload;
        },
        removeFilledClaimLineItem(state, action: PayloadAction<number>) {
            state.filledItems = state.filledItems.filter((i) => i.id !== action.payload);
        },
        setCalculateExpenseResult(state, action: PayloadAction<CalculateCaseClaimDtoResponse | null>) {
            state.calculateResult = action.payload;
        },
        setCaseAdjudicationId(state, action: PayloadAction<string | null>) {
            state.caseAdjudicationId = action.payload;
        },
        setViewingDraft(state, action: PayloadAction<ViewingDraftInfo>) {
            state.viewingDraft = action.payload;
            state.draftExpenseAppliedRevisionId = null; // revision ใหม่ = ต้อง merge รายการค่าใช้จ่ายใหม่
        },
        setDraftExpenseApplied(state, action: PayloadAction<string>) {
            state.draftExpenseAppliedRevisionId = action.payload;
        },
        resetState: () => initialState,
    },
});

export const {
    setClaimForm,
    resetClaimForm,
    setFilledClaimLineItems,
    updateFilledClaimLineItem,
    removeFilledClaimLineItem,
    setCalculateExpenseResult,
    setCaseAdjudicationId,
    setViewingDraft,
    setDraftExpenseApplied,
    resetState,
} = claimConsiderSlice.actions;

export const claimConsiderSelector = (state: RootState) => state.claimConsider;

export default claimConsiderSlice.reducer;
