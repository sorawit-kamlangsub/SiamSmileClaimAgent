export const sanitizeDecimalInput = (raw: string): string => {
    let value = raw.replace(/[^\d.]/g, ""); // เอาเฉพาะ digit และจุด

    const firstDot = value.indexOf(".");
    if (firstDot !== -1) {
        value = value.slice(0, firstDot + 1) + value.slice(firstDot + 1).replace(/\./g, "");
    }

    const [intPartRaw, decPartRaw] = value.split(".");
    const intPart = (intPartRaw ?? "").replace(/^0+(?=\d)/, "");
    const decPart = decPartRaw !== undefined ? decPartRaw.slice(0, 2) : undefined;

    if (decPart !== undefined) return `${intPart || "0"}.${decPart}`;
    return intPart;
};

export const sanitizeIntegerInput = (raw: string): string => {
    let value = raw.replace(/[^\d]/g, "");
    value = value.replace(/^0+(?=\d)/, "");
    return value;
};

export const toAmount = (raw: string): number => {
    const sanitized = sanitizeDecimalInput(raw);
    const n = parseFloat(sanitized);
    return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
};

export const toInteger = (raw: string): number => {
    const sanitized = sanitizeIntegerInput(raw);
    const n = parseInt(sanitized, 10);
    return Number.isFinite(n) ? n : 0;
};

export interface ExpenseAmountLike {
    claimAmount?: number;
    discount?: number;
    notCovered?: number;
    reason?: number;
}

export const hasAmountSumError = (item: ExpenseAmountLike): boolean => {
    const claim = Number(item.claimAmount ?? 0);
    const discount = Number(item.discount ?? 0);
    const notCovered = Number(item.notCovered ?? 0);
    return discount + notCovered > claim;
};

export const hasMissingReasonError = (item: ExpenseAmountLike) => {
    const hasNotCovered = Number(item.notCovered ?? 0) > 0;
    const hasReason = item.reason !== undefined && item.reason !== null;
    return hasNotCovered && !hasReason;
};

export const NON_COVERED_REASON_EXCEED_LIMIT = 5; // เกินสิทธิ์ความคุ้มครอง

export interface MaximumLimitInput {
    claimAmount: number;
    discount: number;
    notCovered: number;
    reason: number | undefined;
    maximumLimit?: number;
}

export const applyMaximumLimit = ({
    claimAmount,
    discount,
    notCovered,
    reason,
    maximumLimit,
}: MaximumLimitInput): MaximumLimitInput => {
    const limit = Number(maximumLimit ?? 0);

    if (limit <= 0 || claimAmount <= limit) {
        return { claimAmount, discount, notCovered, reason, maximumLimit };
    }

    return {
        claimAmount,
        discount,
        notCovered: Math.round((claimAmount - limit) * 100) / 100,
        reason: NON_COVERED_REASON_EXCEED_LIMIT,
        maximumLimit,
    };
};

export interface ClaimExpenseAmountLike extends ExpenseAmountLike {
    receiptAmount?: number;
}

export interface ClaimExpenseTotals {
    totalReceipt: number;
    totalClaim: number;
    totalDiscount: number;
    totalNotCovered: number;
}

/** รวมยอดของรายการค่ารักษาทั้งหมด — ใช้ร่วมกันทั้งฝั่งแสดงผล (ExpenseRecords) และฝั่งบล็อกปุ่ม "ถัดไป" (ClaimStepCalculateHook) เพื่อไม่ให้สูตรรวมยอดเพี้ยนกันคนละที่ */
export const sumClaimExpenseItems = (items: ClaimExpenseAmountLike[]): ClaimExpenseTotals => ({
    totalReceipt: items.reduce((sum, item) => sum + (item.receiptAmount || 0), 0),
    totalClaim: items.reduce((sum, item) => sum + (item.claimAmount || 0), 0),
    totalDiscount: items.reduce((sum, item) => sum + (item.discount || 0), 0),
    totalNotCovered: items.reduce((sum, item) => sum + (item.notCovered || 0), 0),
});

export type ClaimAmountReconciliationStatus = "ok" | "pending" | "warningExgratia" | "warningDeficit" | "error";

export interface ClaimAmountReconciliationResult {
    status: ClaimAmountReconciliationStatus;
    message: string;
}

export interface ClaimAmountReconciliationInput extends ClaimExpenseTotals {
    /**
     * ยอดที่จ่ายจริง — มาจาก detail.paymentAmount (ตัวเดียวกับการ์ด "สรุปรายการแจ้งโอน")
     * undefined/null = ยังไม่มีข้อมูลยอดโอน (ยังไม่ถึงขั้นตอนแจ้งโอน) — ต้องแยกจาก 0 ที่แปลว่าผู้ใช้ยืนยันแล้วว่าไม่ได้โอน
     * เพราะไม่งั้นจะขึ้น "ส่วนต่างที่ไม่มีเหตุผลรองรับ" ทั้งที่ยังไม่ถึงเวลาต้องกรอกยอดโอน
     * (backend ส่ง null มาได้แม้ type จะประกาศแค่ number | undefined เพราะ field เป็น nullable ฝั่ง DB)
     */
    paymentAmount: number | undefined | null;
}

const fmtBaht = (v: number) => v.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * ตรวจสอบยอดเงิน ClaimLine ตาม spec "Validate การตรวจสอบยอดเงิน ClaimLine" —
 * เทียบ (ยอดที่จ่าย + ยอดไม่คุ้มครอง) กับ (ใบเสร็จ - ส่วนลด) และเทียบยอดที่จ่ายกับสิทธิ์เบิก
 *
 * ลำดับการเช็คสำคัญ : ต้องเช็ค "เกินใบเสร็จ" (error) ก่อน "เกินสิทธิ์เบิก" (warning) เพราะเคสที่ยอดรวม
 * เกินใบเสร็จไปแล้วถือเป็นข้อมูลผิดที่ร้ายแรงกว่า ไม่ว่าจะเกินสิทธิ์เบิกด้วยหรือไม่ก็ตาม
 */
export const getClaimAmountReconciliation = ({
    totalReceipt,
    totalClaim,
    totalDiscount,
    totalNotCovered,
    paymentAmount,
}: ClaimAmountReconciliationInput): ClaimAmountReconciliationResult => {
    if (paymentAmount === undefined || paymentAmount === null) {
        return {
            status: "pending",
            message: "ยังไม่มีข้อมูลยอดเงินโอน ระบบจะตรวจสอบส่วนต่างหลังบันทึกยอดที่จ่ายจริง",
        };
    }

    const netReceipt = Math.round((totalReceipt - totalDiscount) * 100) / 100;
    const accounted = Math.round((paymentAmount + totalNotCovered) * 100) / 100;
    const diff = Math.round((accounted - netReceipt) * 100) / 100;

    if (diff > 0) {
        return {
            status: "error",
            message: `ยอดที่จ่ายรวมยอดไม่คุ้มครอง (${fmtBaht(accounted)} บาท) มากกว่าใบเสร็จสุทธิ (${fmtBaht(
                netReceipt
            )} บาท) อยู่ ${fmtBaht(diff)} บาท กรุณาตรวจสอบยอดเงิน`,
        };
    }

    if (paymentAmount > totalClaim) {
        return {
            status: "warningExgratia",
            message: `ยอดที่จ่าย (${fmtBaht(paymentAmount)} บาท) มากกว่าสิทธิ์เบิก (${fmtBaht(
                totalClaim
            )} บาท) อยู่ ${fmtBaht(paymentAmount - totalClaim)} บาท ต้องยืนยัน Exgratia/NPL`,
        };
    }

    if (diff < 0) {
        return {
            status: "warningDeficit",
            message: `ยังมีส่วนต่าง ${fmtBaht(
                Math.abs(diff)
            )} บาทที่ไม่มีเหตุผลรองรับ กรุณาตรวจสอบยอดที่จ่าย/ยอดไม่คุ้มครองให้ครบตามใบเสร็จ`,
        };
    }

    return { status: "ok", message: "ยอดเงินครบถ้วนตรงตามใบเสร็จ" };
};
