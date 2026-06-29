import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../../../redux";
import dayjs, { Dayjs } from "dayjs";
import { GetCustomerDetailByIdDtoResponse } from "../../../api/coreClaimApi.client";

export type ClaimType = 2 | 3 | 4 | 5 | 6;
export type OpdSubType = 2 | 3; // 2=Illness, 3=Accident
export type IpdSubType = "ค่ารักษาพยาบาล" | "ค่าชดเชย";
export type SymptomType = "ระบุอาการ" | "อื่นๆ";
export type DocumentReceiver = "ผู้ให้บริการ" | "FCNT (สกลนคร)" | "Pivot";

export interface ClaimCaseItem {
    seq: number;
    claimCase: string;
    claimType: string;
    chiefComplain: string;
    admitDate: string;
    status: string;
    claimAmount: number;
    paidAmount: number;
}

export interface OldClaimInfo {
    claimNo: string;
    incidentDate: string;
    diagnosis: string;
    totalClaim: number;
    totalPaid: number;
    remainingBudget: number;
    remainingCount: number;
    cases: ClaimCaseItem[];
    isHidden: boolean;
}

export interface ClaimFormValues {
    documentReceiver: number | undefined;
    documentReceiverLabel: string | undefined; // เพิ่ม
    serviceProvider: number | undefined;
    serviceProviderLabel: string | undefined; // เพิ่ม
    carOwner: string | undefined;
    incidentTypeId: number | undefined;
    incidentTypeName: string | undefined;
    coverageTypeId: number | undefined;
    coverageTypeName: string | undefined;
    medicalTypeId: number | undefined;
    medicalTypeName: string | undefined;
    causeOfIncidentId: number | undefined;
    causeOfIncidentName: string | undefined;
    incidentDate: Dayjs | undefined;
    admissionDate: Dayjs | undefined;
    receiveDocDate: Dayjs | undefined;
    deathDate: Dayjs | undefined;
    claimAmount: number | undefined;
    symptomType: SymptomType | undefined;
    chiefComplain: string | undefined;
    remark: string | undefined;
}

export interface BankAccount {
    id: string;
    relationship: string;
    bankId: number;
    bankName: string;
    accountNo: string;
    accountName: string;
    isDefault: boolean;
    isFromMock?: boolean;
}

export interface ContactInfo {
    id: string;
    relationship: string;
    phone: string;
    name: string;
    isDefault: boolean;
    isFromMock?: boolean;
}

// export interface InsuredInfoPH {
//     appId: string;
//     customerName: string;
//     nationalId: string;
//     plan: string;
//     startCoverDate: string;
//     cancelDate: string | undefined;
// }

interface ClaimPHState {
    isContinuous: boolean;
    oldClaim: OldClaimInfo | undefined;
    form: ClaimFormValues;
    bankAccounts: BankAccount[];
    contacts: ContactInfo[];
    insured: GetCustomerDetailByIdDtoResponse | undefined;
}

const defaultForm: ClaimFormValues = {
    documentReceiver: 2,
    documentReceiverLabel: undefined,
    serviceProvider: undefined,
    serviceProviderLabel: undefined,
    carOwner: undefined,
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
    deathDate: dayjs(),
    receiveDocDate: dayjs(),
    claimAmount: 0,
    symptomType: "ระบุอาการ",
    chiefComplain: undefined,
    remark: undefined,
};

const initialState: ClaimPHState = {
    isContinuous: false,
    oldClaim: undefined,
    form: defaultForm,
    bankAccounts: [],
    contacts: [],
    insured: undefined,
};

const claimPHSlice = createSlice({
    name: "claimPH",
    initialState,
    reducers: {
        setIsContinuous(state, action: PayloadAction<boolean>) {
            state.isContinuous = action.payload;
        },
        setOldClaim(state, action: PayloadAction<OldClaimInfo | undefined>) {
            state.oldClaim = action.payload;
        },
        toggleOldClaimHidden(state) {
            if (state.oldClaim) state.oldClaim.isHidden = !state.oldClaim.isHidden;
        },
        setClaimForm(state, action: PayloadAction<Partial<ClaimFormValues>>) {
            state.form = { ...state.form, ...action.payload };
        },
        resetClaimForm(state) {
            state.form = defaultForm;
        },
        setBankAccounts(state, action: PayloadAction<BankAccount[]>) {
            state.bankAccounts = action.payload;
        },
        addBankAccount(state, action: PayloadAction<BankAccount>) {
            state.bankAccounts = state.bankAccounts.map((b) => ({ ...b, isDefault: false }));
            state.bankAccounts.push({ ...action.payload, isDefault: true });
        },
        setContacts(state, action: PayloadAction<ContactInfo[]>) {
            state.contacts = action.payload;
        },
        addContact(state, action: PayloadAction<ContactInfo>) {
            state.contacts = state.contacts.map((c) => ({ ...c, isDefault: false }));
            state.contacts.push({ ...action.payload, isDefault: true });
        },
        // 2. เพิ่ม reducers ใน claimPHSlice (ใน reducers: { ... })
        removeBankAccount(state, action: PayloadAction<string>) {
            const idx = state.bankAccounts.findIndex((b) => b.id === action.payload);
            if (idx === -1) return;
            if (state.bankAccounts[idx].isFromMock) return; // mock ลบไม่ได้
            const wasDefault = state.bankAccounts[idx].isDefault;
            state.bankAccounts.splice(idx, 1);
            if (wasDefault && state.bankAccounts.length > 0) {
                state.bankAccounts[state.bankAccounts.length - 1].isDefault = true;
            }
        },
        removeContact(state, action: PayloadAction<string>) {
            const idx = state.contacts.findIndex((c) => c.id === action.payload);
            if (idx === -1) return;
            if (state.contacts[idx].isFromMock) return; // mock ลบไม่ได้
            const wasDefault = state.contacts[idx].isDefault;
            state.contacts.splice(idx, 1);
            if (wasDefault && state.contacts.length > 0) {
                state.contacts[state.contacts.length - 1].isDefault = true;
            }
        },
        setInsured(state, action: PayloadAction<GetCustomerDetailByIdDtoResponse | undefined>) {
            state.insured = action.payload;
        },
    },
});

export const {
    setIsContinuous,
    setOldClaim,
    toggleOldClaimHidden,
    setClaimForm,
    resetClaimForm,
    setBankAccounts,
    addBankAccount,
    setContacts,
    addContact,
    removeBankAccount,
    removeContact,
    setInsured,
} = claimPHSlice.actions;

export const claimPHSelector = (state: RootState) => state.claimph;

export default claimPHSlice.reducer;
