import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../../../redux";
import { Dayjs } from "dayjs";
import { GetClaimHistoryDtoResponse } from "../../../api/coreClaimApi.client";

export type SearchTypeId = 1 | 2 | 3 | 4 | 5;

export interface checkeligibleMonitorSearchValuesType {
    searchTypeId: SearchTypeId;
    searchDetail: string | undefined;
    dateHappen: Dayjs | undefined;
    schoolId: number | undefined;
    provinceId: number | undefined;
    isAdvancedSearch: boolean;
    isSearchMonitor: boolean;
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
    cardNo: string;
    productName: string;
    startCoverDate: string;
    endCoverDate: string | null;
    schoolName?: string;
    provinceName?: string;
    address?: string;
    productTypeId?: number;
    customerId?: number;
    mobilePhoneNumber?: string;
    appStatus?: string;
    appStatusId?: number;
}

interface MonitorState {
    search: checkeligibleMonitorSearchValuesType;
    selectedPolicy: SelectedPolicyInfo | undefined;
    claimHistory: GetClaimHistoryDtoResponse[];
    isSearchMonitor?: boolean;
    selectedRowIndex: number | undefined;
}

const initialState: MonitorState = {
    search: {
        searchTypeId: 2,
        searchDetail: "",
        dateHappen: undefined,
        schoolId: undefined,
        provinceId: undefined,
        isAdvancedSearch: false,
        isSearchMonitor: false,
    },
    selectedPolicy: undefined,
    selectedRowIndex: undefined,
    claimHistory: [],
};

const monitorSlice = createSlice({
    name: "monitor-created-claim",
    initialState,
    reducers: {
        setSearchcheckeligibleMonitor(state, action: PayloadAction<checkeligibleMonitorSearchValuesType>) {
            state.search = action.payload;
            state.isSearchMonitor = true;
        },
        setSelectedPolicy(state, action: PayloadAction<SelectedPolicyInfo | undefined>) {
            state.selectedPolicy = action.payload;
            state.claimHistory = [];
        },
        setSelectedRowIndex: (state, action: PayloadAction<number | undefined>) => {
            state.selectedRowIndex = action.payload;
        },
        setClaimHistory(state, action: PayloadAction<GetClaimHistoryDtoResponse[]>) {
            state.claimHistory = action.payload;
        },
        resetMonitor: () => initialState,
    },
});

export const { setSearchcheckeligibleMonitor, setSelectedPolicy, setSelectedRowIndex, setClaimHistory, resetMonitor } =
    monitorSlice.actions;

export const monitorSelector = (state: RootState) => state.monitorcreatedclaim;

export default monitorSlice.reducer;
