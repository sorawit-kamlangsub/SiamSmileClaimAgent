import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../../../redux";

export type ClaimLineColor = "#FFD6D6" | "#FFFACC" | "#EDD6FF" | "#D6FFE0" | "#E0E0E0" | "#D6F5FF";

export interface ClaimLineFilledItem {
    id: number;
    code?: string | undefined;
    description?: string | undefined;
    claimAmount?: number;
    discount?: number;
    notCovered?: number;
    reason?: number;
    remark?: string | undefined;
    color?: string | undefined;
    disabled?: boolean | undefined;
}

export interface ClaimLineInsured {
    appId: string;
    prefix: string;
    firstName: string;
    lastName: string;
    nationalId: string;
    plan: string;
    status: string;
    startCoverDate: string;
    cancelDate: string;
    company: string;
}

export interface DaysCalculate {
    appId: string;
    customerName: string;
    treatmentType: string;
    admitDate: string;
    dischargeDate: string;
    ipdDays?: number;
    icuDays?: number;
    bedDays?: number;
    isContinuous: boolean;
    continuousFromClaimNo: string;
}

export interface ClaimLineHeader {
    patientType?: number | undefined;
}

export interface ClaimLineItem {
    id: number;
    code?: string | undefined;
    description?: string | undefined; // รายการ
    claimAmount?: number; // ยอดเบิก
    discount?: number; // ส่วนลด
    notCovered?: number; // ยอดไม่คุ้มครอง
    reason?: number; // สาเหตุ
    remark?: string | undefined; // หมายเหตุ
    color?: string | undefined; // สีแถว
    disabled?: boolean | undefined; // disabled
}

export interface ClaimLineSummary {
    onlineClaimAmount: number;
    totalClaim: number;
    totalDiscount: number;
    netClaim: number;
    coveredAmount: number;
    notCoveredAmount: number;
}

interface ClaimLineState {
    items: ClaimLineItem[];
    filledItems: ClaimLineFilledItem[];
    summary: ClaimLineSummary;
    isCalculating: boolean;
    searchResults: ClaimLineInsured[];
    selectedInsured: ClaimLineInsured | undefined;
    daysCalculate: DaysCalculate;
    header: ClaimLineHeader;
}

const defaultDaysCalculate: DaysCalculate = {
    appId: "",
    customerName: "",
    treatmentType: "",
    admitDate: "",
    dischargeDate: "",
    ipdDays: 0,
    icuDays: 0,
    bedDays: 0,
    isContinuous: false,
    continuousFromClaimNo: "",
};

const defaultClaimLineHeader: ClaimLineHeader = {
    patientType: undefined,
};

const initialState: ClaimLineState = {
    items: [],
    filledItems: [],
    summary: {
        onlineClaimAmount: 0,
        totalClaim: 0,
        totalDiscount: 0,
        netClaim: 0,
        coveredAmount: 0,
        notCoveredAmount: 0,
    },
    isCalculating: false,
    searchResults: [],
    selectedInsured: undefined,
    daysCalculate: defaultDaysCalculate,
    header: defaultClaimLineHeader,
};

const claimLineSlice = createSlice({
    name: "claimLine",
    initialState,
    reducers: {
        setItems(state, action: PayloadAction<ClaimLineItem[]>) {
            state.items = action.payload;
        },
        updateItem(state, action: PayloadAction<{ id: number; field: keyof ClaimLineItem; value: string }>) {
            const idx = state.items.findIndex((i) => i.id === action.payload.id);
            if (idx !== -1) {
                (state.items[idx] as any)[action.payload.field] = action.payload.value;
            }

            const item = state.items[idx];
            const hasFilled =
                item.claimAmount !== undefined ||
                item.discount !== undefined ||
                item.notCovered !== undefined ||
                item.reason !== undefined ||
                (item.remark !== undefined && item.remark !== "");

            const filledIdx = state.filledItems.findIndex((f) => f.id === action.payload.id);

            if (hasFilled) {
                if (filledIdx !== -1) {
                    // update
                    state.filledItems[filledIdx] = { ...item };
                } else {
                    // insert
                    state.filledItems.push({ ...item });
                }
            } else {
                // ถ้าล้างข้อมูลหมดแล้วให้เอาออก
                if (filledIdx !== -1) {
                    state.filledItems.splice(filledIdx, 1);
                }
            }
        },
        // reset เฉพาะ filledItems
        resetFilledItems(state) {
            state.filledItems = [];
        },
        resetItems(state) {
            state.items = state.items.map((item) => ({
                ...item,
                claimAmount: undefined,
                discount: undefined,
                notCovered: undefined,
                reason: undefined,
                remark: undefined,
            }));
            state.filledItems = [];
            state.summary = {
                ...state.summary,
                totalClaim: 0,
                totalDiscount: 0,
                netClaim: 0,
                coveredAmount: 0,
                notCoveredAmount: 0,
            };
        },
        setSummary(state, action: PayloadAction<Partial<ClaimLineSummary>>) {
            state.summary = { ...state.summary, ...action.payload };
        },
        setIsCalculating(state, action: PayloadAction<boolean>) {
            state.isCalculating = action.payload;
        },
        calculateSummary(state) {
            const items = state.items.filter((i) => !i.disabled);
            const totalClaim = items.reduce((s, i) => s + Number(i.claimAmount || 0), 0);
            const totalDiscount = items.reduce((s, i) => s + Number(i.discount || 0), 0);
            const notCoveredAmount = items.reduce((s, i) => s + Number(i.notCovered || 0), 0);
            state.summary.totalClaim = totalClaim;
            state.summary.totalDiscount = totalDiscount;
            state.summary.netClaim = totalClaim - totalDiscount;
            state.summary.notCoveredAmount = notCoveredAmount;
            state.summary.coveredAmount = totalClaim - totalDiscount - notCoveredAmount;
        },
        setSearchResults(state, action: PayloadAction<ClaimLineInsured[]>) {
            state.searchResults = action.payload;
        },
        setSelectedInsured(state, action: PayloadAction<ClaimLineInsured | undefined>) {
            state.selectedInsured = action.payload;
            if (action.payload) {
                state.daysCalculate.appId = action.payload.appId;
                state.daysCalculate.customerName = `${action.payload.prefix}${action.payload.firstName} ${action.payload.lastName}`;
            }
        },
        setDaysCalculate(state, action: PayloadAction<Partial<DaysCalculate>>) {
            state.daysCalculate = { ...state.daysCalculate, ...action.payload };
        },
        resetDaysCalculate(state) {
            state.daysCalculate = defaultDaysCalculate;
            state.selectedInsured = undefined;
            state.searchResults = [];
        },
        setHeader(state, action: PayloadAction<Partial<ClaimLineHeader>>) {
            state.header = { ...state.header, ...action.payload };
        },
    },
});

export const {
    setItems,
    updateItem,
    setSummary,
    setIsCalculating,
    calculateSummary,
    setSearchResults,
    setSelectedInsured,
    setDaysCalculate,
    resetDaysCalculate,
    resetItems,
    resetFilledItems,
    setHeader,
} = claimLineSlice.actions;
export const claimLineSelector = (state: RootState) => state.claimline;
export default claimLineSlice.reducer;
