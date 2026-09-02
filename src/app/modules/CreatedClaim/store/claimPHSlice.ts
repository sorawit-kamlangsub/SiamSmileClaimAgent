import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../../../redux";
import dayjs, { Dayjs } from "dayjs";
import {
    CaseDocumentV2Request,
    CaseItemV2Request,
    GetContactPersonDtoResponse,
    GetCustomerBankAccountDtoResponse,
    GetCustomerDetailByIdDtoResponse,
    GetDocumentSubTypeDtoResponse,
    GetPreviousClaimDtoResponse,
} from "../../../api/coreClaimApi.client";
import { DocumentByIdResponseDto } from "../../../api/docstorageApi.client";
import { OrganLossItem } from "../hooks/CreateClaim/organLoss.types";

export enum SymptomType {
    ChiefComplaint = 1,
    Other = 2,
}

export enum DeathPlaceType {
    Home = 2,
    Hospital = 3,
    Other = 4,
}

export interface DiagnosisModel {
    icd10Id?: number;
    icd10Detail?: string;
}

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

export interface BeneficiaryForm {
    id?: number;
    policyCode?: string;
    beneficiaryCode?: string;

    relationTypeId?: number;
    titleId?: number;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;

    // API นี้มีเป็นเปอร์เซ็นต์
    percentShare?: number;

    beneficiaryOrder?: number;
    remark?: string;

    citizenId?: string;
    bankId?: number;
    bankId_selectedText?: string;
    bankAccountNo?: string;
    bankAccountName?: string;

    amount?: number;

    // สำหรับ UI
    source?: "system" | "manual";
}

export interface ClaimFormValues {
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
    benefitAmounts: Record<number, string>;
    transferAmount: number | undefined; //เงินโอน
    nplAmount: number | undefined; //ยอดจ่ายเกินสิทธิ์ (NPL)
    symptomType: SymptomType | undefined;
    deathPlaceType: DeathPlaceType | undefined;
    hospitalId: number | undefined;
    hospitalName: string | undefined;
    diagnoses: DiagnosisModel[];
    accidentPlace: string | undefined;
    chiefComplaintId: number | undefined;
    chiefComplaintId_selectedText: string | undefined;
    remark: string | undefined;
    ocrDocument: CaseDocumentV2Request[] | undefined;
}

export type ClaimBankAccount = GetCustomerBankAccountDtoResponse & {
    id: string;
    isDefault: boolean;
};
export type ContactInfo = GetContactPersonDtoResponse & {
    id: string;
    isDefault: boolean;
};

interface ClaimPHState {
    isContinuous: boolean;
    oldClaim: GetPreviousClaimDtoResponse | undefined;
    form: ClaimFormValues;
    bankAccounts: ClaimBankAccount[];
    contacts: ContactInfo[];
    insured: GetCustomerDetailByIdDtoResponse | undefined;
    documentDetailById: { [key: string]: DocumentDetailDto };
    isEnabled: boolean;
    organLossItems: OrganLossItem[];
    beneficiaries: BeneficiaryForm[];
    caseItems: CaseItemV2Request[];
    documentScanList: GetDocumentSubTypeDtoResponse[];
}
const defaultForm: ClaimFormValues = {
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
    nplAmount: undefined,
    benefitAmounts: {},
    symptomType: 1,
    deathPlaceType: 2,
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
export interface DocumentDetailDto {
    documentId?: string | undefined;
    documentCode?: string | undefined;
    documentTypeId?: number | undefined;
    docDetail?: DocumentByIdResponseDto;
}
const initialState: ClaimPHState = {
    isContinuous: false,
    oldClaim: undefined,
    form: defaultForm,
    bankAccounts: [],
    contacts: [],
    insured: undefined,
    isEnabled: false,
    documentDetailById: {},
    organLossItems: [],
    beneficiaries: [],
    caseItems: [],
    documentScanList: [],
};

const claimPHSlice = createSlice({
    name: "claimPH",
    initialState,
    reducers: {
        setIsContinuous(state, action: PayloadAction<boolean>) {
            state.isContinuous = action.payload;
        },
        setOldClaim(state, action: PayloadAction<GetPreviousClaimDtoResponse>) {
            state.oldClaim = action.payload;
        },
        // toggleOldClaimHidden(state) {
        //     if (state.oldClaim) state.oldClaim.isHidden = !state.oldClaim.isHidden;
        // },
        setClaimForm(state, action: PayloadAction<Partial<ClaimFormValues>>) {
            state.form = { ...state.form, ...action.payload };
        },
        resetClaimForm(state) {
            state.form = defaultForm;
        },
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
        // 2. เพิ่ม reducers ใน claimPHSlice (ใน reducers: { ... })
        removeBankAccount(state, action: PayloadAction<string>) {
            const idx = state.bankAccounts.findIndex((b) => b.id === action.payload);

            if (idx === -1) return;

            const wasDefault = state.bankAccounts[idx].isDefault;

            state.bankAccounts.splice(idx, 1);

            if (wasDefault && state.bankAccounts.length > 0) {
                state.bankAccounts[state.bankAccounts.length - 1].isDefault = true;
            }
        },
        removeContact(state, action: PayloadAction<string>) {
            const idx = state.contacts.findIndex((c) => c.id === action.payload);
            if (idx === -1) return;
            const wasDefault = state.contacts[idx].isDefault;
            state.contacts.splice(idx, 1);
            if (wasDefault && state.contacts.length > 0) {
                state.contacts[state.contacts.length - 1].isDefault = true;
            }
        },
        setInsured(state, action: PayloadAction<GetCustomerDetailByIdDtoResponse | undefined>) {
            state.insured = action.payload;
        },

        setEnabled: (state, action: PayloadAction<boolean>) => {
            state.isEnabled = action.payload;
        },
        setDocumentDetailById: (state, action: PayloadAction<DocumentDetailDto>) => {
            if (!action.payload.documentId) return;
            state.documentDetailById[action.payload.documentId] = action.payload;
        },
        setDocument: (state, action: PayloadAction<GetDocumentSubTypeDtoResponse[]>) => {
            const incoming = action.payload;
            const incomingIds = new Set(incoming.map((d) => d.documentId));

            // เก็บของเดิมที่ไม่ได้อยู่ใน incoming batch นี้ไว้ + เอาของใหม่มาแทนที่/เพิ่ม
            state.documentScanList = [
                ...state.documentScanList.filter((d) => !incomingIds.has(d.documentId)),
                ...incoming,
            ];
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

        setCaseItems(state, action: PayloadAction<CaseItemV2Request[]>) {
            state.caseItems = action.payload;
        },

        resetState: () => initialState,
    },
});

export const {
    setIsContinuous,
    setOldClaim,
    //toggleOldClaimHidden,
    setClaimForm,
    resetClaimForm,
    setBankAccounts,
    selectBankAccount,
    addBankAccount,
    setContacts,
    selectContact,
    addContact,
    removeBankAccount,
    removeContact,
    setInsured,
    setEnabled,
    setDocumentDetailById,
    setDocument,
    setOrganLossItems,
    setBeneficiaries,
    updateBeneficiary,
    addBeneficiary,
    removeBeneficiary,
    setCaseItems,
    resetState,
} = claimPHSlice.actions;

export const claimPHSelector = (state: RootState) => state.claimph;

export default claimPHSlice.reducer;
