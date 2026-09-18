import { FormikErrors, useFormik } from "formik";
import { useGetBank } from "../../../../api/coreClaimMastersApi";

/** ไฟล์แนบที่รับได้ตาม mockup: .jpg .jpeg .png .pdf ไม่เกิน 10MB */
export const TRANSFER_ACCOUNT_FILE_ACCEPT = ".jpg,.jpeg,.png,.pdf";
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/** TODO(death-disability-api): ยังไม่มี master ประเภทบัญชี — ใช้ค่าคงที่ไปก่อน */
export const ACCOUNT_TYPE_OPTIONS = [
    { value: 1, label: "ออมทรัพย์" },
    { value: 2, label: "กระแสรายวัน" },
    { value: 3, label: "ฝากประจำ" },
];

export type ChangeTransferAccountValues = {
    reason: string;
    bankId: number | undefined;
    accountTypeId: number | undefined;
    accountNo: string;
    accountName: string;
    payeeName: string;
    attachment: File | undefined;
};

const validate = (values: ChangeTransferAccountValues) => {
    const errors: FormikErrors<ChangeTransferAccountValues> = {};
    if (!values.reason.trim()) errors.reason = "กรุณาระบุเหตุผลการเปลี่ยนแปลง";
    if (!values.bankId) errors.bankId = "กรุณาเลือกธนาคาร";
    if (!values.accountTypeId) errors.accountTypeId = "กรุณาเลือกประเภทบัญชี";
    if (!values.accountNo.trim()) errors.accountNo = "กรุณาระบุเลขที่บัญชี";
    else if (!/^\d{10,15}$/.test(values.accountNo)) errors.accountNo = "เลขที่บัญชีต้องเป็นตัวเลข 10-15 หลัก";
    if (!values.accountName.trim()) errors.accountName = "กรุณาระบุชื่อบัญชี";
    if (!values.payeeName.trim()) errors.payeeName = "กรุณาระบุชื่อผู้รับเงินแทน";
    if (values.attachment && values.attachment.size > MAX_FILE_SIZE_BYTES) {
        errors.attachment = "ขนาดไฟล์ต้องไม่เกิน 10MB";
    }
    return errors;
};

/** ผลการเปลี่ยนบัญชีที่บันทึกแล้ว — ใช้แสดง section "รายละเอียดการเปลี่ยนบัญชีปลายทางการโอนเงิน" */
export type TransferAccountChange = {
    reason: string;
    payeeName: string;
    bankName: string;
    accountTypeName: string;
    accountNo: string;
    accountName: string;
    attachmentName: string | undefined;
};

type UseChangeTransferAccountHookParams = {
    initialValues: Partial<ChangeTransferAccountValues>;
    onSaved: (change: TransferAccountChange) => void;
};

/**
 * Form ของ dialog "เปลี่ยนบัญชีปลายทางการโอนเงิน" (ปุ่มเงินสดมอบหน้างาน)
 * TODO(death-disability-api): onSubmit ยังไม่ยิง API — ตอนนี้ validate ผ่านแล้วส่งผลกลับให้ parent แสดงผล
 */
const useChangeTransferAccountHook = ({ initialValues, onSaved }: UseChangeTransferAccountHookParams) => {
    const { data: bankData, isLoading: bankLoading } = useGetBank();
    const bankOptions = bankData?.data ?? [];

    const formik = useFormik<ChangeTransferAccountValues>({
        initialValues: {
            reason: "",
            bankId: undefined,
            accountTypeId: undefined,
            accountNo: "",
            accountName: "",
            payeeName: "",
            attachment: undefined,
            ...initialValues,
        },
        validate,
        onSubmit: (values) =>
            onSaved({
                reason: values.reason.trim(),
                payeeName: values.payeeName.trim(),
                bankName: bankOptions.find((bank) => bank.organizeId === values.bankId)?.organizeName ?? "-",
                accountTypeName:
                    ACCOUNT_TYPE_OPTIONS.find((option) => option.value === values.accountTypeId)?.label ?? "-",
                accountNo: values.accountNo,
                accountName: values.accountName.trim(),
                attachmentName: values.attachment?.name,
            }),
    });

    return { formik, bankOptions, bankLoading };
};

export default useChangeTransferAccountHook;
