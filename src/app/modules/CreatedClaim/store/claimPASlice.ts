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
    BeneficiaryV2Request,
    CaseAssessmentV2Request,
    CaseContactV2Request,
    CaseDeathV2Request,
    CaseDisabilityV2Request,
    CaseDocumentV2Request,
    CaseItemV2Request,
    CaseRegistrationV2Request,
    CaseServicePersonV2Request,
    CaseV2Request,
    ClaimV2Request,
    CreateCoreClaimV2DtoRequest,
    GetContactPersonDtoResponse,
    GetCustomerBankAccountDtoResponse,
    GetCustomerDetailByIdDtoResponse,
    GetPreviousClaimDtoResponse,
} from "../../../api/coreClaimApi.client";
import { OrganLossItem } from "../hooks/CreateClaim/organLoss.types";

export type LocalCaseItem = CaseItemV2Request & { tempCaseId?: string; tempCaseItemId?: string };
export type LocalCaseRegistration = CaseRegistrationV2Request & { tempCaseId?: string };
export type LocalCaseAssessment = CaseAssessmentV2Request & { tempCaseId?: string };
export type LocalCaseDeath = CaseDeathV2Request & { tempCaseId?: string };
export type LocalCaseDisability = CaseDisabilityV2Request & { tempCaseId?: string };

export type LocalCaseDocument = CaseDocumentV2Request & {
    tempCaseId?: string;
    tempCaseDocumentId?: string;
};

export type LocalCaseContact = CaseContactV2Request & { tempCaseId?: string };
export type LocalCaseServicePerson = CaseServicePersonV2Request & { tempCaseId?: string };
export type LocalBeneficiary = Omit<BeneficiaryV2Request, "payables"> & { tempClaimId?: string; tempCaseId?: string };

export type LocalCaseEntry = Omit<
    CaseV2Request,
    | "items"
    | "registrations"
    | "assessments"
    | "deaths"
    | "disabilities"
    | "documents"
    | "contacts"
    | "servicePersons"
    | "beneficiaries"
> & {
    tempCaseId: string;
    tempClaimId: string;
    payableCategoryId?: number;
    createCaseItem: LocalCaseItem[];
    createCaseRegistration: LocalCaseRegistration[];
    createCaseAssessment: LocalCaseAssessment[];
    createCaseDeath: LocalCaseDeath[];
    createCaseDisability: LocalCaseDisability[];
    createCaseDocument: LocalCaseDocument[];
    createCaseContact?: LocalCaseContact[];
    createCaseServicePerson: LocalCaseServicePerson[];
    createBeneficiary: LocalBeneficiary[];
};

export type LocalClaimEntry = Omit<ClaimV2Request, "cases"> & {
    tempClaimId: string;
    createCase?: LocalCaseEntry[];
};

export type LocalCoreClaim = Omit<CreateCoreClaimV2DtoRequest, "claims" | "requestId"> & {
    createClaim?: LocalClaimEntry[];
};

export interface SchoolInfo {
    appId: string;
    schoolName: string;
    teacherName: string;
    teacherPhone: string;
}

export type PendingInsured = GetCustomerDetailByIdDtoResponse & { tempClaimId?: string };

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
    applicationId?: string;
    customerId?: number;
    productId?: number;
    tempClaimId: string;
    tempCaseId: string;
    formValues: ClaimPAFormValues;
}

export enum DeathExtraCoverageId {
    PublicDisaster = 6, // ภัยสาธารณะ
    SchoolLiability = 7, // รับผิดสถานศึกษา
    FuneralExpense = 8, // ค่าปลงศพ — TODO: เช็ค id จริงจาก backend
}

export const MAX_INSURED_PER_CLAIM = 15;

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
    extraCoverageIds: number[]; // ความคุ้มครองเพิ่มเติมที่เลือก (ุ6 = ภัยสาธารณะ, 7 = ความรับผิดสถานศึกษา)
    deathBenefitAmounts: Record<number, number | string>;
}

export type CreateCoreClaimDto = LocalCoreClaim;

interface ClaimPAState {
    isContinuous: boolean;
    oldClaim: GetPreviousClaimDtoResponse | undefined;
    insured: GetCustomerDetailByIdDtoResponse | undefined;
    pendingInsured: PendingInsured | undefined;
    school: SchoolInfo | null;
    form: ClaimPAFormValues;
    claimItems: ClaimInsuredItem[]; // รายการผู้เอาประกันในตาราง
    bankAccounts: ClaimBankAccount[];
    contacts: ContactInfo[];
    editingItemId: string | null; // id ของ row ที่กำลังแก้ไข
    beneficiaries: BeneficiaryForm[];
    organLossItems: OrganLossItem[];

    tmpCoreClaim: LocalCoreClaim;
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
    nplAmount: undefined,
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
    extraCoverageIds: [],
    deathBenefitAmounts: {},
};

const initialState: ClaimPAState = {
    isContinuous: false,
    oldClaim: undefined,
    insured: undefined,
    pendingInsured: undefined,
    school: null,
    form: defaultForm,
    claimItems: [],
    bankAccounts: [],
    contacts: [],
    editingItemId: null,
    organLossItems: [],
    beneficiaries: [],

    tmpCoreClaim: {
        createClaim: [],
    },
};

const claimPASlice = createSlice({
    name: "claimPA",
    initialState,
    reducers: {
        setIsContinuous(state, action: PayloadAction<boolean>) {
            state.isContinuous = action.payload;
        },
        setOldClaim(state, action: PayloadAction<GetPreviousClaimDtoResponse>) {
            state.oldClaim = action.payload;
        },
        setInsured(state, action: PayloadAction<GetCustomerDetailByIdDtoResponse | undefined>) {
            state.insured = action.payload;
        },
        setPendingInsured(state, action: PayloadAction<PendingInsured | undefined>) {
            state.pendingInsured = action.payload;
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

        //credate claim
        setTmpCoreClaimHeader(state, action: PayloadAction<LocalCoreClaim>) {
            state.tmpCoreClaim = {
                ...action.payload,
                createClaim: action.payload.createClaim ?? [],
            };
        },
        setTmpClaimItem(state, action: PayloadAction<LocalClaimEntry[]>) {
            state.tmpCoreClaim.createClaim = [...(state.tmpCoreClaim.createClaim ?? []), ...action.payload];
        },

        setTmpCaseItem(
            state,
            action: PayloadAction<{
                tempClaimId: string;
                cases: LocalCaseEntry[];
            }>
        ) {
            const claim = state.tmpCoreClaim.createClaim?.find((c) => c.tempClaimId === action.payload.tempClaimId);

            if (!claim) return;

            claim.createCase = [...(claim.createCase ?? []), ...action.payload.cases];
        },

        updateTmpClaimItem(state, action: PayloadAction<LocalClaimEntry>) {
            const idx = state.tmpCoreClaim.createClaim?.findIndex((c) => c.tempClaimId === action.payload.tempClaimId);
            if (idx === undefined || idx === -1 || !state.tmpCoreClaim.createClaim) return;
            state.tmpCoreClaim.createClaim[idx] = {
                ...action.payload,
                createCase: state.tmpCoreClaim.createClaim[idx].createCase,
            };
        },

        updateTmpCaseItem(state, action: PayloadAction<{ tempClaimId: string; case: LocalCaseEntry }>) {
            const claim = state.tmpCoreClaim.createClaim?.find((c) => c.tempClaimId === action.payload.tempClaimId);
            if (!claim) return;

            // 1 claim ต่อ 1 case
            claim.createCase = [action.payload.case];
        },

        removeTmpClaim(
            state,
            action: PayloadAction<string> // tempClaimId
        ) {
            state.tmpCoreClaim.createClaim =
                state.tmpCoreClaim.createClaim?.filter((x) => x.tempClaimId !== action.payload) ?? [];
        },

        setBankAccounts(state, action: PayloadAction<GetCustomerBankAccountDtoResponse[]>) {
            const manualAccounts = state.bankAccounts.filter((b) => b.id.startsWith("manual-"));
            const apiAccounts = action.payload.map((item, index) => ({
                ...item,
                id: String(item.indexId ?? index),
                isDefault: false,
            }));
            const merged = [...apiAccounts, ...manualAccounts];
            const prevDefaultId = state.bankAccounts.find((b) => b.isDefault)?.id;
            const defaultStillExists = merged.some((b) => b.id === prevDefaultId);
            state.bankAccounts = merged.map((b, index) => ({
                ...b,
                isDefault: defaultStillExists ? b.id === prevDefaultId : index === 0,
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
            const manualContacts = state.contacts.filter((c) => c.id.startsWith("manual-"));
            const apiContacts = action.payload.map((item, index) => ({
                ...item,
                id: String(item.indexId ?? index),
                isDefault: false,
            }));
            const merged = [...apiContacts, ...manualContacts];
            const prevDefaultId = state.contacts.find((c) => c.isDefault)?.id;
            const defaultStillExists = merged.some((c) => c.id === prevDefaultId);
            state.contacts = merged.map((c, index) => ({
                ...c,
                isDefault: defaultStillExists ? c.id === prevDefaultId : index === 0,
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
    setPendingInsured,
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
    setTmpCoreClaimHeader,
    setTmpClaimItem,
    setTmpCaseItem,
    updateTmpClaimItem,
    updateTmpCaseItem,
    removeTmpClaim,
} = claimPASlice.actions;

export const claimPASelector = (state: RootState) => state.claimpa;

export default claimPASlice.reducer;
