import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch } from "../../../../../../redux";
import {
    useGetContactPerson,
    useGetCustomerBankAccount,
    useGetCustomerDetailById,
} from "../../../../../api/coreClaimApi";
import { setBankAccounts, setContacts, setInsured } from "../../../store/claimPHSlice";

export const useClaimPH = () => {
    const dispatch = useAppDispatch();

    const { appId, refId } = useParams();

    const customerId = refId ? parseInt(atob(refId)) : undefined;
    const applicationId = appId ? atob(appId) : undefined;

    const claimInfoQuery = useGetCustomerDetailById(customerId as number);
    const bankAccountQuery = useGetCustomerBankAccount(applicationId);
    const contactQuery = useGetContactPerson(applicationId ?? "", 6);

    const isLoading = claimInfoQuery.isLoading || bankAccountQuery.isLoading || contactQuery.isLoading;

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

    return {
        appId,
        refId,
        applicationId,
        customerId,
        claimInfo: claimInfoQuery.data?.data,
        isLoading,
    };
};
