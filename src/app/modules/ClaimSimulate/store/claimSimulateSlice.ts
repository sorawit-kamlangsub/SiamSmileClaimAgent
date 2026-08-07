import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import dayjs, { Dayjs } from "dayjs";
import { CalculateCaseClaimDtoResponse, GetCustomerSearchDtoResponse } from "../../../api/coreClaimApi.client";
import { RootState } from "../../../../redux";

// IncidentTypeId: 2 = Illness, 3 = Accident
// CauseOfIncidentId: 2 = โรคทั่วไป, 3 = อุบัติเหตุทั่วไป, 4 = ขับขี่/โดยสารจักรยานยนต์, 5 = ฆาตกรรม, 7 = ภัยสาธารณะ, 8 = รับผิดสถานศึกษา
// CoverageTypeId: 2 = Medical, 3 = Compensate, 4 = Disability, 5 = DeathCase
// FormatTypeId: 2 = SSS, 3 = Disability, 4 = Death, 5 = SIM B1, 6 = SIM B2

export type ClaimCauseType = number;
export type CoverageType = number;

export interface ClaimLineHeaderState {
    medicalType: number | undefined;
    claimCause: ClaimCauseType | undefined;
    coverageType: CoverageType | undefined;
    causeOfIncident: number | undefined;
    formatTypeId: number | undefined;
}
export interface DaysCalculateState {
    claimCause: number | undefined;
    coverageType: number | undefined;
    medicalType: number | undefined;
    dateHappen: Dayjs | undefined;
    admitDate: Dayjs | undefined;
    dischargeDate: Dayjs | undefined;
    ipdDays: number | undefined;
    icuDays: number | undefined;
    bedDays: number | undefined;
    isContinuous: boolean;
    continuousFromClaimNo: string | undefined;
}

export interface ClaimLineItem {
    id?: number;
    standardMedicalExpenseId?: number | undefined;
    code?: string | undefined;
    description?: string | undefined;
    claimAmount?: number;
    notCovered?: number;
    reason?: number | undefined;
    remark?: string | undefined;
    discount?: number | undefined;
    color?: string;
    disabled: boolean;
    bodyPartId?: number | undefined;
    maximumLimit?: number | undefined;
}

interface ClaimSimulateState {
    // ── ผู้เอาประกัน ──
    selectedInsured: GetCustomerSearchDtoResponse | null;
    isInsuredSearchOpen: boolean;

    // ── header / รายละเอียดเคลม ──
    header: ClaimLineHeaderState;

    // ── วันที่ / จำนวนวัน ──
    daysCalculate: DaysCalculateState;

    // ── รายการค่ารักษา ──
    filledItems: ClaimLineItem[];
    medicalTypeId: number | undefined;

    // ── ผลคำนวณ ──
    calculateResult: CalculateCaseClaimDtoResponse | null;
}

const initialState: ClaimSimulateState = {
    selectedInsured: null,
    isInsuredSearchOpen: false,

    header: {
        medicalType: 1, // OPD (default)
        claimCause: 2, // เจ็บป่วย
        coverageType: 2, // ค่ารักษา (Medical)
        causeOfIncident: undefined,
        formatTypeId: 6,
    },

    daysCalculate: {
        claimCause: 2,
        coverageType: 2,
        medicalType: 1,
        dateHappen: dayjs(),
        admitDate: dayjs(),
        dischargeDate: dayjs(),
        ipdDays: 0,
        icuDays: 0,
        bedDays: 0,
        isContinuous: false,
        continuousFromClaimNo: "",
    },

    filledItems: [],
    medicalTypeId: undefined,
    calculateResult: null,
};

const claimSimulateSlice = createSlice({
    name: "claimsimulate",
    initialState,
    reducers: {
        // ── ผู้เอาประกัน ──
        setInsuredSearchOpen(state, action: PayloadAction<boolean>) {
            state.isInsuredSearchOpen = action.payload;
        },
        setSelectedInsured(state, action: PayloadAction<GetCustomerSearchDtoResponse | null>) {
            state.selectedInsured = action.payload;
        },

        // ── header ──
        setClaimLineHeader(state, action: PayloadAction<Partial<ClaimLineHeaderState>>) {
            state.header = { ...state.header, ...action.payload };
        },

        // ── days calculate ──
        setDaysCalculate(state, action: PayloadAction<Partial<DaysCalculateState>>) {
            state.daysCalculate = { ...state.daysCalculate, ...action.payload };
        },

        // ── filled items ──
        setFilledItems(state, action: PayloadAction<ClaimLineItem[]>) {
            state.filledItems = action.payload;
        },
        updateFilledItem(state, action: PayloadAction<ClaimLineItem>) {
            const idx = state.filledItems.findIndex((i) => i.id === action.payload.id);
            if (idx !== -1) state.filledItems[idx] = action.payload;
        },
        removeFilledItem(state, action: PayloadAction<number>) {
            state.filledItems = state.filledItems.filter((i) => i.id !== action.payload);
        },
        setMedicalTypeId(state, action: PayloadAction<number | undefined>) {
            state.medicalTypeId = action.payload;
        },

        // ── result ──
        setCalculateResult(state, action: PayloadAction<CalculateCaseClaimDtoResponse | null>) {
            state.calculateResult = action.payload;
        },

        // ── reset ──
        resetSimulateItems(state) {
            state.filledItems = [];
            state.calculateResult = null;
        },
        resetClaimSimulate() {
            return initialState;
        },
    },
});

export const {
    setInsuredSearchOpen,
    setSelectedInsured,
    setClaimLineHeader,
    setDaysCalculate,
    setFilledItems,
    updateFilledItem,
    removeFilledItem,
    setMedicalTypeId,
    setCalculateResult,
    resetSimulateItems,
    resetClaimSimulate,
} = claimSimulateSlice.actions;

export const claimSimulateSelector = (state: RootState) => state.claimsimulate;

export default claimSimulateSlice.reducer;
