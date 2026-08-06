import { useAppSelector } from "../../../../../../redux";
import { useCreateCoreClaim } from "../../../../../api/coreClaimApi";
import { claimPASelector } from "../../../store/claimPASlice";
import { BeneficiaryForm } from "../../../store/claimPHSlice";

export const useCreateClaimPA = (onSuccess?: () => void, onError?: (message: string) => void) => {
    const { bankAccounts, contacts, tmpCoreClaim } = useAppSelector(claimPASelector);
    const selectedContact = contacts.find((c) => c.isDefault) ?? contacts[0];
    const selectedAccount = bankAccounts.find((a) => a.isDefault) ?? bankAccounts[0];
    const mutation = useCreateCoreClaim(
        () => onSuccess?.(),
        (message) => onError?.(message)
    );

    const buildPayload = (beneficiaryList: BeneficiaryForm[]) => ({
        ...tmpCoreClaim,
        createClaim: (tmpCoreClaim.createClaim ?? []).map((claim) => ({
            ...claim,
            createCase: (claim.createCase ?? []).map((c) => ({
                ...c,
                createCaseContact: [
                    {
                        tempCaseId: c.tempCaseId,
                        contactPersonTypeId: selectedContact?.contactPersonTypeId,
                        contactPersonName: selectedContact?.contactName,
                        contactPhoneNo: selectedContact?.contactPhoneNo,
                    },
                ],
                createBeneficiary:
                    beneficiaryList.length > 0
                        ? beneficiaryList.map((b) => ({
                              tempClaimId: claim.tempClaimId,
                              tempCaseId: c.tempCaseId,
                              policyBeneficiaryId: undefined,
                              titleId: b.titleId?.toString(),
                              firstName: b.firstName,
                              lastName: b.lastName,
                              idCard: b.citizenId,
                              phoneNo: b.phoneNumber,
                              relationId: b.relationTypeId,
                              bankAccountRelationTypeId: undefined,
                              bankId: b.bankId,
                              bankAccountNo: b.bankAccountNo,
                              bankAccountName: b.bankAccountName,
                              payoutAmount: b.amount,
                          }))
                        : selectedAccount
                        ? [
                              {
                                  tempClaimId: claim.tempClaimId,
                                  tempCaseId: c.tempCaseId,
                                  policyBeneficiaryId: undefined,
                                  phoneNo: selectedContact?.contactPhoneNo,
                                  bankAccountRelationTypeId: selectedAccount.bankAccountRelationTypeId,
                                  bankId: selectedAccount.bankId,
                                  bankAccountNo: selectedAccount.bankAccountNo,
                                  bankAccountName: selectedAccount.bankAccountName,
                                  payoutAmount: c.caseAmount,
                              },
                          ]
                        : [],
            })),
        })),
    });

    const createClaimPA = async (overrideBeneficiaries?: BeneficiaryForm[]) => {
        const payload = buildPayload(overrideBeneficiaries ?? []);
        return await mutation.mutateAsync(payload as any);
    };

    return {
        createClaimPA,
        isLoading: mutation.isLoading,
    };
};
