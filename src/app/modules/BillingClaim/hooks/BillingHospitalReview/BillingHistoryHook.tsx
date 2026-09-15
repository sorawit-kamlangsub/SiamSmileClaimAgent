import { useEffect, useState } from "react";
import { useGetHospitalBillingHistory } from "../../../../api/hospitalBillingApi";

/**
 * ต่อ GET /billing/hospital/{billingDetailId}/history
 *
 * History ของ ID ที่เลือกคืน `rounds` ของ Case เดิมทั้งหมด แต่ `revisions` เฉพาะ BillingDetail นั้น —
 * เปลี่ยนรอบ (`selectedRoundId`) แล้วต้องเรียก endpoint ใหม่ด้วย ID ของรอบนั้น (hospital-billing-fe.md ข้อ 8)
 */
const useBillingHistoryHook = (currentBillingDetailId: string) => {
    const [selectedRoundId, setSelectedRoundId] = useState(currentBillingDetailId);

    useEffect(() => {
        setSelectedRoundId(currentBillingDetailId);
    }, [currentBillingDetailId]);

    const { data, isLoading } = useGetHospitalBillingHistory(selectedRoundId);

    return {
        rounds: data?.data?.rounds ?? [],
        revisions: data?.data?.revisions ?? [],
        isLoading,
        selectedRoundId,
        setSelectedRoundId,
        isViewingCurrentRound: selectedRoundId === currentBillingDetailId,
    };
};

export default useBillingHistoryHook;
