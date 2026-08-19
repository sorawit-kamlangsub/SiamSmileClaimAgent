import { FormikErrors, useFormik } from "formik";
import { useAppDispatch, useAppSelector } from "../../../../../../redux";
import { validateBankAccountNo, validatePhoneNumber, validateThaiCitizenID } from "../../../../_common";
import { claimPASelector, setBeneficiaries } from "../../../store/claimPASlice";
import { BeneficiaryForm } from "../../../store/claimPHSlice";
import { useGetBeneficiary } from "../../../../../api/coreClaimMastersApi";
import { BeneficiaryFormikValues } from "../../../components/CreateClaim/ClaimPH/BeneficiarySectionPH";
import { defaultBeneficiary } from "../ClaimPH/useBeneficiaryPH";
import { useEffect } from "react";
import React from "react";

export const useBeneficiaryPA = (onValidSubmit: (beneficiaries: BeneficiaryForm[]) => void) => {
    const dispatch = useAppDispatch();
    const beneficiaries = useAppSelector((state) => state.claimph.beneficiaries);
    const { form, insured } = useAppSelector(claimPASelector);
    const beneficiaryQuery = useGetBeneficiary(insured?.policyCode);
    const claimAmount = Number(form.transferAmount ?? 0);
    const insuredCitizenIds = useAppSelector((state) =>
        new Set(
            (state.claimpa.claimItems ?? [])
                .map((item) => item.idCard?.replace(/[^\d]/g, "").trim())
                .filter((id): id is string => !!id)
        )
    );
    const formik = useFormik<BeneficiaryFormikValues>({
        initialValues: {
            beneficiaries,
        },
        enableReinitialize: false,

        validate: (values) => {
            const errors: FormikErrors<BeneficiaryFormikValues> = {};
            const req = "โปรดระบุ";

            const beneficiaryErrors = values.beneficiaries.map((item) => {
                const itemErrors: Partial<Record<keyof BeneficiaryForm, string>> = {};

                if (!item.relationTypeId) itemErrors.relationTypeId = req;
                const citizenId = item.citizenId?.trim() ?? "";
                if (!citizenId) itemErrors.citizenId = req;
                else if (!validateThaiCitizenID(citizenId))
                    itemErrors.citizenId = "กรอกได้เฉพาะตัวเลข 13 หลัก";
                else if (insuredCitizenIds.has(citizenId))
                    itemErrors.citizenId = "เลขบัตรประชาชนต้องไม่ซ้ำกับผู้เอาประกัน";
                if (!item.titleId) itemErrors.titleId = req;
                if (!item.firstName?.trim()) itemErrors.firstName = req;
                if (!item.lastName?.trim()) itemErrors.lastName = req;
                const phoneNumber = item.phoneNumber?.trim() ?? "";
                if (!phoneNumber) itemErrors.phoneNumber = req;
                else if (!validatePhoneNumber(phoneNumber)) itemErrors.phoneNumber = "กรอกได้เฉพาะตัวเลข 10 หลัก";
                if (!item.bankId) itemErrors.bankId = req;
                const bankAccountNo = item.bankAccountNo?.trim() ?? "";
                if (!bankAccountNo) itemErrors.bankAccountNo = req;
                else if (!validateBankAccountNo(bankAccountNo))
                    itemErrors.bankAccountNo = "กรอกได้เฉพาะตัวเลขตั้งแต่ 10-15 หลัก";
                if (!item.bankAccountName?.trim()) itemErrors.bankAccountName = req;
                if (!item.amount) itemErrors.amount = req;
                return itemErrors;
            });
            const totalBeneficiaryAmount = values.beneficiaries.reduce(
                (sum, item) => sum + Number(item.amount ?? 0),
                0
            );

            if (totalBeneficiaryAmount > claimAmount) {
                const lastIndex = values.beneficiaries.length - 1;

                if (lastIndex >= 0) {
                    beneficiaryErrors[lastIndex] = {
                        ...beneficiaryErrors[lastIndex],
                        amount: `ยอดรวมต้องไม่เกิน ${claimAmount.toLocaleString("th-TH", {
                            minimumFractionDigits: 2,
                        })} บาท`,
                    };
                }
            }
            if (totalBeneficiaryAmount !== claimAmount) {
                const lastIndex = values.beneficiaries.length - 1;

                if (lastIndex >= 0) {
                    beneficiaryErrors[lastIndex] = {
                        ...beneficiaryErrors[lastIndex],
                        amount: `ยอดรวมผู้รับผลประโยชน์ต้องเท่ากับ ${claimAmount.toLocaleString("th-TH", {
                            minimumFractionDigits: 2,
                        })} บาท`,
                    };
                }
            }
            if (beneficiaryErrors.some((item) => Object.keys(item).length > 0)) {
                errors.beneficiaries = beneficiaryErrors;
            }

            return errors;
        },

        onSubmit: (values) => {
            dispatch(setBeneficiaries(values.beneficiaries));
            onValidSubmit(values.beneficiaries);
        },
    });
    const hasSyncedRef = React.useRef(false);
    useEffect(() => {
        if (!beneficiaryQuery.isSuccess || hasSyncedRef.current) return;
        hasSyncedRef.current = true;
        const beneficiaryData = beneficiaryQuery.data?.data ?? [];

        const nextBeneficiaries: BeneficiaryForm[] =
            beneficiaryData.length > 0
                ? beneficiaryData.map((item) => ({
                      ...item,
                      citizenId: undefined,
                      bankId: undefined,
                      bankName: undefined,
                      bankAccountNo: undefined,
                      bankAccountName: undefined,
                      amount: undefined,
                      phoneNumber: item.phoneNumber ?? undefined,
                      source: "system" as const,
                  }))
                : [defaultBeneficiary()];

        dispatch(setBeneficiaries(nextBeneficiaries));
        formik.setFieldValue("beneficiaries", nextBeneficiaries, false);
    }, [beneficiaryQuery.isSuccess, beneficiaryQuery.data]);

    return {
        formik,
        isLoading: beneficiaryQuery.isLoading,
        isError: beneficiaryQuery.isError,
    };
};