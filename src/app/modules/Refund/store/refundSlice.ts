import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type RefundState = {
    searchRefund: {
        searchDetail: string | undefined;
    };
    dialogRefund: {
        isOpen: boolean;
    };
};

const initialState: RefundState = {
    searchRefund: {
        searchDetail: "",
    },
    dialogRefund: {
        isOpen: false,
    },
};

export type SetSearchBankStatusPayload = {
    searchDetail: string | undefined;
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

        resetToDefault: () => {
            initialState;
        },
    },
});

export const { setSearchClaimBySearchDetail, setIsOpenDialog, resetToDefault } = refundSlice.actions;

export default refundSlice.reducer;
