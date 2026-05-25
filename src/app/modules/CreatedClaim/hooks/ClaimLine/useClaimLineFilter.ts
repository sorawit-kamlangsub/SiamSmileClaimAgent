import { useMemo, useState } from "react";
import { useAppSelector } from "../../../../../redux";

const PAGE_SIZE = 50;

export const useClaimLineFilter = () => {
    const items = useAppSelector((s) => s.claimline.items);

    const [searchText, setSearchText] = useState("");
    const [page, setPage] = useState(0); // 0-based

    // ── กรองจาก redux items (data จริงไม่หาย) ──────────────────────────────
    const filteredItems = useMemo(() => {
        if (!searchText.trim()) return items;
        const kw = searchText.toLowerCase();
        return items.filter((i) => i.code?.toLowerCase().includes(kw) || i.description?.toLowerCase().includes(kw));
    }, [items, searchText]);

    // ── slice เฉพาะหน้าปัจจุบัน ──────────────────────────────────────────────
    const pagedItems = useMemo(() => {
        const start = page * PAGE_SIZE;
        return filteredItems.slice(start, start + PAGE_SIZE);
    }, [filteredItems, page]);

    const totalPages = Math.ceil(filteredItems.length / PAGE_SIZE);

    // ── reset หน้าเมื่อ search เปลี่ยน ───────────────────────────────────────
    const handleSearch = (text: string) => {
        setSearchText(text);
        setPage(0);
    };

    return {
        pagedItems, // 50 items สำหรับ render
        filteredItems, // ทั้งหมดที่ผ่าน filter (สำหรับนับ)
        totalItems: filteredItems.length,
        totalAllItems: items.length,
        page,
        setPage,
        totalPages,
        searchText,
        handleSearch,
        PAGE_SIZE,
    };
};
