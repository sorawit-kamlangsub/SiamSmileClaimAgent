import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type BankStatusCheckState = {
    searchBankStatusCheck: {
        searchDetail: string | undefined;
    };
};

const initialState: BankStatusCheckState = {
    searchBankStatusCheck: {
        searchDetail: "",
    },
};

export type SetSearchBankStatusPayload = {
    searchDetail: string | undefined;
};

const bankStatusCheckSlice = createSlice({
    name: "Refund",
    initialState,
    reducers: {
        setSearchBankStatusBySearchDetail: (state, action: PayloadAction<SetSearchBankStatusPayload>) => {
            state.searchBankStatusCheck.searchDetail = action.payload.searchDetail;
        },

        resetToDefault: () => {
            initialState.searchBankStatusCheck;
        },
    },
});

export const { setSearchBankStatusBySearchDetail, resetToDefault } = bankStatusCheckSlice.actions;

export default bankStatusCheckSlice.reducer;
