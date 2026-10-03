import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ManagePaymentHospitalSearchState = {
    searchHospital: {
        searchDetail: string | undefined;
    };

    addDialog: {
        isOpen: boolean;
    };
};

const initialState: ManagePaymentHospitalSearchState = {
    searchHospital: {
        searchDetail: "",
    },
    addDialog: {
        isOpen: false,
    },
};

export type SetManagePaymentHospitalSearchPayload = {
    searchDetail: string | undefined;
};

export type SetAddDialogPayload = {
    isOpen: boolean;
};

const managePaymentHospitalSlice = createSlice({
    name: "managePaymentHospital",
    initialState,
    reducers: {
        setManagePaymentHospitalBySearchDetail: (
            state,
            action: PayloadAction<SetManagePaymentHospitalSearchPayload>
        ) => {
            state.searchHospital.searchDetail = action.payload.searchDetail;
        },

        setDialogOpen: (state, action: PayloadAction<SetAddDialogPayload>) => {
            state.addDialog.isOpen = action.payload.isOpen;
        },

        resetIsOpenDialog: () => {
            initialState.addDialog.isOpen;
        },

        resetToDefault: () => {
            initialState.searchHospital;
        },
    },
});

export const { setManagePaymentHospitalBySearchDetail, setDialogOpen, resetIsOpenDialog, resetToDefault } =
    managePaymentHospitalSlice.actions;

export default managePaymentHospitalSlice.reducer;
