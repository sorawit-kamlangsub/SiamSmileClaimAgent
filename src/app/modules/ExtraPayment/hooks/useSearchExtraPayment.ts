import { useState } from "react";
import { SearchExtraPaymentResult } from "../store/ExtraPayment.types";
import { USE_MOCK_DATA } from "../store/ExtraPaymentMock";

// Validate: กรอกได้เฉพาะตัวเลขและตัวอักษรภาษาอังกฤษ
export const EXTRA_PAYMENT_SEARCH_PATTERN = /^[a-zA-Z0-9]+$/;

// mock lookup: CL -> CPG (เอาไว้ทดสอบ flow ค้นหาด้วยเลขที่ CL)
const MOCK_CL_TO_CPG: Record<string, { cpgNo: string; claimOnLineId: number }> = {
    CL6904000193: { cpgNo: "CPG000XXX", claimOnLineId: 1 },
    CL6904000194: { cpgNo: "CPG000XXX", claimOnLineId: 2 },
};

export const useSearchExtraPayment = () => {
    const [isSearching, setIsSearching] = useState(false);
    const [isError, setIsError] = useState(false);

    const search = async (rawInput: string): Promise<SearchExtraPaymentResult | null> => {
        const input = rawInput.trim().toUpperCase();
        if (!EXTRA_PAYMENT_SEARCH_PATTERN.test(input)) {
            setIsError(true);
            return null;
        }

        setIsSearching(true);
        setIsError(false);
        try {
            if (USE_MOCK_DATA) {
                await new Promise((r) => setTimeout(r, 300));

                if (input.startsWith("CPG")) {
                    return { found: true, cpgNo: input };
                }
                if (input.startsWith("CL")) {
                    const match = MOCK_CL_TO_CPG[input];
                    if (!match) return { found: false, cpgNo: input };
                    return { found: true, cpgNo: match.cpgNo, claimOnLineId: match.claimOnLineId };
                }
                return { found: false, cpgNo: input };
            }

            // TODO: เปลี่ยน endpoint ให้ตรงกับ backend จริง
            const res = await fetch(`/api/extra-payment/search?query=${input}`);
            if (!res.ok) throw new Error("Search failed");
            const json: SearchExtraPaymentResult = await res.json();
            return json;
        } catch (err) {
            setIsError(true);
            return null;
        } finally {
            setIsSearching(false);
        }
    };

    return { search, isSearching, isError };
};
