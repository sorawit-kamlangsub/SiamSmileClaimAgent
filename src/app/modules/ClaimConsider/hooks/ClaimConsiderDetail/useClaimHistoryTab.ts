import { useMemo, useState } from "react";
import { PaginationResultDto, PaginationSortableDto } from "../../../_common";
import { useGetClaimHistory } from "../../../../api/coreClaimApi";
import {
    ClaimHistorySummary,
    MOCK_CLAIM_HISTORY_SUMMARY,
} from "../../components/ConsiderDetails/TabDetails/mock/claimHistoryMock";

export type ClaimHistorySortField = "incidentDate" | "claimNo" | "claimAmount";

export const CLAIM_HISTORY_SORT_OPTIONS: { value: ClaimHistorySortField; label: string }[] = [
    { value: "incidentDate", label: "วันที่เกิดเหตุ" },
    { value: "claimNo", label: "เลขที่เคลม" },
    { value: "claimAmount", label: "ยอดเบิก" },
];

/** map ค่า sort ฝั่ง UI ไปเป็นชื่อ field ที่ API คาดหวังใน orderingField */
const ORDERING_FIELD_MAP: Record<ClaimHistorySortField, string> = {
    incidentDate: "IncidentDate",
    claimNo: "ClaimNo",
    claimAmount: "TotalCaseAmount",
};

/**
 * ต่อ useGetClaimHistory ของจริงแล้ว (src/app/api/coreClaimApi.ts) — ตารางใช้ข้อมูลจริงทั้งหมด
 *
 * ส่วนสรุปยอด (OPD คงเหลือ/เคลมต่อเนื่อง/ยอดเบิกสะสม) BE ยังไม่มี endpoint แยกให้ ยังใช้ mock อยู่
 * (ดูคอมเมนต์ตรง summary ด้านล่าง) ยกเว้น "จำนวนรายการ" ที่ใช้ totalAmountRecords จริงจาก response แล้ว
 */
const useClaimHistoryTab = (applicationId?: string) => {
    const [searchText, setSearchText] = useState("");
    const [paginated, setPaginated] = useState<PaginationSortableDto>({
        page: 1,
        recordsPerPage: 10,
        orderingField: "incidentDate",
        ascendingOrder: false,
    });

    const handleSearchTextChange = (value: string) => {
        setSearchText(value);
        setPaginated((prev) => ({ ...prev, page: 1 }));
    };

    const handleSortByChange = (value: ClaimHistorySortField) => {
        setPaginated((prev) => ({ ...prev, page: 1, orderingField: value }));
    };

    const sortBy = (paginated.orderingField as ClaimHistorySortField) ?? "incidentDate";

    const { data: claimHistoryData, isLoading } = useGetClaimHistory(
        applicationId,
        searchText.trim() || undefined,
        ORDERING_FIELD_MAP[sortBy],
        paginated.ascendingOrder,
        paginated.page,
        paginated.recordsPerPage
    );

    const items = useMemo(() => claimHistoryData?.data ?? [], [claimHistoryData]);

    const pagination: PaginationResultDto = useMemo(
        () => ({
            totalAmountRecords: claimHistoryData?.totalAmountRecords ?? 0,
            totalAmountPages: claimHistoryData?.totalAmountPages ?? 0,
            currentPage: claimHistoryData?.currentPage ?? paginated.page,
            recordsPerPage: claimHistoryData?.recordsPerPage ?? paginated.recordsPerPage,
            pageIndex: claimHistoryData?.pageIndex ?? 0,
        }),
        [claimHistoryData, paginated.page, paginated.recordsPerPage]
    );

    // TODO: ต่อ API สรุปยอดจริง — BE ยังไม่มี endpoint แยกสำหรับ OPD คงเหลือ ยังใช้ mock อยู่
    // "จำนวนรายการ" ใช้ totalAmountRecords จริงจาก useGetClaimHistory
    // "เคลมต่อเนื่อง"/"ยอดเบิกปีกรมธรรม์ (สะสม)" นับ/รวมจากรายการที่โหลดมาในตาราง (items หน้าปัจจุบัน)
    // ตามที่ระบุ — ไม่ใช่ยอดรวมข้ามทุกหน้า เพราะ BE ยังไม่มี endpoint สรุปยอดแยกให้เช่นกัน
    const { continuousCount, accumulatedClaimAmount } = useMemo(
        () => ({
            continuousCount: items.filter((item) => (item.countCase ?? 0) > 1).length,
            accumulatedClaimAmount: items.reduce((sum, item) => sum + (item.totalCaseAmount ?? 0), 0),
        }),
        [items]
    );

    const summary: ClaimHistorySummary = {
        ...MOCK_CLAIM_HISTORY_SUMMARY,
        totalCount: pagination.totalAmountRecords ?? 0,
        continuousCount,
        accumulatedClaimAmount,
    };

    return {
        items,
        summary,
        isLoading,
        searchText,
        setSearchText: handleSearchTextChange,
        sortBy,
        setSortBy: handleSortByChange,
        pagination,
        setPaginated,
    };
};

export default useClaimHistoryTab;
