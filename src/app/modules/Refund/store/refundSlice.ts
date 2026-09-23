import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type RefundState = {
    searchRefund: {
        searchDetail: string | undefined;
    };
    dialogRefund: {
        isOpen: boolean;
    };

    searchMonitor: {
        branchId: number | undefined;
        paymentStatusId: number | undefined;
    };
};

const initialState: RefundState = {
    searchRefund: {
        searchDetail: "",
    },
    dialogRefund: {
        isOpen: false,
    },
    searchMonitor: {
        branchId: undefined,
        paymentStatusId: undefined,
    },
};

export type SetSearchBankStatusPayload = {
    searchDetail: string | undefined;
};

export type SetSearchMonitorByFilterPayload = {
    branchId: number | undefined;
    paymentStatusId: number | undefined;
};

export type SetIsOpenDialogPayload = {
    isOpen: boolean;
};

const refundSlice = createSlice({
    name: "Refund",
    initialState,
    reducers: {
        setSearchClaimBySearchDetail: (state, action: PayloadAction<SetSearchBankStatusPayload>) => {
            state.searchRefund.searchDetail = action.payload.searchDetail;
        },

        setIsOpenDialog: (state, action: PayloadAction<SetIsOpenDialogPayload>) => {
            state.dialogRefund.isOpen = action.payload.isOpen;
        },

        setSearchMonitorByFilter: (state, action: PayloadAction<SetSearchMonitorByFilterPayload>) => {
            state.searchMonitor.branchId = action.payload.branchId;
            state.searchMonitor.paymentStatusId = action.payload.paymentStatusId;
        },

        resetFilterSearch: (state) => {
            state.searchMonitor = initialState.searchMonitor;
        },

        resetToDefault: () => {
            initialState;
        },
    },
});

export const {
    setSearchClaimBySearchDetail,
    setIsOpenDialog,
    setSearchMonitorByFilter,
    resetFilterSearch,
    resetToDefault,
} = refundSlice.actions;

export default refundSlice.reducer;
