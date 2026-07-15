import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../../../redux";
import dayjs, { Dayjs } from "dayjs";
import { ClaimBankAccount, ContactInfo, DiagnosisModel, SpecifyHospital, SymptomType } from "./claimPHSlice";
import {
    CaseDocumentDetailCreateRequest,
    GetContactPersonDtoResponse,
    GetCustomerBankAccountDtoResponse,
    GetCustomerDetailByIdDtoResponse,
} from "../../../api/coreClaimApi.client";

// export interface InsuredInfoPA {
//     appId: string;
//     customerName: string;
//     prefix: string;
//     firstName: string;
//     lastName: string;
//     nationalId: string;
//     passport: string;
//     plan: string;
//     startCoverDate: string;
//     effectiveDate: string;
//     endCoverDate: string;
//     insuredType: "นักเรียน" | "บุคลากร" | "";
//     schoolName: string;
// }

export interface SchoolInfo {
    appId: string;
    schoolName: string;
    teacherName: string;
    teacherPhone: string;
}

export interface ClaimInsuredItem {
    id: string;
    seq: number;
    customerName: string;
    claimStyle: string;
    incidentDate: Dayjs;
    claimAmount: number;
}

export interface ClaimPAFormValues {
    // ผู้รับเอกสาร
    documentRecipientTypeId: number | undefined;
    documentRecipientTypeName: string | undefined;
    // ผู้ให้บริการ
    serviceProviderId: number | undefined;
    serviceProviderCode: string | undefined;
    serviceProviderName: string | undefined;
    // เจ้าของรถ
    zebraId: number | undefined;
    zebraCode: string | undefined;
    zebraNo: string | undefined;
    employeeCode: string | undefined;
    employeeName: string | undefined;
    //เหตุของการเคลม
    incidentTypeId: number | undefined;
    incidentTypeName: string | undefined;
    //ประเภทความคุ้มครอง
    coverageTypeId: number | undefined;
    coverageTypeName: string | undefined;
    //ประเภทการรักษา
    medicalTypeId: number | undefined;
    medicalTypeName: string | undefined;
    //สาเหตุการเสียชีวิต/สูญเสียอวัยวะ
    causeOfIncidentId: number | undefined;
    causeOfIncidentName: string | undefined;
    incidentDate: Dayjs | undefined; //วันที่เกิดเหตุ
    admissionDate: Dayjs | undefined; //วันที่เข้า รพ
    dischargeDate: Dayjs | undefined; //วันที่ออก รพ
    documentCompleteDate: Dayjs | undefined; //วันที่เอกสารครบ
    notificationDate: Dayjs | undefined; //วันที่รับแจ้ง
    deathDate: Dayjs | undefined; //วันที่เสียชีวิต
    transferAmount: number | undefined; //เงินโอน
    symptomType: SymptomType | undefined;
    specifyHospital: SpecifyHospital | undefined;
    hospitalId: number | undefined;
    hospitalName: string | undefined;
    diagnoses: DiagnosisModel[];
    accidentPlace: string | undefined;
    chiefComplaintId: number | undefined;
    chiefComplaintId_selectedText: string | undefined;
    remark: string | undefined;
    ocrDocument: CaseDocumentDetailCreateRequest[] | undefined;
}

interface ClaimPAState {
    isContinuous: boolean;
    insured: GetCustomerDetailByIdDtoResponse | undefined;
    school: SchoolInfo | null;
    form: ClaimPAFormValues;
    claimItems: ClaimInsuredItem[]; // รายการผู้เอาประกันในตาราง
    bankAccounts: ClaimBankAccount[];
    contacts: ContactInfo[];
    editingItemId: string | null; // id ของ row ที่กำลังแก้ไข
}

const defaultForm: ClaimPAFormValues = {
    documentRecipientTypeId: 2,
    documentRecipientTypeName: undefined,
    serviceProviderId: undefined,
    serviceProviderCode: undefined,
    serviceProviderName: undefined,
    zebraId: undefined,
    zebraCode: undefined,
    zebraNo: undefined,
    employeeCode: undefined,
    employeeName: undefined,
    incidentTypeId: undefined,
    incidentTypeName: undefined,
    coverageTypeId: undefined,
    coverageTypeName: undefined,
    medicalTypeId: undefined,
    medicalTypeName: undefined,
    causeOfIncidentId: undefined,
    causeOfIncidentName: undefined,
    incidentDate: dayjs(),
    admissionDate: dayjs(),
    dischargeDate: dayjs(),
    deathDate: dayjs(),
    documentCompleteDate: dayjs(),
    notificationDate: dayjs(),
    transferAmount: 0,
    symptomType: 1,
    specifyHospital: 1,
    hospitalId: undefined,
    hospitalName: undefined,
    diagnoses: [
        {
            icd10Id: undefined,
            icd10Detail: undefined,
        },
    ],
    accidentPlace: undefined,
    chiefComplaintId: undefined,
    chiefComplaintId_selectedText: undefined,
    remark: undefined,
    ocrDocument: [],
};

const initialState: ClaimPAState = {
    isContinuous: false,
    insured: undefined,
    school: null,
    form: defaultForm,
    claimItems: [],
    bankAccounts: [],
    contacts: [],
    editingItemId: null,
};

const claimPASlice = createSlice({
    name: "claimPA",
    initialState,
    reducers: {
        setIsContinuous(state, action: PayloadAction<boolean>) {
            state.isContinuous = action.payload;
        },
        setInsured(state, action: PayloadAction<GetCustomerDetailByIdDtoResponse | undefined>) {
            state.insured = action.payload;
        },
        setSchool(state, action: PayloadAction<SchoolInfo | null>) {
            state.school = action.payload;
        },
        setClaimForm(state, action: PayloadAction<Partial<ClaimPAFormValues>>) {
            state.form = { ...state.form, ...action.payload };
        },
        resetClaimForm(state) {
            state.form = defaultForm;
        },
        // ── ClaimItems ──
        addClaimItem(state, action: PayloadAction<ClaimInsuredItem>) {
            state.claimItems.push(action.payload);
        },
        updateClaimItem(state, action: PayloadAction<ClaimInsuredItem>) {
            const idx = state.claimItems.findIndex((i) => i.id === action.payload.id);
            if (idx !== -1) state.claimItems[idx] = action.payload;
        },
        removeClaimItem(state, action: PayloadAction<string>) {
            state.claimItems = state.claimItems.filter((i) => i.id !== action.payload);
        },
        setEditingItemId(state, action: PayloadAction<string | null>) {
            state.editingItemId = action.payload;
        },
        // ── BankAccounts (เหมือน PH) ──
        setBankAccounts(state, action: PayloadAction<GetCustomerBankAccountDtoResponse[]>) {
            state.bankAccounts = action.payload.map((item, index) => ({
                ...item,
                id: String(item.indexId ?? index),
                isDefault: index === 0,
            }));
        },
        selectBankAccount(state, action: PayloadAction<string>) {
            state.bankAccounts = state.bankAccounts.map((b) => ({
                ...b,
                isDefault: b.id === action.payload,
            }));
        },
        addBankAccount(state, action: PayloadAction<ClaimBankAccount>) {
            state.bankAccounts = state.bankAccounts.map((b) => ({
                ...b,
                isDefault: false,
            }));

            state.bankAccounts.push({
                ...action.payload,
                isDefault: true,
            });
        },
        setContacts(state, action: PayloadAction<GetContactPersonDtoResponse[]>) {
            state.contacts = action.payload.map((item, index) => ({
                ...item,
                id: String(item.indexId ?? index),
                isDefault: index === 0,
            }));
        },
        selectContact(state, action: PayloadAction<string>) {
            state.contacts = state.contacts.map((b) => ({
                ...b,
                isDefault: b.id === action.payload,
            }));
        },
        addContact(state, action: PayloadAction<ContactInfo>) {
            state.contacts = state.contacts.map((b) => ({
                ...b,
                isDefault: false,
            }));

            state.contacts.push({
                ...action.payload,
                isDefault: true,
            });
        },
        removeBankAccount(state, action: PayloadAction<string>) {
            const idx = state.bankAccounts.findIndex((b) => b.id === action.payload);
            const wasDefault = state.bankAccounts[idx].isDefault;
            state.bankAccounts.splice(idx, 1);
            if (wasDefault && state.bankAccounts.length > 0)
                state.bankAccounts[state.bankAccounts.length - 1].isDefault = true;
        },
        // ── Contacts (เหมือน PH) ──
        removeContact(state, action: PayloadAction<string>) {
            const idx = state.contacts.findIndex((c) => c.id === action.payload);
            const wasDefault = state.contacts[idx].isDefault;
            state.contacts.splice(idx, 1);
            if (wasDefault && state.contacts.length > 0) state.contacts[state.contacts.length - 1].isDefault = true;
        },
        setClaimItems(state, action: PayloadAction<ClaimInsuredItem[]>) {
            state.claimItems = action.payload;
        },
        resetState: () => initialState,
    },
});

export const {
    setIsContinuous,
    setInsured,
    setSchool,
    setClaimForm,
    resetClaimForm,
    addClaimItem,
    updateClaimItem,
    removeClaimItem,
    setEditingItemId,
    setBankAccounts,
    addBankAccount,
    removeBankAccount,
    selectBankAccount,
    setContacts,
    addContact,
    removeContact,
    selectContact,
    setClaimItems,
    resetState,
} = claimPASlice.actions;

export const claimPASelector = (state: RootState) => state.claimpa;

export default claimPASlice.reducer;
