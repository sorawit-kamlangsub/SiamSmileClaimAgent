import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { ExtraPaymentFormValues } from "../store/ExtraPayment.types";
import { resetExtraPayment, setSelectedBankAccountId, setExtraTransferAmount } from "../store/extraPaymentSlice";
import { useSubmitExtraPayment } from "./useSubmitExtraPayment";
import { RootState } from "../../../../redux";

interface UseExtraPaymentFormParams {
    cpgNo: string;
    onSuccess?: (claimNos: string[]) => void;
    restrictToClaimOnLineId?: number;
}

export const useExtraPaymentForm = ({ cpgNo, onSuccess, restrictToClaimOnLineId }: UseExtraPaymentFormParams) => {
    const dispatch = useDispatch();
    const { submit, isSubmitting } = useSubmitExtraPayment();

    const allClaimItems = useSelector((state: RootState) => state.extraPayment.claimItems);
    const claimItems = restrictToClaimOnLineId
        ? allClaimItems.filter((i) => i.claimOnLineId === restrictToClaimOnLineId)
        : allClaimItems;
    const selectedBankAccountId = useSelector((state: RootState) => state.extraPayment.selectedBankAccountId);

    const formik = useFormik<ExtraPaymentFormValues>({
        initialValues: {
            reasonId: undefined,
            reasonId_selectedText: "",
            remark: "",
        },
        validate: (v) => {
            const e: Partial<Record<keyof ExtraPaymentFormValues, string>> = {};
            if (!v.reasonId) e.reasonId = "โปรดระบุ";
            if (!selectedBankAccountId) e.reasonId = e.reasonId ?? "โปรดเลือกบัญชีรับสินไหม";
            return e;
        },
        onSubmit: async (values) => {
            if (!selectedBankAccountId || !values.reasonId) return;

            const extraTransferAmounts: Record<number, number> = {};
            claimItems.forEach((item) => {
                if (item.extraTransferAmount) {
                    extraTransferAmounts[item.claimOnLineId] = item.extraTransferAmount;
                }
            });

            const result = await submit({
                cpgNo,
                claimOnLineIds: claimItems.map((i) => i.claimOnLineId),
                claimNos: claimItems.map((i) => i.claimNo),
                extraTransferAmounts,
                bankAccountId: selectedBankAccountId,
                reasonId: values.reasonId,
                remark: values.remark,
            });

            if (result?.success) {
                onSuccess?.(result.claimNos);
            }
        },
    });

    const onSelectBankAccount = (id: number) => dispatch(setSelectedBankAccountId(id));

    const onChangeExtraTransferAmount = (claimOnLineId: number, amount: number | null) =>
        dispatch(setExtraTransferAmount({ claimOnLineId, amount }));

    // เรียกเมื่อกด "ตกลง" บน ExtraPaymentSuccessModal เพื่อล้าง state ก่อนย้อนกลับ
    const finalizeSuccess = () => {
        formik.resetForm();
        dispatch(resetExtraPayment());
    };

    return {
        formik,
        claimItems,
        selectedBankAccountId,
        onSelectBankAccount,
        onChangeExtraTransferAmount,
        isSubmitting,
        finalizeSuccess,
    };
};
