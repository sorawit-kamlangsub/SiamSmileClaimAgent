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
import { safeAtob } from "../../../../../functionHelpers";

export const useClaimPA = () => {
    const dispatch = useAppDispatch();
    const { appId, refId, oldClaimId, isContinuous } = useParams();
    const { pendingInsured } = useAppSelector(claimPASelector);

    const customerId = safeAtob(refId);
    const applicationId = safeAtob(appId);

    const activeCustomerId = pendingInsured?.customerId ?? customerId;
    const activeApplicationId = pendingInsured?.policyCode ?? applicationId;

    const claimInfoQuery = useGetCustomerDetailById(activeCustomerId);
    const bankAccountQuery = useGetCustomerBankAccount(applicationId); // บัญชี/เบอร์ผูกกับเคสหลัก ไม่เปลี่ยนตามคนที่เพิ่ม
    const contactQuery = useGetContactPerson(applicationId ?? "", 26);

    // isInitialLoading: id ใน URL ถอดไม่ได้ → query ไม่ถูก enabled — ไม่ให้ loading ค้าง (หน้าแสดง "ไม่พบข้อมูล" แทน)
    const isLoading =
        claimInfoQuery.isInitialLoading || bankAccountQuery.isInitialLoading || contactQuery.isInitialLoading;

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
