import { FormikErrors, useFormik } from "formik";
import { useGetBank, useGetTitle } from "../../../../api/coreClaimMastersApi";
import { CaseDocumentV2Request } from "../../../../api/coreClaimApi.client";

/**
 * ประเภทเอกสารของตารางสแกน "เอกสารประกอบการเปลี่ยนบัญชี" (ใน dialog และ section หลังบันทึก ใช้ค่าเดียวกัน)
 * TODO(death-disability-api): master documentTypeId ยังไม่มีประเภทนี้ — ใช้ "อื่นๆ" ไปก่อน
 */
export const TRANSFER_ACCOUNT_DOCUMENT_TYPE = "เอกสารประกอบการเปลี่ยนบัญชี";

export type ChangeTransferAccountValues = {
    reason: string;
    bankId: number | undefined;
    accountNo: string;
    accountName: string;
    /** ผู้รับเงินแทน — บังคับกรอก */
    payeeTitleId: number | undefined;
    payeeFirstName: string;
    payeeLastName: string;
};

const validate = (values: ChangeTransferAccountValues) => {
    const errors: FormikErrors<ChangeTransferAccountValues> = {};
    if (!values.reason.trim()) errors.reason = "กรุณาระบุเหตุผลการเปลี่ยนแปลง";
    if (!values.bankId) errors.bankId = "กรุณาเลือกธนาคาร";
    if (!values.accountNo.trim()) errors.accountNo = "กรุณาระบุเลขที่บัญชี";
    else if (!/^\d{10,15}$/.test(values.accountNo)) errors.accountNo = "เลขที่บัญชีต้องเป็นตัวเลข 10-15 หลัก";
    if (!values.accountName.trim()) errors.accountName = "กรุณาระบุชื่อบัญชี";
    if (!values.payeeTitleId) errors.payeeTitleId = "กรุณาเลือกคำนำหน้าผู้รับเงินแทน";
    if (!values.payeeFirstName.trim()) errors.payeeFirstName = "กรุณาระบุชื่อผู้รับเงินแทน";
    if (!values.payeeLastName.trim()) errors.payeeLastName = "กรุณาระบุนามสกุลผู้รับเงินแทน";
    return errors;
};

/** ผลการเปลี่ยนบัญชีที่บันทึกแล้ว — ใช้แสดง section "รายละเอียดการเปลี่ยนบัญชีปลายทางการโอนเงิน" */
export type TransferAccountChange = {
    /** มีค่า = รายการที่บันทึกไว้แล้วของเคส (beneficiaryTypeId = 3) — แก้ไข/ลบผ่าน POST /beneficiary/update */
    beneficiaryId?: string;
    reason: string;
    /** ชื่อเต็มผู้รับเงินแทน (คำนำหน้า+ชื่อ นามสกุล) สำหรับแสดงผล — ไม่ได้กรอก = "-" */
    payeeName: string;
    payeeTitleId: number | undefined;
    payeeFirstName: string;
    payeeLastName: string;
    bankId: number | undefined;
    bankName: string;
    accountNo: string;
    accountName: string;
    /** เอกสารประกอบการเปลี่ยนบัญชีที่สแกนแนบแล้ว (จาก DocumentScanTable) */
    attachedDocuments: CaseDocumentV2Request[];
};

type UseChangeTransferAccountHookParams = {
    onSaved: (change: TransferAccountChange) => void;
    /** เอกสารที่แนบใน DocumentScanTable ของ dialog — ส่งต่อไปพร้อมผลการเปลี่ยนบัญชี */
    attachedDocuments: CaseDocumentV2Request[];
    /** ค่าเดิมตอนเปิด dialog เพื่อแก้ไข — ไม่ส่ง = ทุกช่องเริ่มว่าง */
    initialChange?: TransferAccountChange;
};

/**
 * Form ของ dialog "เปลี่ยนบัญชีปลายทางการโอนเงิน" (ปุ่มเงินสดมอบหน้างาน)
 * เพิ่มใหม่ทุกช่องเริ่มว่าง (ไม่ดึงบัญชีของผู้รับผลประโยชน์มาเติม) — แก้ไขเติมค่าเดิมจาก initialChange
 * validate ผ่านแล้วส่งผลกลับให้ parent (บันทึกลง API หรือเก็บไว้ส่งตอนบันทึกผลพิจารณา)
 */
/** TitlePersonDropdown ใช้ personTypeId = 2 — ต้องส่งค่าเดียวกันให้ได้ cache ชุดเดียวกัน */
const TITLE_PERSON_TYPE_ID = 2;

const useChangeTransferAccountHook = ({
    onSaved,
    attachedDocuments,
    initialChange,
}: UseChangeTransferAccountHookParams) => {
    const { data: bankData, isLoading: bankLoading } = useGetBank();
    const bankOptions = bankData?.data ?? [];
    const { data: titleData, isLoading: titleLoading } = useGetTitle(undefined, TITLE_PERSON_TYPE_ID);

    const formik = useFormik<ChangeTransferAccountValues>({
        initialValues: {
            reason: initialChange?.reason ?? "",
            bankId: initialChange?.bankId,
            accountNo: initialChange?.accountNo ?? "",
            accountName: initialChange?.accountName ?? "",
            payeeTitleId: initialChange?.payeeTitleId,
            payeeFirstName: initialChange?.payeeFirstName ?? "",
            payeeLastName: initialChange?.payeeLastName ?? "",
        },
        validate,
        onSubmit: (values) => {
            const titleName = titleData?.data?.find((item) => item.titleId === values.payeeTitleId)?.titleName ?? "";
            const firstName = values.payeeFirstName.trim();
            const lastName = values.payeeLastName.trim();
            onSaved({
                beneficiaryId: initialChange?.beneficiaryId,
                reason: values.reason.trim(),
                payeeName: [`${titleName}${firstName}`, lastName].filter((part) => part).join(" ") || "-",
                payeeTitleId: values.payeeTitleId,
                payeeFirstName: firstName,
                payeeLastName: lastName,
                bankId: values.bankId,
                bankName: bankOptions.find((bank) => bank.organizeId === values.bankId)?.organizeName ?? "-",
                accountNo: values.accountNo,
                accountName: values.accountName.trim(),
                attachedDocuments,
            });
        },
    });

    return { formik, bankOptions, bankLoading, titleOptions: titleData?.data ?? [], titleLoading };
};

export default useChangeTransferAccountHook;
