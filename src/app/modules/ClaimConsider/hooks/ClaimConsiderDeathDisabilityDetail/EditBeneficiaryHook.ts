import { FormikErrors, useFormik } from "formik";
import { useGetBank } from "../../../../api/coreClaimMastersApi";
import { validatePhoneNumber, validateThaiCitizenID } from "../../../_common/commonValidators";

export type EditBeneficiaryValues = {
    relationTypeId: number | undefined;
    /** เลขบัตรประชาชน (ตัวเลขล้วน 13 หลัก) */
    documentNo: string;
    titleId: number | undefined;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    bankId: number | undefined;
    accountNo: string;
    accountName: string;
    amount: number | undefined;
};

const validate = (values: EditBeneficiaryValues) => {
    const errors: FormikErrors<EditBeneficiaryValues> = {};
    if (!values.relationTypeId) errors.relationTypeId = "กรุณาเลือกความสัมพันธ์";
    if (!values.documentNo) errors.documentNo = "กรุณาระบุเลขบัตรประชาชน";
    else if (!validateThaiCitizenID(values.documentNo)) errors.documentNo = "เลขบัตรประชาชนไม่ถูกต้อง";
    if (!values.titleId) errors.titleId = "กรุณาเลือกคำนำหน้าชื่อ";
    if (!values.firstName.trim()) errors.firstName = "กรุณาระบุชื่อ";
    if (!values.lastName.trim()) errors.lastName = "กรุณาระบุนามสกุล";
    if (!values.phoneNumber) errors.phoneNumber = "กรุณาระบุเบอร์โทรศัพท์";
    else if (!validatePhoneNumber(values.phoneNumber)) errors.phoneNumber = "เบอร์โทรศัพท์ไม่ถูกต้อง";
    if (!values.bankId) errors.bankId = "กรุณาเลือกธนาคาร";
    if (!values.accountNo.trim()) errors.accountNo = "กรุณาระบุเลขที่บัญชี";
    else if (!/^\d{10,15}$/.test(values.accountNo)) errors.accountNo = "เลขที่บัญชีต้องเป็นตัวเลข 10-15 หลัก";
    if (!values.accountName.trim()) errors.accountName = "กรุณาระบุชื่อบัญชี";
    if (!values.amount || values.amount <= 0) errors.amount = "กรุณาระบุจำนวนเงิน";
    return errors;
};

type UseEditBeneficiaryHookParams = {
    initialValues: Partial<EditBeneficiaryValues>;
    onSaved: () => void;
};

/**
 * Form ของ dialog "แก้ไขข้อมูลผู้รับผลประโยชน์" (ปุ่มแก้ไขข้อมูล)
 * TODO(death-disability-api): onSubmit ยังไม่ยิง API — ตอนนี้ validate ผ่านแล้วปิด dialog
 */
const useEditBeneficiaryHook = ({ initialValues, onSaved }: UseEditBeneficiaryHookParams) => {
    const { data: bankData, isLoading: bankLoading } = useGetBank();

    const formik = useFormik<EditBeneficiaryValues>({
        initialValues: {
            relationTypeId: undefined,
            documentNo: "",
            titleId: undefined,
            firstName: "",
            lastName: "",
            phoneNumber: "",
            bankId: undefined,
            accountNo: "",
            accountName: "",
            amount: undefined,
            ...initialValues,
        },
        validate,
        onSubmit: () => onSaved(),
    });

    return { formik, bankOptions: bankData?.data ?? [], bankLoading };
};

export default useEditBeneficiaryHook;
