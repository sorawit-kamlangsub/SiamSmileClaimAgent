export const sanitizeDecimalInput = (raw: string): string => {
    let value = raw.replace(/[^\d.]/g, ""); // เอาเฉพาะ digit และจุด

    // เหลือจุดแค่ตัวแรก
    const firstDot = value.indexOf(".");
    if (firstDot !== -1) {
        value = value.slice(0, firstDot + 1) + value.slice(firstDot + 1).replace(/\./g, "");
    }

    const [intPartRaw, decPartRaw] = value.split(".");
    // ตัด leading zero (เช่น "0553" -> "553") แต่เก็บ "0" เดี่ยวๆ ไว้ได้
    const intPart = (intPartRaw ?? "").replace(/^0+(?=\d)/, "");
    const decPart = decPartRaw !== undefined ? decPartRaw.slice(0, 2) : undefined;

    if (decPart !== undefined) return `${intPart || "0"}.${decPart}`;
    return intPart;
};

// ── sanitize ตัวเลขจำนวนเต็ม (ใช้กับจำนวนวัน IPD/ICU): ไม่มีทศนิยม, ตัด leading zero ──
export const sanitizeIntegerInput = (raw: string): string => {
    let value = raw.replace(/[^\d]/g, "");
    value = value.replace(/^0+(?=\d)/, "");
    return value;
};

// ── แปลงค่าที่ sanitize แล้วเป็น number ปัดทศนิยมไม่เกิน 2 ตำแหน่ง ──
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
    reason?: string;
}

// ── ส่วนลด + ยอดไม่คุ้มครอง รวมกันต้องไม่เกินยอดเบิก ──
export const hasAmountSumError = (item: ExpenseAmountLike): boolean => {
    const claim = Number(item.claimAmount ?? 0);
    const discount = Number(item.discount ?? 0);
    const notCovered = Number(item.notCovered ?? 0);
    return discount + notCovered > claim;
};

// ── ถ้ามียอดไม่คุ้มครอง (> 0) ต้องเลือกสาเหตุไม่คุ้มครองด้วย ──
export const hasMissingReasonError = (item: ExpenseAmountLike): boolean => {
    const notCovered = Number(item.notCovered ?? 0);
    return notCovered > 0 && !item.reason;
};
