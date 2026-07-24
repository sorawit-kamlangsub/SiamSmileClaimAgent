import { useEffect, useState } from "react";
import { ExtraPaymentReasonOption } from "../store/ExtraPayment.types";
import { MOCK_REASON_OPTIONS, USE_MOCK_DATA } from "../store/ExtraPaymentMock";

export const useGetExtraPaymentReasonOptions = () => {
    const [data, setData] = useState<ExtraPaymentReasonOption[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            setIsLoading(true);
            try {
                if (USE_MOCK_DATA) {
                    await new Promise((r) => setTimeout(r, 150));
                    if (isMounted) setData(MOCK_REASON_OPTIONS);
                } else {
                    // TODO: เปลี่ยน endpoint ให้ตรงกับ backend จริง
                    const res = await fetch(`/api/extra-payment/reason-options`);
                    const json: ExtraPaymentReasonOption[] = await res.json();
                    if (isMounted) setData(json);
                }
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };
        fetchData();
        return () => {
            isMounted = false;
        };
    }, []);

    return { data, isLoading };
};
