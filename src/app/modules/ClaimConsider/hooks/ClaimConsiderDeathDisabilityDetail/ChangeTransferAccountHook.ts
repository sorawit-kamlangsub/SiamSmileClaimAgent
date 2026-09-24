import { FormikErrors, useFormik } from "formik";
import { useGetBank, useGetTitle } from "../../../../api/coreClaimMastersApi";
import { CaseDocumentV2Request } from "../../../../api/coreClaimApi.client";

/**
 * ประเภทเอกสารของตารางสแกน "เอกสารประกอบการเปลี่ยนบัญชี" (ใน dialog และ section หลังบันทึก ใช้ค่าเดียวกัน)
 * TODO(death-disability-api): master documentTypeId ยังไม่มีประเภทนี้ — ใช้ "อื่นๆ" ไปก่อน
 */
export const TRANSFER_ACCOUNT_DOCUMENT_TYPE = "เอกสารประกอบการเปลี่ยนบัญชี";

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
    /** ผู้รับเงินแทน — ไม่บังคับกรอก */
    payeeTitleId: number | undefined;
    payeeFirstName: string;
    payeeLastName: string;
};

const validate = (values: ChangeTransferAccountValues) => {
    const errors: FormikErrors<ChangeTransferAccountValues> = {};
    if (!values.reason.trim()) errors.reason = "กรุณาระบุเหตุผลการเปลี่ยนแปลง";
    if (!values.bankId) errors.bankId = "กรุณาเลือกธนาคาร";
    if (!values.accountTypeId) errors.accountTypeId = "กรุณาเลือกประเภทบัญชี";
    if (!values.accountNo.trim()) errors.accountNo = "กรุณาระบุเลขที่บัญชี";
    else if (!/^\d{10,15}$/.test(values.accountNo)) errors.accountNo = "เลขที่บัญชีต้องเป็นตัวเลข 10-15 หลัก";
    if (!values.accountName.trim()) errors.accountName = "กรุณาระบุชื่อบัญชี";
    return errors;
};

/** ผลการเปลี่ยนบัญชีที่บันทึกแล้ว — ใช้แสดง section "รายละเอียดการเปลี่ยนบัญชีปลายทางการโอนเงิน" */
export type TransferAccountChange = {
    reason: string;
    /** ชื่อเต็มผู้รับเงินแทน (คำนำหน้า+ชื่อ นามสกุล) สำหรับแสดงผล — ไม่ได้กรอก = "-" */
    payeeName: string;
    payeeTitleId: number | undefined;
    payeeFirstName: string;
    payeeLastName: string;
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
/** TitlePersonDropdown ใช้ personTypeId = 2 — ต้องส่งค่าเดียวกันให้ได้ cache ชุดเดียวกัน */
const TITLE_PERSON_TYPE_ID = 2;

const useChangeTransferAccountHook = ({ onSaved, attachedDocuments }: UseChangeTransferAccountHookParams) => {
    const { data: bankData, isLoading: bankLoading } = useGetBank();
    const bankOptions = bankData?.data ?? [];
    const { data: titleData } = useGetTitle(undefined, TITLE_PERSON_TYPE_ID);

    const formik = useFormik<ChangeTransferAccountValues>({
        initialValues: {
            reason: "",
            bankId: undefined,
            accountTypeId: undefined,
            accountNo: "",
            accountName: "",
            payeeTitleId: undefined,
            payeeFirstName: "",
            payeeLastName: "",
        },
        validate,
        onSubmit: (values) => {
            const titleName = titleData?.data?.find((item) => item.titleId === values.payeeTitleId)?.titleName ?? "";
            const firstName = values.payeeFirstName.trim();
            const lastName = values.payeeLastName.trim();
            onSaved({
                reason: values.reason.trim(),
                payeeName: [`${titleName}${firstName}`, lastName].filter((part) => part).join(" ") || "-",
                payeeTitleId: values.payeeTitleId,
                payeeFirstName: firstName,
                payeeLastName: lastName,
                bankId: values.bankId,
                bankName: bankOptions.find((bank) => bank.organizeId === values.bankId)?.organizeName ?? "-",
                accountTypeName:
                    ACCOUNT_TYPE_OPTIONS.find((option) => option.value === values.accountTypeId)?.label ?? "-",
                accountNo: values.accountNo,
                accountName: values.accountName.trim(),
                attachedDocuments,
            });
        },
    });

    return { formik, bankOptions, bankLoading };
};

export default useChangeTransferAccountHook;
