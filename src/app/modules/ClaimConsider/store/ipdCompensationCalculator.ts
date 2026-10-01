import { CoverageType, MedicalType } from "../../../functionHelpers";
import { ClaimAmountReconciliationResult } from "../../ClaimSimulate/store/Claimsimulateutils";
import { ClaimExpenseItem } from "./claimConsiderSlice";

/**
 * อัตราค่าชดเชยผู้ป่วยในต่อวัน (บาท)
 * TODO: ยังไม่ยืนยันอัตรา — เปลี่ยนเป็นค่าจาก Benefit (compensationDailyRate) เมื่อ API พร้อม
 */
export const IPD_COMPENSATION_DAILY_RATE = 800;

/** รหัส Master ของรายการค่ารักษาที่รวมค่าชดเชย IPD ไว้ในสิทธิ์เบิกแล้ว — ต้อง exact match เท่านั้น */
export const IPD_HALF_5_CODE = "IPD_Half_5";

/** ใช้เฉพาะพิจารณาเคลมลูกค้า : ประเภทความคุ้มครอง = ค่ารักษา + ประเภทการรักษา = IPD / Day Case Surgery */
export const isIpdCompensationFlow = (coverageTypeId?: number, medicalTypeId?: number) =>
    coverageTypeId === CoverageType.Medical &&
    (medicalTypeId === MedicalType.IPD || medicalTypeId === MedicalType.DayCaseSurgery);

const toSatang = (v: number) => Math.round(v * 100);
const fromSatang = (v: number) => v / 100;
const toNumber = (v: number | undefined | null) => (typeof v === "number" && Number.isFinite(v) ? v : 0);

/** สิทธิ์เบิกของแถว = ยอดตามใบเสร็จ − ส่วนลด − ยอดไม่คุ้มครอง (ไม่ต่ำกว่า 0) */
export const getItemEligibleAmount = (item: Pick<ClaimExpenseItem, "receiptAmount" | "discount" | "notCovered">) =>
    Math.max(toNumber(item.receiptAmount) - toNumber(item.discount) - toNumber(item.notCovered), 0);

export interface IpdCompensationInput {
    items: ClaimExpenseItem[];
    /** จำนวนวันนอนรวมจาก Step 1 (ipdDays + icuDays) */
    totalStayDays: number | undefined;
    dailyRate: number | undefined;
    /** วงเงินตามสิทธิ์ — ยังไม่มีข้อมูลจาก API */
    benefitLimit?: number;
    /** วงเงินคงเหลือตามสิทธิ์ — ยังไม่มีข้อมูลจาก API (undefined = ไม่จำกัดด้วยวงเงิน) */
    remainingBenefit?: number;
}

export interface IpdCompensationResult {
    days: number;
    dailyRate: number;
    /** ค่าชดเชยเบื้องต้น = วันนอน × อัตรา */
    calculatedAmount: number;
    benefitLimit: number | undefined;
    remainingBenefit: number | undefined;
    /** ค่าชดเชยผู้ป่วยในที่ระบบคำนวณได้ (หลังเทียบวงเงินคงเหลือ) */
    payableCompensation: number;
    /** สิทธิ์เบิกรวมของทุกแถว */
    eligibleTotal: number;
    hasIpdHalf5: boolean;
    /** ค่าชดเชยที่นำไปรวมในยอดเงินสุทธิ (0 เมื่อมี IPD_Half_5) */
    includedCompensation: number;
    /** ยอดเงินสุทธิ = สิทธิ์เบิกรวม + includedCompensation */
    net: number;
    /** false = วันนอน/อัตราค่าชดเชยไม่มีข้อมูล ไม่ถูกต้อง หรือเป็นศูนย์ */
    valid: boolean;
}

/** ตัวคำนวณกลาง — ใช้ทั้ง UI (ExpenseRecords) และ gate ปุ่ม ถัดไป/อนุมัติ เพื่อให้ผลตรงกันเสมอ */
export const calculateIpdCompensation = ({
    items,
    totalStayDays,
    dailyRate,
    benefitLimit,
    remainingBenefit,
}: IpdCompensationInput): IpdCompensationResult => {
    const days = toNumber(totalStayDays);
    const rate = toNumber(dailyRate);
    const valid = days > 0 && rate > 0;

    const calculatedSatang = valid ? toSatang(days * rate) : 0;
    const hasRemaining = typeof remainingBenefit === "number" && Number.isFinite(remainingBenefit);
    const payableSatang = hasRemaining
        ? Math.max(Math.min(calculatedSatang, toSatang(remainingBenefit as number)), 0)
        : calculatedSatang;

    const eligibleSatang = items.reduce((sum, item) => sum + toSatang(getItemEligibleAmount(item)), 0);
    const hasIpdHalf5 = items.some((item) => item.code === IPD_HALF_5_CODE);
    const includedSatang = hasIpdHalf5 ? 0 : payableSatang;

    return {
        days,
        dailyRate: rate,
        calculatedAmount: fromSatang(calculatedSatang),
        benefitLimit,
        remainingBenefit: hasRemaining ? remainingBenefit : undefined,
        payableCompensation: fromSatang(payableSatang),
        eligibleTotal: fromSatang(eligibleSatang),
        hasIpdHalf5,
        includedCompensation: fromSatang(includedSatang),
        net: fromSatang(eligibleSatang + includedSatang),
        valid,
    };
};

export const IPD_TRANSFER_MISMATCH_MESSAGE =
    "กรุณาตรวจสอบยอดเงินที่โอน จำนวนเงินโอนรวมต้องเท่ากับสิทธิ์เบิกรวม รวมกับค่าชดเชยผู้ป่วยใน";
export const IPD_HALF_5_TRANSFER_MISMATCH_MESSAGE = "กรุณาตรวจสอบยอดเงินที่โอน จำนวนเงินโอนรวมต้องเท่ากับสิทธิ์เบิกรวม";

/**
 * เทียบจำนวนเงินโอนรวม (paymentAmount จาก Monitor) กับยอดเงินสุทธิ ในหน่วยสตางค์
 * paymentAmount undefined/null = ยังไม่มีข้อมูลยอดโอน → pending (ไม่บล็อก — คงพฤติกรรมเดิมของ getClaimAmountReconciliation)
 */
export const getIpdTransferReconciliation = (
    result: IpdCompensationResult,
    paymentAmount: number | undefined | null
): ClaimAmountReconciliationResult => {
    if (paymentAmount === undefined || paymentAmount === null) {
        return {
            status: "pending",
            message: "ยังไม่มีข้อมูลยอดเงินโอน ระบบจะตรวจสอบส่วนต่างหลังบันทึกยอดที่จ่ายจริง",
        };
    }
    if (toSatang(paymentAmount) !== toSatang(result.net)) {
        return {
            status: "error",
            message: result.hasIpdHalf5 ? IPD_HALF_5_TRANSFER_MISMATCH_MESSAGE : IPD_TRANSFER_MISMATCH_MESSAGE,
        };
    }
    return { status: "ok", message: "จำนวนเงินโอนรวมตรงกับยอดเงินสุทธิ" };
};

export const IPD_COMPENSATION_ERROR_SELECTOR = "[data-ipd-compensation-error]";
export const IPD_TRANSFER_ERROR_SELECTOR = "[data-ipd-transfer-error]";

export interface IpdCompensationGateInput {
    items: ClaimExpenseItem[];
    coverageTypeId: number | undefined;
    medicalTypeId: number | undefined;
    ipdDays: number | undefined;
    icuDays: number | undefined;
    paymentAmount: number | undefined | null;
}

/**
 * gate ของ flow ค่าชดเชยผู้ป่วยใน — คืน selector ของข้อความผิดพลาดที่ต้อง focus หรือ undefined เมื่อผ่าน
 * (นอก flow คืน undefined เสมอ ให้ผู้เรียกใช้เงื่อนไขเดิม)
 */
export const getIpdCompensationBlocker = ({
    items,
    coverageTypeId,
    medicalTypeId,
    ipdDays,
    icuDays,
    paymentAmount,
}: IpdCompensationGateInput): string | undefined => {
    if (!isIpdCompensationFlow(coverageTypeId, medicalTypeId)) return undefined;
    const result = calculateIpdCompensation({
        items,
        totalStayDays: toNumber(ipdDays) + toNumber(icuDays),
        dailyRate: IPD_COMPENSATION_DAILY_RATE,
    });
    if (!result.valid) return IPD_COMPENSATION_ERROR_SELECTOR;
    if (getIpdTransferReconciliation(result, paymentAmount).status === "error") return IPD_TRANSFER_ERROR_SELECTOR;
    return undefined;
};

/** เลื่อนไปและ focus ข้อความผิดพลาด — เรียกเฉพาะตอนผู้ใช้กดดำเนินการต่อ (อัปเดตอัตโนมัติห้ามแย่ง focus) */
export const focusIpdCompensationError = (selector: string) => {
    window.setTimeout(() => {
        const el = document.querySelector<HTMLElement>(selector);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
        el?.focus({ preventScroll: true });
    }, 0);
};
