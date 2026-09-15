import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../../../redux";
import {
    useGetContactPerson,
    useGetCustomerBankAccount,
    useGetCustomerDetailById,
} from "../../../../../api/coreClaimApi";
import {
    SchoolInfo,
    claimPASelector,
    setBankAccounts,
    setContacts,
    setInsured,
    setPendingInsured,
    setSchool,
} from "../../../store/claimPASlice";

export const useClaimPA = () => {
    const dispatch = useAppDispatch();
    const { appId, refId, oldClaimId, isContinuous } = useParams();
    const { pendingInsured } = useAppSelector(claimPASelector);

    const customerId = refId ? parseInt(atob(refId)) : undefined;
    const applicationId = appId ? atob(appId) : undefined;

    const activeCustomerId = pendingInsured?.customerId ?? customerId;
    const activeApplicationId = pendingInsured?.policyCode ?? applicationId;

    const claimInfoQuery = useGetCustomerDetailById(activeCustomerId as number);
    const bankAccountQuery = useGetCustomerBankAccount(applicationId); // บัญชี/เบอร์ผูกกับเคสหลัก ไม่เปลี่ยนตามคนที่เพิ่ม
    const contactQuery = useGetContactPerson(applicationId ?? "", 26);

    const isLoading = claimInfoQuery.isLoading || bankAccountQuery.isLoading || contactQuery.isLoading;

    useEffect(() => {
        if (!claimInfoQuery.data?.data) return;

        if (pendingInsured) {
            dispatch(setPendingInsured({ ...claimInfoQuery.data.data, tempClaimId: pendingInsured.tempClaimId }));
        } else {
            const schoolInfo: SchoolInfo = {
                appId: claimInfoQuery.data.data.policyCode ?? "",
                schoolName: claimInfoQuery.data.data.schoolName ?? "",
                teacherName: claimInfoQuery.data.data.contactName ?? "",
                teacherPhone: claimInfoQuery.data.data.contactPhoneNo ?? "",
            };
            dispatch(setSchool(schoolInfo));
            dispatch(setInsured(claimInfoQuery.data.data));
        }
    }, [dispatch, claimInfoQuery.data, pendingInsured?.customerId]);

    useEffect(() => {
        if (!bankAccountQuery.data?.data) return;
        dispatch(setBankAccounts(bankAccountQuery.data.data));
    }, [bankAccountQuery.data]);

    useEffect(() => {
        if (!contactQuery.data?.data) return;
        dispatch(setContacts(contactQuery.data.data));
    }, [contactQuery.data]);

    return {
        appId,
        refId,
        oldClaimId,
        isContinuous,
        applicationId: activeApplicationId,
        customerId: activeCustomerId,
        claimInfo: claimInfoQuery.data?.data,
        isLoading,
    };
};