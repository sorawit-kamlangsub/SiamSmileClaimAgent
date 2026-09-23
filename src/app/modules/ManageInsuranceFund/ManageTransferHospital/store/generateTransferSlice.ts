import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type GenerateTransferState = {
    generateTransferDialog: {
        isOpen: boolean;
        generateListData: any[];
    };
};

const initialState: GenerateTransferState = {
    generateTransferDialog: {
        isOpen: false,
        generateListData: [],
    },
};

export type SetGenerateTransferDialogPayload = {
    isOpen: boolean;
    generateListData: any[];
};

const generateTransferSlice = createSlice({
    name: "generateTransfer",
    initialState,
    reducers: {
        setDialogOpen: (state, action: PayloadAction<SetGenerateTransferDialogPayload>) => {
            state.generateTransferDialog.isOpen = action.payload.isOpen;
            state.generateTransferDialog.generateListData = action.payload.generateListData;
        },

        resetIsOpenDialog: () => {
            initialState.generateTransferDialog.isOpen;
        },

        resetToDefault: () => {
            initialState;
        },
    },
});

export const { setDialogOpen, resetIsOpenDialog, resetToDefault } = generateTransferSlice.actions;

export default generateTransferSlice.reducer;
