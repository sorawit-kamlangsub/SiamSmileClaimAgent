import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../../../redux";
import dayjs, { Dayjs } from "dayjs";
import { BankAccount, ContactInfo } from "./claimPHSlice"; // ← ใช้ร่วม

export type PAClaimType = "OPD" | "IPD" | "DayCaseSurgery" | "DeathClaim" | "LossOrDisability";
export type OpdSubType = "โรคทั่วไป" | "อุบัติเหตุ" | "ค่ารักษา" | "ค่าชดเชย";
export type SymptomType = "ระบุอาการ" | "อื่นๆ";
export type DocumentReceiver = "ผู้ให้บริการ" | "FCNT (สกลนคร)" | "Pivot";

export interface InsuredInfoPA {
    appId: string;
    customerName: string;
    prefix: string;
    firstName: string;
    lastName: string;
    nationalId: string;
    passport: string;
    plan: string;
    startCoverDate: string;
    effectiveDate: string;
    endCoverDate: string;
    insuredType: "นักเรียน" | "บุคลากร" | "";
    schoolName: string;
}

export interface SchoolInfo {
    appId: string;
    schoolName: string;
    teacherName: string;
    teacherPhone: string;
    teacherBank: string;
    teacherAccountNo: string;
    teacherAccountName: string;
}

export interface ClaimInsuredItem {
    id: string;
    appId: string;
    seq: number;
    customerName: string;
    insuredType: string;
    claimType: PAClaimType | "";
    opdSubType: OpdSubType | "";
    claimAmount: number;
}

export interface ClaimPAFormValues {
    documentReceiver: DocumentReceiver | "";
    serviceProvider: string;
    carOwner: string;
    claimType: PAClaimType | "";
    opdSubType: OpdSubType | "";
    incidentDate: Dayjs;
    admitDate: Dayjs | null; // ← วันที่เข้า รพ.
    dischargeDate: Dayjs | null; // ← วันที่ออก รพ.
    claimAmount: string;
    symptomType: SymptomType;
    chiefComplain: string;
    remark: string;
}

interface ClaimPAState {
    isContinuous: boolean;
    insured: InsuredInfoPA | null;
    school: SchoolInfo | null;
    form: ClaimPAFormValues;
    claimItems: ClaimInsuredItem[]; // รายการผู้เอาประกันในตาราง
    bankAccounts: BankAccount[];
    contacts: ContactInfo[];
    editingItemId: string | null; // id ของ row ที่กำลังแก้ไข
}

const defaultForm: ClaimPAFormValues = {
    documentReceiver: "",
    serviceProvider: "",
    carOwner: "",
    claimType: "",
    opdSubType: "",
    incidentDate: dayjs(),
    admitDate: null, // ← เพิ่ม
    dischargeDate: null, // ← เพิ่ม
    claimAmount: "",
    symptomType: "ระบุอาการ",
    chiefComplain: "",
    remark: "",
};

const initialState: ClaimPAState = {
    isContinuous: false,
    insured: null,
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
        setInsured(state, action: PayloadAction<InsuredInfoPA | null>) {
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
        setBankAccounts(state, action: PayloadAction<BankAccount[]>) {
            state.bankAccounts = action.payload;
        },
        addBankAccount(state, action: PayloadAction<BankAccount>) {
            state.bankAccounts = state.bankAccounts.map((b) => ({ ...b, isDefault: false }));
            state.bankAccounts.push({ ...action.payload, isDefault: true });
        },
        removeBankAccount(state, action: PayloadAction<string>) {
            const idx = state.bankAccounts.findIndex((b) => b.id === action.payload);
            if (idx === -1 || state.bankAccounts[idx].isFromMock) return;
            const wasDefault = state.bankAccounts[idx].isDefault;
            state.bankAccounts.splice(idx, 1);
            if (wasDefault && state.bankAccounts.length > 0)
                state.bankAccounts[state.bankAccounts.length - 1].isDefault = true;
        },
        // ── Contacts (เหมือน PH) ──
        setContacts(state, action: PayloadAction<ContactInfo[]>) {
            state.contacts = action.payload;
        },
        addContact(state, action: PayloadAction<ContactInfo>) {
            state.contacts = state.contacts.map((c) => ({ ...c, isDefault: false }));
            state.contacts.push({ ...action.payload, isDefault: true });
        },
        removeContact(state, action: PayloadAction<string>) {
            const idx = state.contacts.findIndex((c) => c.id === action.payload);
            if (idx === -1 || state.contacts[idx].isFromMock) return;
            const wasDefault = state.contacts[idx].isDefault;
            state.contacts.splice(idx, 1);
            if (wasDefault && state.contacts.length > 0) state.contacts[state.contacts.length - 1].isDefault = true;
        },
        setClaimItems(state, action: PayloadAction<ClaimInsuredItem[]>) {
            state.claimItems = action.payload;
        },
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
    setContacts,
    addContact,
    removeContact,
    setClaimItems,
} = claimPASlice.actions;

export const claimPASelector = (state: RootState) => state.claimpa;

export default claimPASlice.reducer;
