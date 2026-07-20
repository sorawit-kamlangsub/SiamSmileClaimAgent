import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch } from "../../../../../../redux";
import {
    useGetContactPerson,
    useGetCustomerBankAccount,
    useGetCustomerDetailById,
} from "../../../../../api/coreClaimApi";
import { useGetBeneficiary } from "../../../../../api/coreClaimMastersApi";
import { setBankAccounts, setBeneficiaries, setContacts, setInsured } from "../../../store/claimPASlice";
import { BeneficiaryForm } from "../../../store/claimPHSlice";

export const useClaimPA = () => {
    const dispatch = useAppDispatch();

    const { appId, refId } = useParams();

    const customerId = refId ? parseInt(atob(refId)) : undefined;
    const applicationId = appId ? atob(appId) : undefined;

    const claimInfoQuery = useGetCustomerDetailById(customerId as number);
    const bankAccountQuery = useGetCustomerBankAccount(applicationId);
    const contactQuery = useGetContactPerson(applicationId ?? "", 26);
    const beneficiaryQuery = useGetBeneficiary(applicationId);

    const isLoading =
        claimInfoQuery.isLoading || bankAccountQuery.isLoading || contactQuery.isLoading || beneficiaryQuery.isLoading;
    const defaultBeneficiary = (): BeneficiaryForm => ({
        beneficiaryOrder: 1,
        relationTypeId: undefined,
        titleId: undefined,
        firstName: "",
        lastName: "",
        citizenId: "",
        phoneNumber: "",
        bankId: undefined,
        bankAccountNo: "",
        bankAccountName: "",
        amount: 0,
        percentShare: 0,
        source: "manual",
    });
    useEffect(() => {
        if (!claimInfoQuery.data?.data) return;

        dispatch(setInsured(claimInfoQuery.data.data));
    }, [dispatch, claimInfoQuery.data]);

    useEffect(() => {
        if (!bankAccountQuery.data?.data) return;
        dispatch(setBankAccounts(bankAccountQuery.data.data));
    }, [dispatch, bankAccountQuery.data]);

    useEffect(() => {
        if (!contactQuery.data?.data) return;
        dispatch(setContacts(contactQuery.data.data));
    }, [dispatch, contactQuery.data]);

    useEffect(() => {
        const beneficiary = beneficiaryQuery.data?.data ?? [];
        dispatch(
            setBeneficiaries(
                beneficiary.length > 0
                    ? beneficiary.map((item) => ({
                          ...item,
                          source: "system" as const,
                      }))
                    : [defaultBeneficiary()]
            )
        );
    }, [dispatch, beneficiaryQuery.data]);

    return {
        appId,
        refId,
        applicationId,
        customerId,
        claimInfo: claimInfoQuery.data?.data,
        isLoading,
    };
};
