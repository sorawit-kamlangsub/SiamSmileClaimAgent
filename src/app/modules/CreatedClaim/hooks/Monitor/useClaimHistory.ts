import { useState, useMemo } from "react";
import { ClaimHistoryItem, mockClaimHistory } from "../../store/mockClaimHistory";

const PAGE_SIZE = 2;

export const useClaimHistory = () => {
    const [page, setPage] = useState(0);

    const data: ClaimHistoryItem[] = mockClaimHistory; // เปลี่ยนเป็น API call ได้ภายหลัง

    const totalPages = Math.ceil(data.length / PAGE_SIZE);

    const paged = useMemo(() => data.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE), [data, page]);

    const handleDetailClick = (item: ClaimHistoryItem) => {
        // TODO: navigate ไปหน้ารายละเอียด หรือ dispatch action
        console.log("view detail:", item);
    };

    return { paged, page, setPage, totalPages, total: data.length, handleDetailClick };
};
