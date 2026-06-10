import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../../../redux";
import dayjs, { Dayjs } from "dayjs";

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

export type IpdSubType = "ค่ารักษาพยาบาล" | "ค่าชดเชย";

export interface ClaimFormValues {
    documentReceiver: DocumentReceiver | "";
    serviceProvider: string;
    carOwner: string;
    claimType: ClaimType | undefined;
    opdSubType: OpdSubType | undefined;
    ipdSubType: IpdSubType | undefined;
    incidentDate: Dayjs | undefined;
    dateIn: Dayjs | undefined;
    dateOut: Dayjs | undefined;
    claimAmount: number | undefined;
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
    documentReceiver: "",
    serviceProvider: "",
    carOwner: "",
    claimType: undefined,
    opdSubType: undefined,
    ipdSubType: undefined,
    incidentDate: dayjs(),
    dateIn: dayjs(),
    dateOut: dayjs(),
    claimAmount: 0,
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
    removeBankAccount,
    removeContact,
    setInsured,
} = claimPHSlice.actions;

export const claimPHSelector = (state: RootState) => state.claimph;

export default claimPHSlice.reducer;
