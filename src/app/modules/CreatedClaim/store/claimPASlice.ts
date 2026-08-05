import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../../../redux";
import dayjs, { Dayjs } from "dayjs";
import {
    BeneficiaryForm,
    ClaimBankAccount,
    ContactInfo,
    DeathPlaceType,
    DiagnosisModel,
    SymptomType,
} from "./claimPHSlice";
import {
    CaseDocumentDetailCreateRequest,
    GetClaimHistoryDtoResponse,
    GetContactPersonDtoResponse,
    GetCustomerBankAccountDtoResponse,
    GetCustomerDetailByIdDtoResponse,
} from "../../../api/coreClaimApi.client";
import { OrganLossItem } from "../hooks/CreateClaim/organLoss.types";

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
    incidentDate: Dayjs | undefined;
    admissionDate: Dayjs | undefined;
    dischargeDate: Dayjs | undefined;
    idCard: string;
    claimAmount: number;
    // ── เพิ่มเข้ามาเพื่อ map เข้า payload ตอนสร้างเคลม (แยกคนละ createClaim ตามคนที่เลือกเพิ่ม) ──
    applicationId?: string; // เลข AppID/policyCode ของผู้เอาประกันรายนี้
    customerId?: number;
    productId?: number; // productId ของผู้เอาประกันรายนี้ (ต่างกันได้ต่อคน)
    // ── snapshot ฟอร์มทั้งหมดของคนนี้ ณ ตอนกดถัดไป (ใช้สร้าง createCase ของตัวเอง ไม่ใช้ form กลางร่วมกัน) ──
    formValues: ClaimPAFormValues;
}

// ความคุ้มครองเพิ่มเติมสำหรับกรณีเสียชีวิต (เลือกได้มากกว่า 1 อย่าง)
export enum DeathExtraCoverageId {
    PublicDisaster = 7, // ภัยสาธารณะ
    SchoolLiability = 8, // ความรับผิดสถานศึกษา
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
    deathPlaceType: DeathPlaceType | undefined;
    hospitalId: number | undefined;
    hospitalName: string | undefined;
    diagnoses: DiagnosisModel[];
    accidentPlace: string | undefined;
    chiefComplaintId: number | undefined;
    chiefComplaintId_selectedText: string | undefined;
    remark: string | undefined;
    ocrDocument: CaseDocumentDetailCreateRequest[] | undefined;
    extraCoverageIds: number[]; // ความคุ้มครองเพิ่มเติมที่เลือก (7 = ภัยสาธารณะ, 8 = ความรับผิดสถานศึกษา)
}

interface ClaimPAState {
    isContinuous: boolean;
    oldClaim: GetClaimHistoryDtoResponse | undefined;
    insured: GetCustomerDetailByIdDtoResponse | undefined;
    school: SchoolInfo | null;
    form: ClaimPAFormValues;
    claimItems: ClaimInsuredItem[]; // รายการผู้เอาประกันในตาราง
    bankAccounts: ClaimBankAccount[];
    contacts: ContactInfo[];
    editingItemId: string | null; // id ของ row ที่กำลังแก้ไข
    beneficiaries: BeneficiaryForm[];
    organLossItems: OrganLossItem[];
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
    deathPlaceType: 1,
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
    extraCoverageIds: [],
};

const initialState: ClaimPAState = {
    isContinuous: false,
    oldClaim: undefined,
    insured: undefined,
    school: null,
    form: defaultForm,
    claimItems: [],
    bankAccounts: [],
    contacts: [],
    editingItemId: null,
    organLossItems: [],
    beneficiaries: [],
};

const claimPASlice = createSlice({
    name: "claimPA",
    initialState,
    reducers: {
        setIsContinuous(state, action: PayloadAction<boolean>) {
            state.isContinuous = action.payload;
        },
        setOldClaim(state, action: PayloadAction<GetClaimHistoryDtoResponse>) {
            state.oldClaim = action.payload;
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
        setOrganLossItems: (state, action: PayloadAction<OrganLossItem[]>) => {
            state.organLossItems = action.payload;
        },

        // Beneficiary
        setBeneficiaries: (state, action: PayloadAction<BeneficiaryForm[]>) => {
            state.beneficiaries = action.payload;
        },

        addBeneficiary: (state, action: PayloadAction<BeneficiaryForm>) => {
            state.beneficiaries.push(action.payload);
        },

        updateBeneficiary: (
            state,
            action: PayloadAction<{
                index: number;
                changes: Partial<BeneficiaryForm>;
            }>
        ) => {
            const beneficiary = state.beneficiaries[action.payload.index];

            if (!beneficiary) return;

            Object.assign(beneficiary, action.payload.changes);
        },

        removeBeneficiary: (state, action: PayloadAction<number>) => {
            const index = action.payload;

            if (index < 0 || index >= state.beneficiaries.length) return;

            state.beneficiaries.splice(index, 1);

            state.beneficiaries.forEach((item, itemIndex) => {
                item.beneficiaryOrder = itemIndex + 1;
            });
        },
        resetState: () => initialState,
    },
});

export const {
    setIsContinuous,
    setOldClaim,
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
    setOrganLossItems,
    setBeneficiaries,
    updateBeneficiary,
    addBeneficiary,
    removeBeneficiary,
    resetState,
} = claimPASlice.actions;

export const claimPASelector = (state: RootState) => state.claimpa;

export default claimPASlice.reducer;
