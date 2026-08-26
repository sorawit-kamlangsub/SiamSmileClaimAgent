// ─── ocrCompareHelpers.ts ──────────────────────────────────────────────────────
import dayjs, { Dayjs } from "dayjs";
import { OcrStatus } from "./modules/CreatedClaim/components/CreateClaim/OcrDocumentScanSection";

const normalizeName = (name?: string | null): string => {
    if (!name) return "";
    return name.trim().replace(/\s+/g, "").toLowerCase();
};

export const compareOcrName = (ocrName?: string | null, systemName?: string | null): OcrStatus => {
    if (!ocrName) return "pending";
    if (!systemName) return "pending";
    return normalizeName(ocrName) === normalizeName(systemName) ? "matched" : "mismatched";
};

const normalizeIdCardNo = (idCardNo?: string | null): string => {
    if (!idCardNo) return "";
    return idCardNo.replace(/[\s-]/g, "").trim();
};

export const compareOcrIdCardNo = (ocrIdCardNo?: string | null, systemIdCardNo?: string | null): OcrStatus => {
    if (!ocrIdCardNo) return "pending";
    if (!systemIdCardNo) return "pending";
    return normalizeIdCardNo(ocrIdCardNo) === normalizeIdCardNo(systemIdCardNo) ? "matched" : "mismatched";
};

/**
 * เทียบยอดเงินสุทธิที่ OCR อ่านได้ กับยอดเงินในระบบ — ต้องเท่ากันเป๊ะ
 */
export const compareOcrAmount = (ocrAmount?: number | null, systemAmount?: number | null): OcrStatus => {
    if (ocrAmount === undefined || ocrAmount === null) return "pending";
    if (systemAmount === undefined || systemAmount === null) return "pending";
    return ocrAmount === systemAmount ? "matched" : "mismatched";
};

/**
 * เทียบวันที่เข้ารักษา — OCR ส่งมาเป็น string รูปแบบ YYYY-MM-DD (ISO ค.ศ.)
 * systemDate เป็น Dayjs (จาก formik.values.dateIn) — เทียบกันที่ระดับวัน (ไม่รวมเวลา)
 */
export const compareOcrDate = (ocrDateStr?: string | null, systemDate?: Dayjs | null): OcrStatus => {
    if (!ocrDateStr) return "pending";
    if (!systemDate) return "pending";

    const ocrDate = dayjs(ocrDateStr, "YYYY-MM-DD", true); // strict parse
    if (!ocrDate.isValid()) return "pending";

    return ocrDate.isSame(systemDate, "day") ? "matched" : "mismatched";
};

export const focusToFirstError = (errors: any) => {
    if (!errors) return;
    const findFirstKey = (obj: any, path: string[] = []): string | null => {
        for (const key of Object.keys(obj)) {
            if (typeof obj[key] === "string" && obj[key]) {
                return [...path, key].join(".");
            }
            if (typeof obj[key] === "object" && obj[key] !== null) {
                const nested = findFirstKey(obj[key], [...path, key]);
                if (nested) return nested;
            }
        }
        return null;
    };
    const firstErrorKey = findFirstKey(errors);
    if (firstErrorKey) {
        const el = document.querySelector(`[data-field-name="${firstErrorKey}"]`);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
};
