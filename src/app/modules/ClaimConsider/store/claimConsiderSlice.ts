import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import dayjs, { Dayjs } from "dayjs";
import { RootState } from "../../../../redux";

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
    notificationDate: Dayjs | undefined; //วันที่รับแจ้ง
    // deathDate: Dayjs | undefined; //วันที่เสียชีวิต
    // deathTime: Dayjs | undefined;
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

interface ClaimConsiderState {
    form: ClaimConsiderValues;
    filledItems: ClaimExpenseItem[];
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
    ipdDays: 0,
    icuDays: 0,
    totalDays: 0,
    documentCompleteDate: undefined,
    notificationDate: undefined,
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
        setFilledClaimLineItems(state, action: PayloadAction<ClaimExpenseItem[]>) {
            state.filledItems = action.payload;
        },
        updateFilledClaimLineItem(state, action: PayloadAction<ClaimExpenseItem>) {
            const idx = state.filledItems.findIndex((i) => i.id === action.payload.id);
            if (idx !== -1) state.filledItems[idx] = action.payload;
        },
        removeFilledClaimLineItem(state, action: PayloadAction<number>) {
            state.filledItems = state.filledItems.filter((i) => i.id !== action.payload);
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
    resetState,
} = claimConsiderSlice.actions;

export const claimConsiderSelector = (state: RootState) => state.claimConsider;

export default claimConsiderSlice.reducer;
