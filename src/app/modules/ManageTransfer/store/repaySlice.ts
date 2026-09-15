import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type RepayState = {
    searchRepay: {
        searchDetail: string | undefined;
    };
};

const initialState: RepayState = {
    searchRepay: {
        searchDetail: "",
    },
};

export type SetSearchRepayPayload = {
    searchDetail: string | undefined;
};

const repaySlice = createSlice({
    name: "Refund",
    initialState,
    reducers: {
        setSearchBankStatusBySearchDetail: (state, action: PayloadAction<SetSearchRepayPayload>) => {
            state.searchRepay.searchDetail = action.payload.searchDetail;
        },

        resetToDefault: () => {
            initialState.searchRepay;
        },
    },
});

export const { setSearchBankStatusBySearchDetail, resetToDefault } = repaySlice.actions;

export default repaySlice.reducer;
