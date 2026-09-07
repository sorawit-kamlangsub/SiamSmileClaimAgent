import { useMemo, useState } from "react";
import { PaginationResultDto, PaginationSortableDto } from "../../../_common";
import { useGetDCR } from "../../../../api/coreClaimApi";

export type PaymentHistoryStatusFilter = "all" | "paid" | "unpaid";

export const PAYMENT_HISTORY_STATUS_OPTIONS: { value: PaymentHistoryStatusFilter; label: string }[] = [
    { value: "all", label: "ทั้งหมด" },
    { value: "paid", label: "ชำระแล้ว" },
    { value: "unpaid", label: "ค้างชำระ" },
];

/**
 * ต่อ useGetDCR ของจริงแล้ว (src/app/api/coreClaimApi.ts) — ตารางใช้ข้อมูลจริงทั้งหมด
 *
 * BE ไม่มี parameter สำหรับกรองตามสถานะการชำระ จึงกรอง "ชำระแล้ว/ค้างชำระ" ฝั่ง client จาก
 * paymentType ของแถวที่ได้มาในหน้านั้นๆ (ไม่ใช่กรองทั้งชุดข้อมูลข้ามหน้า) — เพราะงั้นตอนเลือกกรอง
 * สถานะ ตัวเลข pagination (จำนวนหน้า/ทั้งหมด) ที่มาจาก server จะยังนับรวมทุกสถานะอยู่ ในขณะที่
 * แถวที่แสดงจริงถูกกรองแล้ว — เป็นข้อจำกัดที่ต้องแจ้งให้ทีมทราบถ้าต้องการกรองแม่นยำข้ามทุกหน้า
 * ต้องให้ BE เพิ่ม parameter กรองสถานะให้ endpoint นี้โดยตรง
 *
 * summary (จำนวนงวด/ตั้งหนี้รวม/ชำระแล้วรวม/งวดที่ชำระแล้ว/งวดค้างชำระ) คำนวณจากรายการที่แสดง
 * ในตาราง (items หลังกรองสถานะ) ตามที่ระบุ ไม่ใช่ยอดรวมข้ามทุกหน้า
 */
const usePaymentHistoryTab = (applicationCode?: string) => {
    const [searchText, setSearchText] = useState("");
    const [status, setStatus] = useState<PaymentHistoryStatusFilter>("all");
    const [paginated, setPaginated] = useState<PaginationSortableDto>({
        page: 1,
        recordsPerPage: 15,
    });

    const handleSearchTextChange = (value: string) => {
        setSearchText(value);
        setPaginated((prev) => ({ ...prev, page: 1 }));
    };

    const handleStatusChange = (value: PaymentHistoryStatusFilter) => {
        setStatus(value);
        setPaginated((prev) => ({ ...prev, page: 1 }));
    };

    const { data: dcrData, isLoading } = useGetDCR(
        applicationCode,
        searchText.trim() || undefined,
        paginated.orderingField,
        paginated.ascendingOrder,
        paginated.page,
        paginated.recordsPerPage
    );

    const allItems = useMemo(() => dcrData?.data ?? [], [dcrData]);

    const items = useMemo(() => {
        if (status === "all") return allItems;
        return allItems.filter((item) => (status === "paid" ? !!item.paymentType : !item.paymentType));
    }, [allItems, status]);

    const pagination: PaginationResultDto = useMemo(
        () => ({
            totalAmountRecords: dcrData?.totalAmountRecords ?? 0,
            totalAmountPages: dcrData?.totalAmountPages ?? 0,
            currentPage: dcrData?.currentPage ?? paginated.page,
            recordsPerPage: dcrData?.recordsPerPage ?? paginated.recordsPerPage,
            pageIndex: dcrData?.pageIndex ?? 0,
        }),
        [dcrData, paginated.page, paginated.recordsPerPage]
    );

    const summary = useMemo(
        () => ({
            totalPeriods: items.length,
            totalBilledAmount: items.reduce((sum, item) => sum + (item.premiumDept ?? 0), 0),
            totalPaidAmount: items.reduce((sum, item) => sum + (item.premiumRecieve ?? 0), 0),
            paidPeriodCount: items.filter((item) => !!item.paymentType).length,
            unpaidPeriodCount: items.filter((item) => !item.paymentType).length,
        }),
        [items]
    );

    return {
        items,
        summary,
        isLoading,
        searchText,
        setSearchText: handleSearchTextChange,
        status,
        setStatus: handleStatusChange,
        pagination,
        setPaginated,
        // Total ท้ายตาราง — รวมจากรายการที่แสดงอยู่ (items หลังกรองสถานะ) เหมือน summary ด้านบน
        filteredTotalBilledAmount: summary.totalBilledAmount,
        filteredTotalPaidAmount: summary.totalPaidAmount,
    };
};

export default usePaymentHistoryTab;
