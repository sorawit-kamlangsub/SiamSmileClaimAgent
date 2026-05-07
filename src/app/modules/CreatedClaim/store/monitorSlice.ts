import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../../../redux";

export type SearchTypeId = 1 | 2 | 3 | 4 | 5;

export interface checkeligibleMonitorSearchValuesType {
    searchTypeId: SearchTypeId;
    searchDetail: string;
}

export interface MonitorListItem {
    appId: string;
    customerName: string;
    productName: string;
    productCategoryName: string;
    startCoverDate: string;
    endCoverDate: string | null;
}

export interface ClaimHistoryItem {
    claimNo: string;
    chiefComplain: string;
    incidentDate: string;
    totalClaim: number;
    totalPaid: number;
}

export interface SelectedPolicyInfo {
    appId: string;
    customerName: string;
    nationalId: string;
    productName: string; // "PH" | "PA"
    startCoverDate: string;
    endCoverDate: string | null;
    // PA only
    schoolName?: string;
    insuredType?: string;
    effectiveCoverDate?: string;
}

interface MonitorState {
    search: checkeligibleMonitorSearchValuesType;
    selectedPolicy: SelectedPolicyInfo | null;
    claimHistory: ClaimHistoryItem[];
}

const initialState: MonitorState = {
    search: { searchTypeId: 1, searchDetail: "" },
    selectedPolicy: null,
    claimHistory: [],
};

const monitorSlice = createSlice({
    name: "monitor-created-claim",
    initialState,
    reducers: {
        setSearchcheckeligibleMonitor(state, action: PayloadAction<checkeligibleMonitorSearchValuesType>) {
            state.search = action.payload;
        },
        setSelectedPolicy(state, action: PayloadAction<SelectedPolicyInfo | null>) {
            state.selectedPolicy = action.payload;
            state.claimHistory = [];
        },
        setClaimHistory(state, action: PayloadAction<ClaimHistoryItem[]>) {
            state.claimHistory = action.payload;
        },
    },
});

export const { setSearchcheckeligibleMonitor, setSelectedPolicy, setClaimHistory } = monitorSlice.actions;

export const monitorSelector = (state: RootState) => state.monitorcreatedclaim;

export default monitorSlice.reducer;
