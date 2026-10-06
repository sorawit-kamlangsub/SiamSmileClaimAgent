import { PaginationResultDto, PaginationSortableDto } from "../../../_common";
import { FundDisbursementFilterValues, FundDisbursementItem } from "../../store/fundDisbursement.types";

export type FundDisbursementListResult = {
    items: FundDisbursementItem[];
    /** จำนวนรายการรอวางบิล (การ์ดสรุป) */
    totalCount: number;
    /** จำนวนเงินรอวางบิล รวมทุกรายการที่ตรงเงื่อนไขค้นหา (การ์ดสรุป) — ไม่ใช่ผลรวมเฉพาะแถวที่เลือก */
    totalAmount: number;
    isLoading: boolean;
    pagination: PaginationResultDto;
};

/**
 * Adapter จุดเดียวที่รอ Backend — ยังไม่มี endpoint ตั้งเบิกกองทุนเลย (ไม่มี client method, ไม่มี DTO,
 * ไม่มีสถานะ "รอตั้งเบิก" ใน BILLING_STATUS) ดู docs/api-inventory.md หัวข้อ "Still no API for"
 *
 * TODO(PENDING_BE-fund-disbursement): คาดว่าจะเป็น GET /billing/fund/filter รับพารามิเตอร์ตรงกับ
 * `FundDisbursementFilterValues` (claimType/productId/branchId/userId/searchBy/searchDetail) +
 * pagination/sort แบบเดียวกับ `useGetHospitalBillingFilter` — เมื่อ BE พร้อม ให้แทนที่ implementation
 * นี้ด้วย `useQuery` + `HospitalBillingClient`/client ใหม่ตาม pattern `hospitalBillingApi.ts` แล้วลบ
 * `void filter; void pagination;` ทิ้ง (วันนี้ยังไม่ได้ใช้จริง ใส่ไว้ให้ signature พร้อมต่อ query ทันทีที่มี endpoint)
 */
const useFundDisbursementList = (
    filter: FundDisbursementFilterValues,
    pagination: PaginationSortableDto
): FundDisbursementListResult => {
    // เก็บ parameter ไว้ตาม signature ที่จะใช้จริงตอนต่อ query (ดู TODO ด้านบน) — ยังไม่ได้ใช้งานวันนี้
    void filter;
    void pagination;

    return {
        items: [],
        totalCount: 0,
        totalAmount: 0,
        isLoading: false,
        pagination: { totalAmountRecords: 0, totalAmountPages: 0, currentPage: 0, recordsPerPage: 0, pageIndex: 0 },
    };
};

export default useFundDisbursementList;
