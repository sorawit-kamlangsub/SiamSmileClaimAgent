import { useClaimLineHeader } from "./useClaimLineHeader";
import { useDaysCalculate } from "./useDaysCalculate";
import { useClaimLineCalculate } from "./useClaimLineCalculate";
import { swalError } from "../../_common";

/**
 * @param onNavigateToSummary  เรียกตอนกด "ถัดไป" ในหน้า ClaimSimulate เพื่อไปหน้าสรุป
 */

export const useClaimSimulatePage = (onNavigateToSummary?: () => void) => {
    const header = useClaimLineHeader();
    const days = useDaysCalculate();
    const calculate = useClaimLineCalculate();

    const handleGoToSummary = async () => {
        const headerError = header.validateHeader();
        if (headerError) {
            swalError("ไม่สามารถดำเนินการต่อได้", headerError);
            return;
        }

        const isItemsValid = calculate.handleNext();
        if (!isItemsValid) return;

        const isDaysValid = await days.validateDaysCalculate();
        if (!isDaysValid) return;

        onNavigateToSummary?.();
    };

    const handleConfirmCalculate = () => days.handleCalculate();

    return {
        ...header,
        ...days,
        ...calculate,
        handleNext: handleGoToSummary,
        handleConfirmCalculate,
    };
};
