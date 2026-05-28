import { useMemo, useState, useTransition } from "react";
import { useAppSelector } from "../../../../../redux";

const PAGE_SIZE = 50;

export const useClaimLineFilter = () => {
    const items = useAppSelector((s) => s.claimline.items);

    const [searchText, setSearchText] = useState("");
    const [page, setPage] = useState(0);
    const [isPending, startTransition] = useTransition();

    const filteredItems = useMemo(() => {
        if (!searchText.trim()) return items;
        const kw = searchText.toLowerCase();
        return items.filter((i) => i.code?.toLowerCase().includes(kw) || i.description?.toLowerCase().includes(kw));
    }, [items, searchText]);

    const pagedItems = useMemo(() => {
        const start = page * PAGE_SIZE;
        return filteredItems.slice(start, start + PAGE_SIZE);
    }, [filteredItems, page]);

    const handleSearch = (text: string) => {
        startTransition(() => {
            setSearchText(text);
            setPage(0);
        });
    };

    return {
        pagedItems,
        filteredItems,
        totalItems: filteredItems.length,
        totalAllItems: items.length,
        page,
        setPage,
        totalPages: Math.ceil(filteredItems.length / PAGE_SIZE),
        searchText,
        handleSearch,
        isPending,
        PAGE_SIZE,
    };
};
