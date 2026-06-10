import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../../../redux";
import { Dayjs } from "dayjs";

export type SearchTypeId = 1 | 2 | 3 | 4 | 5;

export interface checkeligibleMonitorSearchValuesType {
    searchTypeId: SearchTypeId;
    searchDetail: string;
    dateHappen: Dayjs | undefined;
    schoolId: number | undefined;
    provinceId: number | undefined;
    isAdvancedSearch: boolean;
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
    productId: number;
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
    isSrearchMonitor?: boolean;
}

const initialState: MonitorState = {
    search: {
        searchTypeId: 2,
        searchDetail: "",
        dateHappen: undefined,
        schoolId: undefined,
        provinceId: undefined,
        isAdvancedSearch: false,
    },
    selectedPolicy: null,
    claimHistory: [],
    isSrearchMonitor: false,
};

const monitorSlice = createSlice({
    name: "monitor-created-claim",
    initialState,
    reducers: {
        setSearchcheckeligibleMonitor(state, action: PayloadAction<checkeligibleMonitorSearchValuesType>) {
            state.search = action.payload;
            state.isSrearchMonitor = true;
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
