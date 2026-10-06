import { useAppSelector } from "../../../../../../redux";
import { createContinuedClaim } from "../../../../../api/coreClaimApi"; // ปรับ path ตามจริง
import { CreateContinuedClaimDtoRequest } from "../../../../../api/coreClaimApi.client";
import { claimPASelector, LocalCoreClaim } from "../../../store/claimPASlice";
import { BeneficiaryForm } from "../../../store/claimPHSlice";
import { mapCaseEntryToV2, mapBeneficiariesToRequest, mapBankAccountToBeneficiary } from "./useCreateClaimPA";
import { useConfirmClaimPayment } from "./useConfirmClaimPayment";
import { useParams } from "react-router-dom";
import { safeAtob } from "../../../../../functionHelpers";
import { useAuth } from "../../../../_auth";
import { useClaimRequestId } from "../useClaimRequestId";

export const mapLocalCoreClaimToContinuedRequest = (
    local: LocalCoreClaim,
    claimId: string,
    requestId: string
): CreateContinuedClaimDtoRequest => {
    const claimEntry = (local.createClaim ?? [])[0];

    return {
        requestId,
        claimId,
        cases: (claimEntry?.createCase ?? []).map(mapCaseEntryToV2),
        createdByUserCode: local.createdByUserCode,
        createdByUserName: local.createdByUserName,
    };
};

export const useCreateContinuedClaimPA = (onSuccess?: () => void, onError?: (message: string) => void) => {
    const { oldClaimId: oldClaimIdParam } = useParams();
    const oldClaimId = safeAtob(oldClaimIdParam) ?? "";
    const { userProfile } = useAuth();
    const getRequestId = useClaimRequestId();
    const { bankAccounts, contacts, tmpCoreClaim } = useAppSelector(claimPASelector);
    const selectedContact = contacts.find((c) => c.isDefault) ?? contacts[0];
    const selectedAccount = bankAccounts.find((a) => a.isDefault) ?? bankAccounts[0];

    const mutation = createContinuedClaim(
        () => onSuccess?.(),
        (message) => onError?.(message)
    );

    const { confirmPayment: confirmPaymentShared } = useConfirmClaimPayment(onError);

    const buildLocalCoreClaim = (beneficiaryList: BeneficiaryForm[]): LocalCoreClaim => ({
        ...tmpCoreClaim,
        createClaim: (tmpCoreClaim.createClaim ?? []).map((claim) => ({
            ...claim,
            createCase: (claim.createCase ?? []).map((c) => ({
                ...c,
                // สาขาของผู้ใช้ที่ login — ใช้บันทึกว่าเคสถูกสร้างโดยสาขาไหน
                createdCaseByBranchId: userProfile?.employeeBranchId,
                createBeneficiary:
                    beneficiaryList.length > 0
                        ? mapBeneficiariesToRequest(beneficiaryList, claim.tempClaimId, c.tempCaseId)
                        : mapBankAccountToBeneficiary(
                              selectedAccount,
                              selectedContact,
                              c.caseAmount ?? 0,
                              claim.tempClaimId,
                              c.tempCaseId
                          ),
            })),
        })),
    });

    const buildPayload = (beneficiaryList: BeneficiaryForm[]): CreateContinuedClaimDtoRequest =>
        mapLocalCoreClaimToContinuedRequest(buildLocalCoreClaim(beneficiaryList), oldClaimId, getRequestId());

    const createClaimPA = async (overrideBeneficiaries?: BeneficiaryForm[]) => {
        const beneficiaryList = overrideBeneficiaries ?? [];
        const payload = buildPayload(beneficiaryList);
        const claimResponse = await mutation.mutateAsync(payload as any);
        if (!claimResponse?.isSuccess) {
            onError?.(claimResponse?.message || claimResponse?.exceptionMessage || "สร้างเคลมไม่สำเร็จ");
        }
        return { claimResponse, beneficiaryList };
    };

    const confirmPayment = async (claimResponse: any, beneficiaryList: BeneficiaryForm[]) => {
        const responseList = claimResponse?.data?.responseList ?? [];
        const paymentResponses = await confirmPaymentShared(responseList, beneficiaryList, onSuccess);
        return { ...claimResponse, paymentResponses };
    };

    return { createClaimPA, confirmPayment, isLoading: mutation.isLoading };
};
