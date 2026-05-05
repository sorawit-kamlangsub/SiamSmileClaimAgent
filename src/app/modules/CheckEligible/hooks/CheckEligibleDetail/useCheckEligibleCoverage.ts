// hooks/CheckEligible/useCheckEligibleCoverage.ts
import { useMemo } from "react";
import { formatThaiDate } from "./useCheckEligibleDetail";
import { ContinuousClaimRow, CoverageBenefit } from "../../store/checkeligibleSlice";

const useCheckEligibleCoverage = (
    benefits: CoverageBenefit[],
    continuousRows: ContinuousClaimRow[],
    isContinuous: boolean
) => {
    // วงเงินคงเหลือของแต่ละผลประโยชน์
    const benefitsWithBalance = useMemo(
        () =>
            benefits.map((b) => ({
                ...b,
                remainingAmount: b.maxAmount - b.usedAmount,
                remainingDays: b.maxDays !== undefined && b.usedDays !== undefined ? b.maxDays - b.usedDays : undefined,
            })),
        [benefits]
    );

    // แปลงวันที่ตารางเป็น Thai format
    const formattedRows = useMemo(
        () =>
            continuousRows.map((r) => ({
                ...r,
                incidentDateThai: formatThaiDate(r.incidentDate),
            })),
        [continuousRows]
    );

    return { benefitsWithBalance, formattedRows };
};

export default useCheckEligibleCoverage;
