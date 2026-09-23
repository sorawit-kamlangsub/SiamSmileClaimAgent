import { FormikErrors, useFormik } from "formik";
import { useGetBank, useGetRelationType, useGetTitle } from "../../../../api/coreClaimMastersApi";
import { GetDeathAndDisabilityBeneficiaryDtoResponse } from "../../../../api/coreClaimApi.client";
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
    /** ข้อมูลผู้รับผลประโยชน์ปัจจุบัน (จาก API หรือที่แก้ไว้ก่อนหน้า) */
    beneficiary: GetDeathAndDisabilityBeneficiaryDtoResponse | undefined;
    onSaved: (updated: GetDeathAndDisabilityBeneficiaryDtoResponse) => void;
};

/** TitlePersonDropdown ใช้ personTypeId = 2 — ต้องส่งค่าเดียวกันให้ได้ cache ชุดเดียวกัน */
const TITLE_PERSON_TYPE_ID = 2;

const toFormValues = (item: GetDeathAndDisabilityBeneficiaryDtoResponse | undefined): EditBeneficiaryValues => ({
    relationTypeId: item?.relationId ?? undefined,
    documentNo: item?.idCard?.replace(/\D/g, "") ?? "",
    // DTO ส่ง titleId เป็น string แต่ dropdown ใช้ number
    titleId: item?.titleId ? Number(item.titleId) : undefined,
    firstName: item?.firstName ?? "",
    lastName: item?.lastName ?? "",
    phoneNumber: item?.phoneNo?.replace(/\D/g, "") ?? "",
    bankId: item?.bankId ?? undefined,
    accountNo: item?.bankAccountNo ?? "",
    accountName: item?.bankAccountName ?? "",
    amount: item?.payoutAmount ?? undefined,
});

/**
 * Form ของ dialog "แก้ไขข้อมูลผู้รับผลประโยชน์" (ปุ่มแก้ไขข้อมูล)
 * กดบันทึกแล้วยังไม่ยิง API — คืนข้อมูลที่แก้ (รูปแบบ DTO เดิม พร้อมชื่อจาก master เพื่อแสดงบนการ์ด) ให้ parent
 * เก็บไว้ ข้อมูลจริงบันทึกตอนกด "ยืนยันบันทึก" ที่ผลการพิจารณา
 */
const useEditBeneficiaryHook = ({ beneficiary, onSaved }: UseEditBeneficiaryHookParams) => {
    const { data: bankData, isLoading: bankLoading } = useGetBank();
    // query เดียวกับ RelationTypeDropdown / TitlePersonDropdown — ได้จาก cache ไม่ยิงซ้ำ
    const { data: relationTypeData } = useGetRelationType();
    const { data: titleData } = useGetTitle(undefined, TITLE_PERSON_TYPE_ID);

    const toBeneficiaryDto = (values: EditBeneficiaryValues): GetDeathAndDisabilityBeneficiaryDtoResponse => ({
        ...beneficiary,
        relationId: values.relationTypeId,
        relationTypeName: relationTypeData?.data?.find((item) => item.relationTypeId === values.relationTypeId)
            ?.relationTypeName,
        idCard: values.documentNo,
        titleId: values.titleId?.toString(),
        titleName: titleData?.data?.find((item) => item.titleId === values.titleId)?.titleName,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        phoneNo: values.phoneNumber,
        bankId: values.bankId,
        bankName: bankData?.data?.find((item) => item.organizeId === values.bankId)?.organizeName,
        bankAccountNo: values.accountNo,
        bankAccountName: values.accountName.trim(),
        payoutAmount: values.amount,
    });

    const formik = useFormik<EditBeneficiaryValues>({
        initialValues: toFormValues(beneficiary),
        validate,
        onSubmit: (values) => onSaved(toBeneficiaryDto(values)),
    });

    return { formik, bankOptions: bankData?.data ?? [], bankLoading };
};

export default useEditBeneficiaryHook;
