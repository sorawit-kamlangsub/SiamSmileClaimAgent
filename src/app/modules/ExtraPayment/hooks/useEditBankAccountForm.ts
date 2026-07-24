import { useFormik } from "formik";
import { useState } from "react";
import { EditBankAccountFormValues, ExtraPaymentListItem, RetryTransferResult } from "../store/ExtraPayment.types";
import { USE_MOCK_DATA } from "../store/ExtraPaymentMock";

export const BANK_ACCOUNT_NO_PATTERN = /^\d{10,15}$/;
export const BANK_ACCOUNT_NAME_PATTERN = /^[a-zA-Zก-๙\s]+$/;

interface UseEditBankAccountFormParams {
    item: ExtraPaymentListItem | null;
    onRetrySuccess: (result: RetryTransferResult) => void;
}

// item เป็น null ได้ (ตอน modal ปิดอยู่) ต้องรับ optional เพื่อให้ hook นี้เรียกได้แบบ unconditional
// จาก component แม่ทุกครั้ง — ห้าม early return ก่อนเรียก hook นี้ ไม่งั้นจะชน rules of hooks
export const useEditBankAccountForm = ({ item, onRetrySuccess }: UseEditBankAccountFormParams) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formik = useFormik<EditBankAccountFormValues>({
        initialValues: {
            relationshipId: undefined,
            relationshipId_selectedText: "",
            bankId: undefined,
            bankId_selectedText: "",
            accountNo: "",
            accountName: "",
        },
        validate: (v) => {
            const e: Partial<Record<keyof EditBankAccountFormValues, string>> = {};
            if (!v.relationshipId) e.relationshipId = "โปรดระบุ";
            if (!v.bankId) e.bankId = "โปรดระบุ";
            if (!BANK_ACCOUNT_NO_PATTERN.test(v.accountNo)) e.accountNo = "กรอกตัวเลข 10-15 หลัก";
            if (!v.accountName?.trim() || !BANK_ACCOUNT_NAME_PATTERN.test(v.accountName)) {
                e.accountName = "กรอกได้เฉพาะตัวอักษรและการเว้นวรรค";
            }
            return e;
        },
        onSubmit: async (values) => {
            if (!item) return;
            setIsSubmitting(true);
            try {
                if (USE_MOCK_DATA) {
                    await new Promise((r) => setTimeout(r, 400));
                    const result: RetryTransferResult = {
                        success: true,
                        bankAccount: {
                            id: item.oldBankAccount.id,
                            bankId: values.bankId!,
                            bankName: values.bankId_selectedText,
                            bankAccountRelationTypeName: values.relationshipId_selectedText,
                            bankAccountNo: values.accountNo,
                            bankAccountName: values.accountName,
                            isDefault: true,
                        },
                        totalExtraTransferAmount: item.amount + item.extraTransferAmount,
                        transferItems: [{ fullName: item.insuredName, amount: item.amount + item.extraTransferAmount }],
                    };
                    onRetrySuccess(result);
                    return;
                }
                // TODO: ต่อ endpoint จริงตอนพร้อมยิง insert
            } finally {
                setIsSubmitting(false);
            }
        },
    });

    const totalAmount = item ? item.amount + item.extraTransferAmount : 0;

    return { formik, isSubmitting, totalAmount };
};
