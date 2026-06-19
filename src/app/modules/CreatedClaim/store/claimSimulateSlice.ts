import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CalculateCaseClaimDtoResponse } from "../../../api/coreClaimApi.client";
import dayjs, { Dayjs } from "dayjs";

export interface DaysCalculateState {
    appId: string | undefined;
    customerName: string | undefined;
    treatmentType: number | undefined;
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
    patianTypeId: number | undefined;
    calculateResult: CalculateCaseClaimDtoResponse | null;
}

const initialState: ClaimSimulateState = {
    daysCalculate: {
        appId: "9199293",
        customerName: "เด็กชาย ชลชาติ รุกขชาติ",
        treatmentType: undefined,
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
    patianTypeId: undefined,
    calculateResult: null,
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
        setPatianTypeId(state, action: PayloadAction<number | undefined>) {
            state.patianTypeId = action.payload;
        },
    },
});

export const {
    setDaysCalculate,
    setFilledItems,
    updateFilledItem,
    removeFilledItem,
    setCalculateResult,
    setPatianTypeId,
} = claimSimulateSlice.actions;
export default claimSimulateSlice.reducer;
