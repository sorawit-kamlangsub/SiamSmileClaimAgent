import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type AdjustState = {
    dialogEditAdjustTransferDetail: {
        isOpen: boolean;
    };

    selectRowForEdit: {
        paymentId: string;
        amount: number;
    };
};

const initialState: AdjustState = {
    dialogEditAdjustTransferDetail: {
        isOpen: false,
    },

    selectRowForEdit: {
        paymentId: "",
        amount: 0,
    },
};

export type SetIsOpenDialogPayload = {
    isOpen: boolean;
};

export type SetSelectedRowForEditPayload = {
    paymentId: string;
    amount: number;
};

const adjustSlice = createSlice({
    name: "AdjustMonitorSlice",
    initialState,
    reducers: {
        setSelectedRowForEdit: (state, action: PayloadAction<SetSelectedRowForEditPayload>) => {
            state.selectRowForEdit = action.payload;
        },

        setOpenDialogAdjustDetail: (state, action: PayloadAction<SetIsOpenDialogPayload>) => {
            state.dialogEditAdjustTransferDetail.isOpen = action.payload.isOpen;
        },

        resetToDefault: () => {
            initialState;
        },
    },
});

export const { setSelectedRowForEdit, setOpenDialogAdjustDetail, resetToDefault } = adjustSlice.actions;

export default adjustSlice.reducer;
