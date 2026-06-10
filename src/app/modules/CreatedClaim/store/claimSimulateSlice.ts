import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CalculateCaseClaimDtoResponse } from "../../../api/coreClaimApi.client";

export interface DaysCalculateState {
    appId: string;
    customerName: string;
    treatmentType: string;
    admitDate: string;
    dischargeDate: string;
    ipdDays: number;
    icuDays: number;
    bedDays: number;
    isContinuous: boolean;
    continuousFromClaimNo: string;
}

export interface ClaimLineItem {
    id?: number;
    code?: string | undefined;
    description?: string | undefined;
    claimAmount?: number;
    notCovered?: number;
    reason?: string | undefined;
    remark?: string | undefined;
    discount?: number | undefined;
    disabled: boolean;
}

interface ClaimSimulateState {
    daysCalculate: DaysCalculateState;
    filledItems: ClaimLineItem[];
    calculateResult: CalculateCaseClaimDtoResponse | null;
}

const initialState: ClaimSimulateState = {
    daysCalculate: {
        appId: "APP-2025-001234",
        customerName: "สมชาย ใจดี",
        treatmentType: "",
        admitDate: "",
        dischargeDate: "",
        ipdDays: 0,
        icuDays: 0,
        bedDays: 0,
        isContinuous: false,
        continuousFromClaimNo: "",
    },
    filledItems: [],
    calculateResult: null, // เพิ่ม
};

const claimSimulateSlice = createSlice({
    name: "claimSimulate",
    initialState,
    reducers: {
        setDaysCalculate(state, action: PayloadAction<Partial<DaysCalculateState>>) {
            state.daysCalculate = { ...state.daysCalculate, ...action.payload };
        },
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
        setCalculateResult(state, action: PayloadAction<CalculateCaseClaimDtoResponse | null>) {
            state.calculateResult = action.payload;
        },
    },
});

export const { setDaysCalculate, setFilledItems, updateFilledItem, removeFilledItem, setCalculateResult } =
    claimSimulateSlice.actions;
export default claimSimulateSlice.reducer;
