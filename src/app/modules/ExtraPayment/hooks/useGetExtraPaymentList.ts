import { useEffect, useState } from "react";
import { ExtraPaymentListItem } from "../store/ExtraPayment.types";
import { MOCK_EXTRA_PAYMENT_LIST, USE_MOCK_DATA } from "../store/ExtraPaymentMock";

interface UseGetExtraPaymentListResult {
    data: ExtraPaymentListItem[];
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
}

// statusId = null หมายถึง "ทั้งหมด"
export const useGetExtraPaymentList = (statusId: number | null): UseGetExtraPaymentListResult => {
    const [data, setData] = useState<ExtraPaymentListItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [refetchIndex, setRefetchIndex] = useState(0);

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            setIsLoading(true);
            setIsError(false);
            try {
                if (USE_MOCK_DATA) {
                    await new Promise((r) => setTimeout(r, 300));
                    const filtered = statusId
                        ? MOCK_EXTRA_PAYMENT_LIST.filter((item) => item.statusId === statusId)
                        : MOCK_EXTRA_PAYMENT_LIST;
                    if (isMounted) setData(filtered);
                } else {
                    // TODO: เปลี่ยน endpoint ให้ตรงกับ backend จริง
                    const query = statusId ? `?statusId=${statusId}` : "";
                    const res = await fetch(`/api/extra-payment/list${query}`);
                    if (!res.ok) throw new Error("Failed to fetch extra payment list");
                    const json: ExtraPaymentListItem[] = await res.json();
                    if (isMounted) setData(json);
                }
            } catch (err) {
                if (isMounted) setIsError(true);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };
        fetchData();
        return () => {
            isMounted = false;
        };
    }, [statusId, refetchIndex]);

    return { data, isLoading, isError, refetch: () => setRefetchIndex((i) => i + 1) };
};
