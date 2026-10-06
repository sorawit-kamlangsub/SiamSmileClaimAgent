import { FormikErrors, useFormik } from "formik";
import { useGetBank, useGetRelationType, useGetTitle } from "../../../../api/coreClaimMastersApi";
import { useUpdateBeneficiary } from "../../../../api/coreClaimApi";
import { GetDeathAndDisabilityBeneficiaryDtoResponse } from "../../../../api/coreClaimApi.client";
import { swalError } from "../../../_common";
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

const formatAmount = (value: number) =>
    value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** ขอบเขตจำนวนเงิน — ยอดของคนนี้ + ผู้รับผลประโยชน์รายอื่น ต้องไม่เกินยอดเงินรวมทั้งหมดของรายละเอียดค่าใช้จ่าย */
type AmountLimit = { otherPayoutAmount: number; totalTransferAmount: number };

const validate = (values: EditBeneficiaryValues, { otherPayoutAmount, totalTransferAmount }: AmountLimit) => {
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
    else if (values.amount > totalTransferAmount)
        errors.amount = `จำนวนเงินต้องไม่เกินยอดเงินรวมทั้งหมด ${formatAmount(totalTransferAmount)} บาท`;
    // เทียบเป็นสตางค์ กันทศนิยม float คลาดเคลื่อน
    else if (Math.round((values.amount + otherPayoutAmount) * 100) > Math.round(totalTransferAmount * 100))
        errors.amount = `รวมกับผู้รับผลประโยชน์รายอื่นแล้วเกินยอดเงินรวมทั้งหมด (ระบุได้ไม่เกิน ${formatAmount(
            Math.max(totalTransferAmount - otherPayoutAmount, 0)
        )} บาท)`;
    return errors;
};

type UseEditBeneficiaryHookParams = {
    /** ข้อมูลผู้รับผลประโยชน์ปัจจุบัน (จาก API หรือที่แก้ไว้ก่อนหน้า) */
    beneficiary: GetDeathAndDisabilityBeneficiaryDtoResponse | undefined;
    /** บันทึกผ่าน API สำเร็จ */
    onSaved: () => void;
} & AmountLimit;

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
 * กดบันทึกข้อมูล → POST /beneficiary/update ทันที สำเร็จแล้วรายการผู้รับผลประโยชน์โหลดใหม่ (invalidate query)
 * แล้วเรียก onSaved ให้ parent ปิด dialog
 */
const useEditBeneficiaryHook = ({
    beneficiary,
    onSaved,
    otherPayoutAmount,
    totalTransferAmount,
}: UseEditBeneficiaryHookParams) => {
    const { data: bankData, isLoading: bankLoading } = useGetBank();
    // query เดียวกับ RelationTypeDropdown / TitlePersonDropdown — ได้จาก cache ไม่ยิงซ้ำ
    const { data: relationTypeData } = useGetRelationType();
    const { data: titleData } = useGetTitle(undefined, TITLE_PERSON_TYPE_ID);
    const updateBeneficiary = useUpdateBeneficiary(
        () => onSaved(),
        (error) => swalError("บันทึกข้อมูลผู้รับผลประโยชน์ไม่สำเร็จ", error)
    );

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
        validate: (values) => validate(values, { otherPayoutAmount, totalTransferAmount }),
        onSubmit: async (values) => {
            const updated = toBeneficiaryDto(values);
            try {
                await updateBeneficiary.mutateAsync(updated);
            } catch {
                // error แจ้งผ่าน onErrorCallback แล้ว — ไม่ปิด dialog ให้แก้แล้วกดบันทึกใหม่ได้
            }
        },
    });

    return {
        formik,
        bankOptions: bankData?.data ?? [],
        bankLoading,
        isSaving: updateBeneficiary.isLoading,
    };
};

export default useEditBeneficiaryHook;
