import { useEffect, useState } from "react";
import { CpgExtraPaymentDetail } from "../store/ExtraPayment.types";
import { MOCK_CPG_EXTRA_PAYMENT_DETAIL, USE_MOCK_DATA } from "../store/ExtraPaymentMock";

interface UseGetCpgExtraPaymentDetailResult {
    data: CpgExtraPaymentDetail | null;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
}

export const useGetCpgExtraPaymentDetail = (cpgNo: string | undefined): UseGetCpgExtraPaymentDetailResult => {
    const [data, setData] = useState<CpgExtraPaymentDetail | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [refetchIndex, setRefetchIndex] = useState(0);

    useEffect(() => {
        if (!cpgNo) return;

        let isMounted = true;
        const fetchData = async () => {
            setIsLoading(true);
            setIsError(false);
            try {
                if (USE_MOCK_DATA) {
                    await new Promise((r) => setTimeout(r, 300));
                    if (isMounted) setData(MOCK_CPG_EXTRA_PAYMENT_DETAIL);
                } else {
                    // TODO: เปลี่ยน endpoint ให้ตรงกับ backend จริง
                    const res = await fetch(`/api/extra-payment/cpg/${cpgNo}`);
                    if (!res.ok) throw new Error("Failed to fetch extra payment detail");
                    const json: CpgExtraPaymentDetail = await res.json();
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
    }, [cpgNo, refetchIndex]);

    return { data, isLoading, isError, refetch: () => setRefetchIndex((i) => i + 1) };
};
