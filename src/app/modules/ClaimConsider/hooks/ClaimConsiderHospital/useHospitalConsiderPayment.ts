import { useGetBank } from "../../../../api/coreClaimMastersApi";
import { getEncryptText, useCreatePayment } from "../../../../api/claimFundApi";
import { UpsertClaimDecisionDtoResponse } from "../../../../api/coreClaimApi.client";
import { Step3PayoutAccount } from "../../components/ConsiderHospitalDetails/SubDetailsTab/ExpensesTabs/ClaimSummaryStep3";

type TransferCompensationInput = {
    /** ผลลัพธ์จาก POST /claim/decision/approve (ต้องมี casePayableId / caseNo / claimNo) */
    approveResult: UpsertClaimDecisionDtoResponse;
    /** บัญชีรับเงินค่าชดเชยของลูกค้า (จาก Step 3) */
    payoutAccount: Step3PayoutAccount;
    /** ยอดค่าชดเชยคงเหลือที่ต้องโอนให้ลูกค้า = calculateResult.compensateRemain */
    compensateRemain: number;
};

export type TransferCompensationResult = {
    isSuccess: boolean;
    message?: string;
    /** รหัสการโอนเงิน (CPG...) จาก response ของ CreatePayment */
    paymentCode?: string;
};

/** payeeTypeId : 2 = ลูกค้า (โอนค่าชดเชยคงเหลือให้ลูกค้าโดยตรง) */
const PAYEE_TYPE_CUSTOMER = 2;
/** paymentTypeId : 2 = CasePayment (โอนตามรายการเคลม) */
const PAYMENT_TYPE_CASE_PAYMENT = 2;

const toMessage = (err: unknown, fallback: string): string =>
    err instanceof Error ? err.message : typeof err === "string" && err ? err : fallback;

/** ดึง paymentCode ตัวแรกจาก response ของ POST /Transfer/v1/CreatePayment (res.data.data.paymentCodeResponse[]) */
const pickPaymentCode = (response: unknown): string | undefined => {
    const list = (response as { data?: { paymentCodeResponse?: Array<{ paymentCode?: string }> } } | undefined)?.data
        ?.paymentCodeResponse;
    return list?.find((item) => item?.paymentCode)?.paymentCode;
};

/**
 * โอน "ค่าชดเชยคงเหลือ" ให้ลูกค้าหลังอนุมัติเคลมโรงพยาบาล — เฉพาะกรณีโอนค่าชดเชยแยกจากค่ารักษา
 * (PH + IPD / Day Case, ไม่ติ๊ก "โอนค่าชดเชยรวมกับค่ารักษา", และมีค่าชดเชยคงเหลือ > 0)
 *
 * ยิง POST /Transfer/v1/CreatePayment (claimFund) แยกจาก /claim/decision/approve เหมือน flow
 * สร้างเคลม (useConfirmClaimPayment) — เลขบัญชี / เบอร์ / ชื่อบัญชี ต้องเข้ารหัสผ่าน
 * POST /Transfer/v1/EncryptText ก่อนเสมอ
 */
export const useHospitalConsiderPayment = () => {
    const { data: bankListData } = useGetBank();
    const { mutateAsync: createPaymentAsync } = useCreatePayment(
        () => {},
        () => {}
    );

    const transferCompensation = async ({
        approveResult,
        payoutAccount,
        compensateRemain,
    }: TransferCompensationInput): Promise<TransferCompensationResult> => {
        // ไม่มีค่าชดเชยคงเหลือ → ไม่ต้องโอน (ถือว่าสำเร็จ)
        if (compensateRemain <= 0) {
            return { isSuccess: true };
        }
        if (!payoutAccount.bankId || !payoutAccount.accountNo || !payoutAccount.accountName) {
            return {
                isSuccess: false,
                message: "ข้อมูลบัญชีรับเงินค่าชดเชยไม่ครบ (ธนาคาร / เลขที่บัญชี / ชื่อบัญชี)",
            };
        }
        if (!approveResult.casePayableId) {
            return { isSuccess: false, message: "ไม่พบเลขรายการตั้งจ่าย (casePayableId) จากผลอนุมัติ" };
        }

        try {
            const encryptResult = await getEncryptText(
                payoutAccount.accountNo,
                payoutAccount.phone?.replace(/-/g, "").trim() ?? "",
                payoutAccount.accountName
            );
            const receivingBankName =
                bankListData?.data?.find((bank) => bank.organizeId === payoutAccount.bankId)?.organizeName ??
                payoutAccount.bankName;

            const payload = [
                {
                    casePayableId: approveResult.casePayableId,
                    grossPaidAmount: 0,
                    withHoldingTaxAmount: 0,
                    netPaidAmount: compensateRemain,
                    payeeTypeId: PAYEE_TYPE_CUSTOMER,
                    paymentTypeId: PAYMENT_TYPE_CASE_PAYMENT,
                    receivingBankId: payoutAccount.bankId,
                    receivingBankAccountNo: encryptResult.accountNoResult,
                    receivingBankName,
                    receivingAccountName: encryptResult.bankAccountNameResult,
                    phoneNumber: encryptResult.phoneNumberResult,
                    claimCase: approveResult.caseNo,
                    claimNo: approveResult.claimNo,
                },
            ];

            const paymentResponse = await createPaymentAsync(payload);
            return { isSuccess: true, paymentCode: pickPaymentCode(paymentResponse) };
        } catch (err) {
            return { isSuccess: false, message: toMessage(err, "โอนค่าชดเชยไม่สำเร็จ") };
        }
    };

    return { transferCompensation };
};

export default useHospitalConsiderPayment;
