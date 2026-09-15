import { useEffect, useState } from "react";
import { BankAccountRelationOption, BankOption } from "../store/ExtraPayment.types";
import { MOCK_BANK_ACCOUNT_RELATION_OPTIONS, MOCK_BANK_OPTIONS, USE_MOCK_DATA } from "../store/ExtraPaymentMock";

export const useGetMasterOptions = () => {
    const [bankOptions, setBankOptions] = useState<BankOption[]>([]);
    const [relationOptions, setRelationOptions] = useState<BankAccountRelationOption[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            setIsLoading(true);
            try {
                if (USE_MOCK_DATA) {
                    await new Promise((r) => setTimeout(r, 150));
                    if (isMounted) {
                        setBankOptions(MOCK_BANK_OPTIONS);
                        setRelationOptions(MOCK_BANK_ACCOUNT_RELATION_OPTIONS);
                    }
                } else {
                    // TODO: เปลี่ยน endpoint ให้ตรงกับ backend/Master Data จริง
                    const [bankRes, relationRes] = await Promise.all([
                        fetch(`/api/master-data/banks`),
                        fetch(`/api/master-data/bank-account-relations`),
                    ]);
                    const banks: BankOption[] = await bankRes.json();
                    const relations: BankAccountRelationOption[] = await relationRes.json();
                    if (isMounted) {
                        setBankOptions(banks);
                        setRelationOptions(relations);
                    }
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

    return { bankOptions, relationOptions, isLoading };
};
