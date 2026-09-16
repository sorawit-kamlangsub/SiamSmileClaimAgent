import { useMemo, useRef, useState } from "react";
import { PaginationResultDto, PaginationSortableDto } from "../../../_common";
import { useGetClaimHistory } from "../../../../api/coreClaimApi";

export interface ClaimHistorySummary {
    /** จำนวนรายการเคลมย้อนหลังทั้งหมด */
    totalCount: number;
    /** OPD คงเหลือในปีกรมธรรม์ปัจจุบัน (ครั้ง) */
    opdRemaining: number;
    /** จำนวนรายการที่เป็นเคลมต่อเนื่อง */
    continuousCount: number;
    /** ยอดเบิกสะสมในปีกรมธรรม์ปัจจุบัน (บาท) */
    accumulatedClaimAmount: number;
}

export type ClaimHistorySortField = "incidentDate" | "claimNo" | "claimAmount";

export const CLAIM_HISTORY_SORT_OPTIONS: { value: ClaimHistorySortField; label: string }[] = [
    { value: "incidentDate", label: "วันที่เกิดเหตุ" },
    { value: "claimNo", label: "เลขที่เคลม" },
    { value: "claimAmount", label: "ยอดเบิก" },
];

/** ค่า mock ชั่วคราวของการ์ด "OPD คงเหลือในปีกรมธรรม์" — BE ยังไม่ส่ง field นี้มาที่ endpoint ใด */
const MOCK_OPD_REMAINING = 8;

/** map ค่า sort ฝั่ง UI ไปเป็นชื่อ field ที่ API คาดหวังใน orderingField */
const ORDERING_FIELD_MAP: Record<ClaimHistorySortField, string> = {
    incidentDate: "IncidentDate",
    claimNo: "ClaimNo",
    claimAmount: "TotalCaseAmount",
};

/**
 * ต่อ useGetClaimHistory ของจริงแล้ว (src/app/api/coreClaimApi.ts) — ตารางใช้ข้อมูลจริงทั้งหมด
 *
 * ส่วนสรุปยอด : "จำนวนรายการ" ใช้ totalAmountRecords จริงจาก response, "เคลมต่อเนื่อง"/"ยอดเบิกสะสม"
 * คำนวณจากแถวในตารางหน้าปัจจุบัน เหลือแค่ "OPD คงเหลือ" ที่ยังเป็นค่า mock เพราะ BE ยังไม่ส่งมาให้
 */
const DEFAULT_PAGINATED: PaginationSortableDto = {
    page: 1,
    recordsPerPage: 10,
    orderingField: "incidentDate",
    ascendingOrder: false,
};

const useClaimHistoryTab = (applicationId?: string) => {
    const [searchText, setSearchText] = useState("");
    const [paginated, setPaginated] = useState<PaginationSortableDto>(DEFAULT_PAGINATED);

    // ClaimHistoryTab ไม่ถูก unmount ตอนสลับไปดูอีกเคลม (ClaimDetailsTab ไม่ unmount เช่นกัน — ดู
    // ConsiderDetailHook.tsx) ถ้าไม่รีเซ็ต searchText/paginated ตรงนี้ด้วย ค่าค้นหา/หน้าของเคลมก่อนหน้า
    // จะติดมาที่เคลมใหม่ อาจทำให้เห็น "ไม่พบข้อมูล" ทั้งที่เคลมใหม่มีประวัติจริง
    const prevApplicationIdRef = useRef(applicationId);
    if (prevApplicationIdRef.current !== applicationId) {
        prevApplicationIdRef.current = applicationId;
        setSearchText("");
        setPaginated(DEFAULT_PAGINATED);
    }

    const handleSearchTextChange = (value: string) => {
        setSearchText(value);
        setPaginated((prev) => ({ ...prev, page: 1 }));
    };

    const handleSortByChange = (value: ClaimHistorySortField) => {
        setPaginated((prev) => ({ ...prev, page: 1, orderingField: value }));
    };

    const sortBy = (paginated.orderingField as ClaimHistorySortField) ?? "incidentDate";

    const {
        data: claimHistoryData,
        isLoading,
        isError,
    } = useGetClaimHistory(
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
        totalCount: pagination.totalAmountRecords ?? 0,
        opdRemaining: MOCK_OPD_REMAINING,
        continuousCount,
        accumulatedClaimAmount,
    };

    return {
        items,
        summary,
        isLoading,
        isError,
        searchText,
        setSearchText: handleSearchTextChange,
        sortBy,
        setSortBy: handleSortByChange,
        pagination,
        setPaginated,
    };
};

export default useClaimHistoryTab;
