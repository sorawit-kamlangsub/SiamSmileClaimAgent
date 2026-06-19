import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../../../redux";
import { checkeligibleMonitorSearchValuesType } from "../hooks/CheckEligibleMonitor/useCheckEligibleMonitorToolbarForm";
import { ToolbarFormValues } from "../hooks/CheckEligibleDetail/useCheckEligibleToolbar";

// types/checkEligible.types.ts
export type ClaimType = "" | "OPD" | "IPD" | "DayCaseSurgery" | "DeathClaim" | "Dismemberment";

export type CoverageBenefit = {
    id: number;
    icon: React.ReactNode;
    title: string;
    ratePerUnit?: string; // เช่น "700/วัน"
    maxAmount: number; // วงเงินสูงสุด
    usedAmount: number; // วงเงินที่ใช้ไปแล้ว
    maxDays?: number; // จำนวนวันสูงสุด
    usedDays?: number; // จำนวนวันที่ใช้ไป
    dayUnit?: string; // เช่น "วัน"
};

export type ContinuousClaimRow = {
    claimCode: string;
    chiefComplain: string;
    incidentDate: string; // ISO date
    maxAmount: number;
    paidAmount: number;
};

export type PolicyPlan = {
    planCode: string;
    effectiveDate: string; // ISO date
    benefits: CoverageBenefit[];
};

export type checkeligibleState = {
    checkeligibleMonitorSearch: checkeligibleMonitorSearchValuesType;
    isSearchcheckeligibleMonitor?: boolean;
    CheckeLigibleDetails: ToolbarFormValues;
    isSearchCheckeLigibleDetails?: boolean;

    isContinuousClaim: boolean;
    selectedContinuousClaims: string[];
};

const initialState: checkeligibleState = {
    checkeligibleMonitorSearch: {},
    isSearchcheckeligibleMonitor: false,

    CheckeLigibleDetails: {
        claimType: undefined,
        incidentDate: undefined,
        isContinuous: false,
    },

    isContinuousClaim: false,

    selectedContinuousClaims: [],
};

const checkeligibleSlice = createSlice({
    name: "checkeligible",
    initialState,
    reducers: {
        setSearchcheckeligibleMonitor: (state, action: PayloadAction<checkeligibleMonitorSearchValuesType>) => {
            state.checkeligibleMonitorSearch = action.payload;
            state.isSearchcheckeligibleMonitor = true;
        },
        resetSearchcheckeligibleMonitor: (state) => {
            state.checkeligibleMonitorSearch = {};
            state.isSearchcheckeligibleMonitor = false;
        },

        setSearchCheckeLigibleDetails: (state, action: PayloadAction<ToolbarFormValues>) => {
            state.CheckeLigibleDetails = action.payload;
            state.isSearchCheckeLigibleDetails = true;
        },

        resetSearchCheckeLigibleDetails: (state) => {
            state.CheckeLigibleDetails = {
                claimType: undefined,
                incidentDate: undefined,
                isContinuous: false,
            };
            state.isSearchCheckeLigibleDetails = false;
        },

        setIsContinuousClaim: (state, action: PayloadAction<boolean>) => {
            state.isContinuousClaim = action.payload;
            if (!action.payload) state.selectedContinuousClaims = [];
        },
        toggleContinuousClaimSelection: (state, action: PayloadAction<string>) => {
            const code = action.payload;
            const idx = state.selectedContinuousClaims.indexOf(code);
            if (idx >= 0) {
                state.selectedContinuousClaims.splice(idx, 1);
            } else {
                state.selectedContinuousClaims.push(code);
            }
        },
    },
});

export const {
    setSearchcheckeligibleMonitor,
    resetSearchcheckeligibleMonitor,
    setSearchCheckeLigibleDetails,
    resetSearchCheckeLigibleDetails,
    setIsContinuousClaim,
    toggleContinuousClaimSelection,
} = checkeligibleSlice.actions;

export const checkeligibleSelector = (state: RootState) => state.checkeligible;

export default checkeligibleSlice.reducer;
