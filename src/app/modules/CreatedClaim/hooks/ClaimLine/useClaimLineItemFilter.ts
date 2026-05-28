import { useMemo } from "react";
import { useAppSelector } from "../../../../../redux";

export interface ClaimLineSearchOption {
    id: number;
    code: string;
    description: string;
}

export const useClaimLineItemFilter = (searchValue: string) => {
    const items = useAppSelector((s) => s.claimline.items);

    const options = useMemo(() => {
        const kw = searchValue.toLowerCase().trim().substring(0, 10);
        const source = items.filter((i) => !i.disabled); // กรอง disabled ออกถ้าต้องการ

        const filtered = kw
            ? source.filter((i) => i.code?.toLowerCase().includes(kw) || i.description?.toLowerCase().includes(kw))
            : source;

        return filtered.slice(0, 10).map((i) => ({
            id: i.id,
            code: i.code ?? "",
            description: i.description ?? "",
        }));
    }, [items, searchValue]);

    return { data: options, isLoading: false };
};
