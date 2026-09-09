import { useAppSelector } from "../../../../../../redux";
import { claimPASelector, LocalClaimEntry } from "../../../store/claimPASlice";
import { BeneficiaryForm } from "../../../store/claimPHSlice";
import { getEncryptText, useCreatePayment } from "../../../../../api/claimFundApi";
import { mapBeneficiariesToRequest, mapBankAccountToBeneficiary } from "./useCreateClaimPA";

export interface ClaimResponseItem {
    casePayableId?: string[];
    caseNo?: string;
    claimNo?: string;
}

export const useConfirmClaimPayment = (onError?: (message: string) => void) => {
    const { bankAccounts, contacts, tmpCoreClaim } = useAppSelector(claimPASelector);
    const selectedContact = contacts.find((c) => c.isDefault) ?? contacts[0];
    const selectedAccount = bankAccounts.find((a) => a.isDefault) ?? bankAccounts[0];

    const { mutateAsync: createPaymentAsync } = useCreatePayment(
        () => {},
        (message) => onError?.(message)
    );

    const buildPaymentPayload = async (
        responseList: ClaimResponseItem[],
        beneficiaryList: BeneficiaryForm[]
    ): Promise<any[]> => {
        const allBeneficiaries = (tmpCoreClaim.createClaim ?? []).flatMap((claim: LocalClaimEntry) => {
            const c = claim.createCase?.[0];

            return beneficiaryList.length > 0
                ? mapBeneficiariesToRequest(beneficiaryList, claim.tempClaimId, c?.tempCaseId).map((beneficiary) => ({
                      beneficiary,
                      payeeTypeId: 4, // Beneficiary
                      paymentTypeId: 2, // CasePayment
                  }))
                : mapBankAccountToBeneficiary(
                      selectedAccount,
                      selectedContact,
                      c?.caseAmount ?? 0,
                      claim.tempClaimId,
                      c?.tempCaseId
                  ).map((beneficiary) => ({
                      beneficiary,
                      payeeTypeId: 2, // Customer
                      paymentTypeId: 2, // CasePayment
                  }));
        });

        return Promise.all(
            allBeneficiaries.map(async ({ beneficiary, payeeTypeId }, index) => {
                const item = responseList[index];
                const encryptResult = await getEncryptText(
                    beneficiary.bankAccountNo ?? "",
                    beneficiary.phoneNo?.replace(/-/g, "").trim() ?? "",
                    beneficiary.bankAccountName ?? ""
                );
                const matchedBank = bankAccounts.find((b) => b.bankId === beneficiary.bankId);

                return {
                    casePayableId: item?.casePayableId?.[0] ?? undefined,
                    grossPaidAmount: 0,
                    withHoldingTaxAmount: 0,
                    netPaidAmount: beneficiary.payoutAmount ?? 0,
                    payeeTypeId,
                    receivingBankId: beneficiary.bankId,
                    receivingBankAccountNo: encryptResult.accountNoResult,
                    receivingBankName: matchedBank?.bankName,
                    receivingAccountName: encryptResult.bankAccountNameResult,
                    phoneNumber: encryptResult.phoneNumberResult,
                    claimCase: item?.caseNo,
                    claimNo: item?.claimNo,
                };
            })
        );
    };

    const confirmPayment = async (
        responseList: ClaimResponseItem[],
        beneficiaryList: BeneficiaryForm[],
        onPaymentSuccess?: () => void
    ) => {
        try {
            const paymentPayloadList = await buildPaymentPayload(responseList, beneficiaryList);
            const paymentResponses = paymentPayloadList.length > 0 ? await createPaymentAsync(paymentPayloadList) : [];
            onPaymentSuccess?.();
            return paymentResponses;
        } catch (err: any) {
            onError?.(err?.message || "สร้างเคลมสำเร็จ แต่โอนเงินไม่สำเร็จ");
            return [];
        }
    };

    return { confirmPayment };
};
