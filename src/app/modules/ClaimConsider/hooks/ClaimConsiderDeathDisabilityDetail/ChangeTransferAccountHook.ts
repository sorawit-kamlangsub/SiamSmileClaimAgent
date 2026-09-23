import { FormikErrors, useFormik } from "formik";
import { useGetBank } from "../../../../api/coreClaimMastersApi";
import { CaseDocumentV2Request } from "../../../../api/coreClaimApi.client";

/**
 * ประเภทเอกสารของตารางสแกน "เอกสารประกอบการเปลี่ยนบัญชี" (ใน dialog และ section หลังบันทึก ใช้ค่าเดียวกัน)
 * TODO(death-disability-api): master documentTypeId ยังไม่มีประเภทนี้ — ใช้ "อื่นๆ" ไปก่อน
 */
export const TRANSFER_ACCOUNT_DOCUMENT_TYPE = "อื่นๆ";

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
    return errors;
};

/** ผลการเปลี่ยนบัญชีที่บันทึกแล้ว — ใช้แสดง section "รายละเอียดการเปลี่ยนบัญชีปลายทางการโอนเงิน" */
export type TransferAccountChange = {
    reason: string;
    payeeName: string;
    bankId: number | undefined;
    bankName: string;
    accountTypeName: string;
    accountNo: string;
    accountName: string;
    /** เอกสารประกอบการเปลี่ยนบัญชีที่สแกนแนบแล้ว (จาก DocumentScanTable) */
    attachedDocuments: CaseDocumentV2Request[];
};

type UseChangeTransferAccountHookParams = {
    onSaved: (change: TransferAccountChange) => void;
    /** เอกสารที่แนบใน DocumentScanTable ของ dialog — ส่งต่อไปพร้อมผลการเปลี่ยนบัญชี */
    attachedDocuments: CaseDocumentV2Request[];
};

/**
 * Form ของ dialog "เปลี่ยนบัญชีปลายทางการโอนเงิน" (ปุ่มเงินสดมอบหน้างาน)
 * ทุกช่องเริ่มว่าง ให้ผู้ใช้กรอกเอง (ไม่ดึงบัญชีของผู้รับผลประโยชน์มาเติม)
 * TODO(death-disability-api): onSubmit ยังไม่ยิง API — ตอนนี้ validate ผ่านแล้วส่งผลกลับให้ parent แสดงผล
 */
const useChangeTransferAccountHook = ({ onSaved, attachedDocuments }: UseChangeTransferAccountHookParams) => {
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
        },
        validate,
        onSubmit: (values) =>
            onSaved({
                reason: values.reason.trim(),
                payeeName: values.payeeName.trim(),
                bankId: values.bankId,
                bankName: bankOptions.find((bank) => bank.organizeId === values.bankId)?.organizeName ?? "-",
                accountTypeName:
                    ACCOUNT_TYPE_OPTIONS.find((option) => option.value === values.accountTypeId)?.label ?? "-",
                accountNo: values.accountNo,
                accountName: values.accountName.trim(),
                attachedDocuments,
            }),
    });

    return { formik, bankOptions, bankLoading };
};

export default useChangeTransferAccountHook;
