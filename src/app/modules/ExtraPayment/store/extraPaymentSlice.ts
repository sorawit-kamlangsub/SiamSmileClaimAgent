import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ExtraPaymentClaimItem } from "./ExtraPayment.types";
import { RootState } from "../../../../redux";

interface ExtraPaymentState {
    cpgNo: string | null;
    claimOnLineId: number | null;
    claimItems: ExtraPaymentClaimItem[];
    selectedBankAccountId: number | null;
    reasonId: number | null;
    remark: string;
}

const initialState: ExtraPaymentState = {
    cpgNo: null,
    claimOnLineId: null,
    claimItems: [],
    selectedBankAccountId: null,
    reasonId: null,
    remark: "",
};

const extraPaymentSlice = createSlice({
    name: "extraPayment",
    initialState,
    reducers: {
        setCpgNo(state, action: PayloadAction<string>) {
            state.cpgNo = action.payload;
        },
        setClaimOnLineId(state, action: PayloadAction<number | null>) {
            state.claimOnLineId = action.payload;
        },
        setClaimItems(state, action: PayloadAction<ExtraPaymentClaimItem[]>) {
            state.claimItems = action.payload;
        },
        setExtraTransferAmount(state, action: PayloadAction<{ claimOnLineId: number; amount: number | null }>) {
            const { claimOnLineId, amount } = action.payload;
            const item = state.claimItems.find((i) => i.claimOnLineId === claimOnLineId);
            if (item) {
                item.extraTransferAmount = amount;
            }
        },
        setSelectedBankAccountId(state, action: PayloadAction<number>) {
            state.selectedBankAccountId = action.payload;
        },
        setReasonId(state, action: PayloadAction<number>) {
            state.reasonId = action.payload;
        },
        setRemark(state, action: PayloadAction<string>) {
            state.remark = action.payload;
        },
        resetExtraPayment() {
            return initialState;
        },
    },
});

export const {
    setCpgNo,
    setClaimOnLineId,
    setClaimItems,
    setExtraTransferAmount,
    setSelectedBankAccountId,
    setReasonId,
    setRemark,
    resetExtraPayment,
} = extraPaymentSlice.actions;

export default extraPaymentSlice.reducer;

export const extraPaymentSelector = (state: RootState) => state.extraPayment;
