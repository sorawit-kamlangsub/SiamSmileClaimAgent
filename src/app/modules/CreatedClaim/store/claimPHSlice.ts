import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../../../redux";

export type ClaimType = "OPD" | "IPD" | "DayCaseSurgery" | "DeathClaim" | "LossOrDisability";
export type OpdSubType = "โรคทั่วไป" | "อุบัติเหตุ";
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
    documentReceiver: DocumentReceiver | "";
    serviceProvider: string;
    carOwner: string;
    claimType: ClaimType | "";
    opdSubType: OpdSubType | "";
    normalRoom: boolean;
    normalNights: number;
    icuRoom: boolean;
    icuNights: number;
    incidentDate: string;
    claimAmount: string;
    symptomType: SymptomType;
    chiefComplain: string;
    remark: string;
}

export interface BankAccount {
    id: string;
    relationship: string;
    bankId: number;
    bankName: string;
    accountNo: string;
    accountName: string;
    isDefault: boolean;
}

export interface ContactInfo {
    id: string;
    relationship: string;
    phone: string;
    name: string;
    isDefault: boolean;
}

export interface InsuredInfoPH {
    appId: string;
    customerName: string;
    nationalId: string;
    plan: string;
    startCoverDate: string;
    cancelDate: string | null;
}

interface ClaimPHState {
    isContinuous: boolean;
    oldClaim: OldClaimInfo | null;
    form: ClaimFormValues;
    bankAccounts: BankAccount[];
    contacts: ContactInfo[];
    insured: InsuredInfoPH | null;
}

const defaultForm: ClaimFormValues = {
    documentReceiver: "ผู้ให้บริการ",
    serviceProvider: "",
    carOwner: "",
    claimType: "",
    opdSubType: "",
    normalRoom: false,
    normalNights: 0,
    icuRoom: false,
    icuNights: 0,
    incidentDate: new Date().toISOString().split("T")[0],
    claimAmount: "",
    symptomType: "ระบุอาการ",
    chiefComplain: "",
    remark: "",
};

const initialState: ClaimPHState = {
    isContinuous: false,
    oldClaim: null,
    form: defaultForm,
    bankAccounts: [],
    contacts: [],
    insured: null,
};

const claimPHSlice = createSlice({
    name: "claimPH",
    initialState,
    reducers: {
        setIsContinuous(state, action: PayloadAction<boolean>) {
            state.isContinuous = action.payload;
        },
        setOldClaim(state, action: PayloadAction<OldClaimInfo | null>) {
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
        setInsured(state, action: PayloadAction<InsuredInfoPH | null>) {
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
    setInsured,
} = claimPHSlice.actions;

export const claimPHSelector = (state: RootState) => state.claimph;

export default claimPHSlice.reducer;
