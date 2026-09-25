import { useGetDeathAndDisabilityBeneficiary } from "../../../../api/coreClaimApi";
import {
    GetDeathAndDisabilityBeneficiaryDtoResponse,
    GetDeathAndDisabilityClaimDetailConsiderDtoResponse,
} from "../../../../api/coreClaimApi.client";
import { TransferAccountChange } from "./ChangeTransferAccountHook";

/** beneficiaryTypeId — 2 = ผู้รับผลประโยชน์, 3 = ผู้รับเงินตามบัญชีที่เปลี่ยน (เงินสดมอบหน้างาน) */
export const BENEFICIARY_TYPE_ID = { BENEFICIARY: 2, TRANSFER_ACCOUNT: 3 } as const;

const toTransferAccountChange = (item: GetDeathAndDisabilityBeneficiaryDtoResponse): TransferAccountChange => {
    const payeeName = [item.titleName, item.firstName, item.lastName].filter(Boolean).join(" ");
    return {
        beneficiaryId: item.beneficiaryId,
        reason: item.changeReasonRemark ?? "-",
        payeeName: payeeName || "-",
        payeeTitleId: Number(item.titleId) || undefined,
        payeeFirstName: item.firstName ?? "",
        payeeLastName: item.lastName ?? "",
        bankId: item.bankId,
        bankName: item.bankName ?? "",
        accountNo: item.bankAccountNo ?? "",
        accountName: item.bankAccountName ?? "",
        attachedDocuments: [],
    };
};

/**
 * รายการผู้รับผลประโยชน์ของเคลม Death & Disability (GetDeathAndDisabilityBeneficiary)
 *
 * - beneficiaryTypeId = 2 → section ผู้รับผลประโยชน์
 * - beneficiaryTypeId = 3 → section รายละเอียดการเปลี่ยนบัญชีปลายทางการโอนเงิน (ที่บันทึกไว้แล้ว)
 *
 * การแก้ไขจาก dialog "แก้ไขข้อมูล" บันทึกผ่าน UpdateBeneficiary ทันที แล้วรายการนี้โหลดใหม่เอง
 */
const useDeathDisabilityBeneficiaryHook = (detail: GetDeathAndDisabilityClaimDetailConsiderDtoResponse | undefined) => {
    const { data, isLoading } = useGetDeathAndDisabilityBeneficiary(detail?.claimId ?? "", detail?.caseId ?? "");
    const allBeneficiaries: GetDeathAndDisabilityBeneficiaryDtoResponse[] = data?.data ?? [];
    const beneficiaries = allBeneficiaries.filter((item) => item.beneficiaryTypeId === BENEFICIARY_TYPE_ID.BENEFICIARY);
    const savedTransferAccount = allBeneficiaries.find(
        (item) => item.beneficiaryTypeId === BENEFICIARY_TYPE_ID.TRANSFER_ACCOUNT
    );
    const savedTransferAccountChange = savedTransferAccount ? toTransferAccountChange(savedTransferAccount) : undefined;
    const totalPayoutAmount = beneficiaries.reduce((sum, item) => sum + (item.payoutAmount ?? 0), 0);

    return {
        beneficiaries,
        beneficiaryLoading: isLoading,
        totalPayoutAmount,
        savedTransferAccountChange,
    };
};

export default useDeathDisabilityBeneficiaryHook;
