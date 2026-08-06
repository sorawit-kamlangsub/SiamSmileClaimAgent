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

    const excess = Math.round((claimAmount - limit) * 100) / 100;

    return {
        claimAmount: limit,
        discount,
        notCovered: Math.round((notCovered + excess) * 100) / 100,
        reason: NON_COVERED_REASON_EXCEED_LIMIT,
        maximumLimit,
    };
};
