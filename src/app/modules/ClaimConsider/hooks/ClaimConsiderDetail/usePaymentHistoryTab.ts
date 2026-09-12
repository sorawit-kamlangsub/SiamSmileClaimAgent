import { useMemo, useState } from "react";
import { PaginationResultDto, PaginationSortableDto } from "../../../_common";
import { useGetDCR } from "../../../../api/coreClaimApi";

/**
 * ต่อ useGetDCR ของจริงแล้ว (src/app/api/coreClaimApi.ts) — ตารางใช้ข้อมูลจริงทั้งหมด
 *
 * คอนเฟิร์มกับ BA แล้วว่าตัดช่องค้นหา/กรองสถานะการชำระออกจาก tab นี้ ไม่ใช้ทั้งคู่
 *
 * summary (จำนวนงวด/ตั้งหนี้รวม/ชำระแล้วรวม/งวดที่ชำระแล้ว/งวดค้างชำระ) คำนวณจากรายการที่แสดง
 * ในตาราง (items ของหน้าปัจจุบัน) ไม่ใช่ยอดรวมข้ามทุกหน้า
 */
const usePaymentHistoryTab = (applicationCode?: string) => {
    const [paginated, setPaginated] = useState<PaginationSortableDto>({
        page: 1,
        recordsPerPage: 15,
    });

    const { data: dcrData, isLoading } = useGetDCR(
        applicationCode,
        undefined,
        paginated.orderingField,
        paginated.ascendingOrder,
        paginated.page,
        paginated.recordsPerPage
    );

    const items = useMemo(() => dcrData?.data ?? [], [dcrData]);

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
        pagination,
        setPaginated,
        // Total ท้ายตาราง — รวมจากรายการที่แสดงอยู่ (items ของหน้าปัจจุบัน) เหมือน summary ด้านบน
        filteredTotalBilledAmount: summary.totalBilledAmount,
        filteredTotalPaidAmount: summary.totalPaidAmount,
    };
};

export default usePaymentHistoryTab;
