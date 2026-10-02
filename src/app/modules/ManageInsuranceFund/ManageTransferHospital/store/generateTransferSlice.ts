import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type GenerateTransferState = {
    generateTransferDialog: {
        isOpen: boolean;
        generateListData: any[];
    };
};

export type GenerateSuccessSummaryState = {
    generateSuccessSummaryDialog: {
        isOpen: boolean;
        generateSuccessListData: any;
    };
};

const initialState: GenerateTransferState & GenerateSuccessSummaryState = {
    generateTransferDialog: {
        isOpen: false,
        generateListData: [],
    },
    generateSuccessSummaryDialog: {
        isOpen: false,
        generateSuccessListData: null,
    },
};

export type SetGenerateTransferDialogPayload = {
    isOpen: boolean;
    generateListData: any[];
};

export type SetGenerateSuccessSummaryDialogPayload = {
    isOpen: boolean;
    generateSuccessListData: any;
};

const generateTransferSlice = createSlice({
    name: "generateTransfer",
    initialState,
    reducers: {
        setDialogOpen: (state, action: PayloadAction<SetGenerateTransferDialogPayload>) => {
            state.generateTransferDialog.isOpen = action.payload.isOpen;
            state.generateTransferDialog.generateListData = action.payload.generateListData;
        },

        setDialogSuccessSummaryOpen: (state, action: PayloadAction<SetGenerateSuccessSummaryDialogPayload>) => {
            state.generateSuccessSummaryDialog.isOpen = action.payload.isOpen;
            state.generateSuccessSummaryDialog.generateSuccessListData = action.payload.generateSuccessListData;
        },

        resetIsOpenDialog: () => {
            initialState.generateTransferDialog.isOpen;
        },

        resetIsDialogSuccessSummaryOpen: () => {
            initialState.generateSuccessSummaryDialog.isOpen;
        },

        resetToDefault: () => {
            initialState;
        },
    },
});

export const {
    setDialogOpen,
    setDialogSuccessSummaryOpen,
    resetIsOpenDialog,
    resetIsDialogSuccessSummaryOpen,
    resetToDefault,
} = generateTransferSlice.actions;

export default generateTransferSlice.reducer;
