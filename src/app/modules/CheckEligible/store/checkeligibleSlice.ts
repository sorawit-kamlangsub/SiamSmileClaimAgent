import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../../../redux";
import { ToolbarFormValues } from "../hooks/useCheckEligibleToolbar";

export type ClaimType = "" | "OPD" | "IPD" | "DayCaseSurgery" | "DeathClaim" | "Dismemberment";

export type CoverageBenefit = {
    id: number;
    icon: React.ReactNode;
    title: string;
    ratePerUnit?: string;
    maxAmount: number;
    usedAmount: number;
    maxDays?: number;
    usedDays?: number;
    dayUnit?: string;
};

export type PolicyPlan = {
    planCode: string;
    effectiveDate: string;
    benefits: CoverageBenefit[];
};

export type checkeligibleState = {
    isSearchcheckeligibleMonitor?: boolean;
    CheckeLigibleDetails: ToolbarFormValues;
    isSearchCheckeLigibleDetails?: boolean;
};

const emptyCheckeligibleDetails: ToolbarFormValues = {
    claimType: undefined,
    incidentDate: undefined,
    isContinuous: false,
    claimCause: undefined,
    coverageType: undefined,
    medicalType: undefined,
    causeOfIncident: undefined,
    continuousClaim: undefined,
};

const initialState: checkeligibleState = {
    isSearchcheckeligibleMonitor: false,
    CheckeLigibleDetails: emptyCheckeligibleDetails,
};

const checkeligibleSlice = createSlice({
    name: "checkeligible",
    initialState,
    reducers: {
        setSearchCheckeLigibleDetails: (state, action: PayloadAction<ToolbarFormValues>) => {
            state.CheckeLigibleDetails = action.payload;
            state.isSearchCheckeLigibleDetails = true;
        },

        resetSearchCheckeLigibleDetails: (state) => {
            state.CheckeLigibleDetails = emptyCheckeligibleDetails;
            state.isSearchCheckeLigibleDetails = false;
        },

        setContinuousClaimState: (
            state,
            action: PayloadAction<Pick<ToolbarFormValues, "isContinuous" | "continuousClaim">>
        ) => {
            state.CheckeLigibleDetails.isContinuous = action.payload.isContinuous;
            state.CheckeLigibleDetails.continuousClaim = action.payload.continuousClaim;
        },
    },
});

export const { setSearchCheckeLigibleDetails, resetSearchCheckeLigibleDetails, setContinuousClaimState } =
    checkeligibleSlice.actions;

export const checkeligibleSelector = (state: RootState) => state.checkeligible;

export default checkeligibleSlice.reducer;