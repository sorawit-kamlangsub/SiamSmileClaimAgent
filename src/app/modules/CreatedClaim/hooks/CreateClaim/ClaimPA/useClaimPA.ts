import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch } from "../../../../../../redux";
import {
    useGetContactPerson,
    useGetCustomerBankAccount,
    useGetCustomerDetailById,
} from "../../../../../api/coreClaimApi";
import { SchoolInfo, setBankAccounts, setContacts, setInsured, setSchool } from "../../../store/claimPASlice";

export const useClaimPA = () => {
    const dispatch = useAppDispatch();

    const { appId, refId } = useParams();

    const customerId = refId ? parseInt(atob(refId)) : undefined;
    const applicationId = appId ? atob(appId) : undefined;

    const claimInfoQuery = useGetCustomerDetailById(customerId as number);
    const bankAccountQuery = useGetCustomerBankAccount(applicationId);
    const contactQuery = useGetContactPerson(applicationId ?? "", 26);

    const isLoading = claimInfoQuery.isLoading || bankAccountQuery.isLoading || contactQuery.isLoading;

    useEffect(() => {
        if (!claimInfoQuery.data?.data) return;
        const schoolInfo: SchoolInfo = {
            appId: claimInfoQuery.data.data.policyCode ?? "",
            schoolName: claimInfoQuery.data.data.schoolName ?? "",
            teacherName: claimInfoQuery.data.data.contactName ?? "",
            teacherPhone: claimInfoQuery.data.data.contactPhoneNo ?? "",
        };
        dispatch(setSchool(schoolInfo));
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
