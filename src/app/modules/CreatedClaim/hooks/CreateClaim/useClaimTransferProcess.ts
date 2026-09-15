import { useState } from "react";
import { BeneficiaryForm } from "../../store/claimPHSlice";
import { CreateCoreClaimDtoResponseServiceResponse } from "../../../../api/coreClaimApi.client";

export type ClaimTransferStepStatus = "pending" | "running" | "success" | "error";

export type ClaimTransferStep = {
    key: string;
    label: string;
    detail?: string;
    status: ClaimTransferStepStatus;
};

/** ผลลัพธ์ยืนยันการโอนเงิน — claimResponse เดิม + paymentResponses (มีเมื่อโอนเงินสำเร็จ) */
export type ClaimTransferPaymentResult = CreateCoreClaimDtoResponseServiceResponse & {
    paymentResponses?: any;
};

type CreateClaimFn = (
    beneficiaries?: BeneficiaryForm[]
) => Promise<{ claimResponse: CreateCoreClaimDtoResponseServiceResponse; beneficiaryList: BeneficiaryForm[] }>;

type ConfirmPaymentFn = (
    claimResponse: CreateCoreClaimDtoResponseServiceResponse,
    beneficiaryList: BeneficiaryForm[]
) => Promise<ClaimTransferPaymentResult>;

type UseClaimTransferProcessOptions = {
    /** เคลมต่อเนื่อง : ไม่มีขั้น "สร้างเลขที่เคลม (CL)" แยก (ใช้เลขเคลมเดิม) */
    isContinuous: boolean;
    createClaim: CreateClaimFn;
    confirmPayment: ConfirmPaymentFn;
    /** ตรวจว่าผลสร้างเคลมสำเร็จหรือไม่ — default เช็ค isSuccess หรือ data.isResult */
    isClaimSuccess?: (claimResponse: CreateCoreClaimDtoResponseServiceResponse) => boolean;
};

export type ClaimTransferRunResult = { ok: true; result: ClaimTransferPaymentResult } | { ok: false; message: string };

const defaultIsClaimSuccess = (claimResponse: CreateCoreClaimDtoResponseServiceResponse) =>
    !!(claimResponse?.isSuccess ?? claimResponse?.data?.isResult);

const buildInitialSteps = (isContinuous: boolean): ClaimTransferStep[] =>
    isContinuous
        ? [
              { key: "case", label: "เพิ่มเคสต่อเนื่อง (CC)", status: "pending" },
              { key: "transfer", label: "โอนเงิน", status: "pending" },
          ]
        : [
              { key: "claim", label: "สร้างเลขที่เคลม (CL)", status: "pending" },
              { key: "case", label: "สร้างเลขที่ Case (CC)", status: "pending" },
              { key: "transfer", label: "โอนเงิน", status: "pending" },
          ];

/**
 * คุม flow "สร้างเคลม (CL/CC) → โอนเงิน" หลังกด "โอนเงิน" ใน ConfirmTransfer(PH|PA)Modal
 * แสดง progress ทีละขั้นตาม CR : สร้างเลขที่เคลม (CL) → สร้างเลขที่ Case (CC) → โอนเงิน
 * (API จริงสร้าง CL+CC ในคำขอเดียว จึงขึ้นสำเร็จขั้น 1-2 พร้อมกันหลัง createClaim คืนค่า)
 */
export const useClaimTransferProcess = ({
    isContinuous,
    createClaim,
    confirmPayment,
    isClaimSuccess = defaultIsClaimSuccess,
}: UseClaimTransferProcessOptions) => {
    const [open, setOpen] = useState(false);
    const [steps, setSteps] = useState<ClaimTransferStep[]>(() => buildInitialSteps(isContinuous));

    const setStepStatus = (index: number, status: ClaimTransferStepStatus, detail?: string) => {
        setSteps((prev) =>
            prev.map((step, i) => (i === index ? { ...step, status, detail: detail ?? step.detail } : step))
        );
    };

    const claimStepIndex = isContinuous ? -1 : 0;
    const caseStepIndex = isContinuous ? 0 : 1;
    const transferStepIndex = isContinuous ? 1 : 2;

    const run = async (beneficiaries?: BeneficiaryForm[]): Promise<ClaimTransferRunResult> => {
        setSteps(buildInitialSteps(isContinuous));
        setOpen(true);

        if (claimStepIndex >= 0) setStepStatus(claimStepIndex, "running");
        setStepStatus(caseStepIndex, "running");

        let claimResponse: CreateCoreClaimDtoResponseServiceResponse;
        let beneficiaryList: BeneficiaryForm[];
        try {
            const created = await createClaim(beneficiaries);
            claimResponse = created.claimResponse;
            beneficiaryList = created.beneficiaryList;
        } catch (error: any) {
            if (claimStepIndex >= 0) setStepStatus(claimStepIndex, "error");
            setStepStatus(caseStepIndex, "error");
            setOpen(false);
            return { ok: false, message: error?.message || "สร้างเคลมไม่สำเร็จ" };
        }

        const responseList = claimResponse?.data?.responseList ?? [];

        if (!isClaimSuccess(claimResponse) || responseList.length === 0) {
            if (claimStepIndex >= 0) setStepStatus(claimStepIndex, "error");
            setStepStatus(caseStepIndex, "error");
            setOpen(false);
            return { ok: false, message: claimResponse?.data?.msg || claimResponse?.message || "สร้างเคลมไม่สำเร็จ" };
        }

        if (claimStepIndex >= 0) {
            setStepStatus(claimStepIndex, "success", responseList.map((item) => item.claimNo).join(", "));
        }
        setStepStatus(caseStepIndex, "success", responseList.map((item) => item.caseNo).join(", "));

        setStepStatus(transferStepIndex, "running");
        try {
            const result = await confirmPayment(claimResponse, beneficiaryList);
            setStepStatus(transferStepIndex, "success");
            setOpen(false);
            return { ok: true, result };
        } catch (error: any) {
            setStepStatus(transferStepIndex, "error");
            setOpen(false);
            return { ok: false, message: error?.message || "สร้างเคลมสำเร็จ แต่โอนเงินไม่สำเร็จ" };
        }
    };

    return { open, steps, run };
};
