import { useEffect, useState } from "react";
import { BankAccount } from "../store/ExtraPayment.types";
import { MOCK_BANK_ACCOUNTS, USE_MOCK_DATA } from "../store/ExtraPaymentMock";

interface UseGetBankAccountsResult {
    data: BankAccount[];
    isLoading: boolean;
    isError: boolean;
}

export const useGetBankAccounts = (cpgNo: string | undefined): UseGetBankAccountsResult => {
    const [data, setData] = useState<BankAccount[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        if (!cpgNo) return;

        let isMounted = true;
        const fetchData = async () => {
            setIsLoading(true);
            setIsError(false);
            try {
                if (USE_MOCK_DATA) {
                    await new Promise((r) => setTimeout(r, 200));
                    if (isMounted) setData(MOCK_BANK_ACCOUNTS);
                } else {
                    // TODO: เปลี่ยน endpoint ให้ตรงกับ backend จริง
                    const res = await fetch(`/api/extra-payment/bank-accounts?cpgNo=${cpgNo}`);
                    if (!res.ok) throw new Error("Failed to fetch bank accounts");
                    const json: BankAccount[] = await res.json();
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
    }, [cpgNo]);

    return { data, isLoading, isError };
};
