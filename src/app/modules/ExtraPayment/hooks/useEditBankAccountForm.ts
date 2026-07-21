import { useFormik } from "formik";
import { useState } from "react";
import { EditBankAccountFormValues, ExtraPaymentListItem, RetryTransferResult } from "../store/ExtraPayment.types";
import { USE_MOCK_DATA } from "../store/ExtraPaymentMock";

// ตรวจสอบตาม spec:
// เลขที่บัญชี: ตัวเลขเท่านั้น 10-15 หลัก
export const BANK_ACCOUNT_NO_PATTERN = /^\d{10,15}$/;
// ชื่อบัญชี: ตัวอักษร (ไทย/อังกฤษ) และเว้นวรรคเท่านั้น
export const BANK_ACCOUNT_NAME_PATTERN = /^[a-zA-Zก-๙\s]+$/;

interface UseEditBankAccountFormParams {
    item: ExtraPaymentListItem;
    onRetrySuccess: (result: RetryTransferResult) => void;
}

// เงื่อนไข: บัญชีรับสินไหมใหม่ default เป็น field ว่างทั้งหมด (ตามเงื่อนไขข้อ 2 ใน spec)
// TODO: ยืนยันกับทีมอีกที เพราะ field แต่ละอันเขียนโน้ตแยกไว้ว่า "Default ค่าที่กรอกตามการแจ้งเคลม" ซึ่งขัดกับเงื่อนไขข้อนี้
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
        // การ submit จริง (ยิง insert) ยังไม่ทำในสเต็ปนี้ — จำลองผลลัพธ์สำเร็จด้วย mock เท่านั้น
        onSubmit: async (values) => {
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
                // TODO: ต่อ endpoint จริงตอนพร้อมยิง insert (ยังไม่ทำในสเต็ปนี้ตามที่ระบุ)
            } finally {
                setIsSubmitting(false);
            }
        },
    });

    // จำนวนเงินที่ต้องโอน = จำนวนเงินตามการแจ้งเคลม + ยอดโอนเพิ่ม
    const totalAmount = item.amount + item.extraTransferAmount;

    return { formik, isSubmitting, totalAmount };
};
