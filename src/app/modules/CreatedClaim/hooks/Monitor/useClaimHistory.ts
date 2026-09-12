import { useState, useMemo } from "react";
import { useGetCaseByClaimId, useGetClaimHistory } from "../../../../api/coreClaimApi";
import { monitorSelector } from "../../store/monitorSlice";
import { useAppSelector } from "../../../../../redux";
import { PaginationResultDto, PaginationSortableDto } from "../../../_common";

export const useClaimHistory = (appIdFromProp?: string, claimId?: string) => {
    const { selectedPolicy } = useAppSelector(monitorSelector);
    const appId = selectedPolicy?.appId === undefined ? appIdFromProp : selectedPolicy.appId;
    const [paginated, setPaginated] = useState<PaginationSortableDto>({
        page: 1,
        recordsPerPage: 10,
    });
    const { data: claimHistoryData, isLoading: claimHistoryisLoading } = useGetClaimHistory(
        appId,
        undefined,
        undefined,
        undefined,
        paginated.page,
        paginated.recordsPerPage
    );
    const { data: caseData, isLoading: caseDataisLoading } = useGetCaseByClaimId(
        claimId,
        undefined,
        undefined,
        undefined,
        paginated.page,
        paginated.recordsPerPage
    );
    const pagination: PaginationResultDto = useMemo(
        () => ({
            totalAmountRecords: claimHistoryData?.totalAmountRecords ?? 0,
            totalAmountPages: claimHistoryData?.totalAmountPages ?? 0,
            currentPage: claimHistoryData?.currentPage ?? paginated.page,
            // ห้ามให้เป็น 0 (backend ส่ง recordsPerPage: 0 มาจริง ๆ ตอนไม่มีข้อมูล ไม่ใช่ null/undefined
            // เลยต้องเช็ค falsy ด้วย || ไม่ใช่ ??): rowsPerPage=0 ทำให้ mui-datatables คำนวณ
            // Math.ceil(count/0) = NaN แล้ว "page >= NaN" เป็น false เสมอ ปุ่มเปลี่ยนหน้าเลยกดได้แม้ไม่มีข้อมูล
            recordsPerPage: claimHistoryData?.recordsPerPage || paginated.recordsPerPage,
            pageIndex: claimHistoryData?.pageIndex ?? 0,
        }),
        [claimHistoryData, paginated.page, paginated.recordsPerPage]
    );

    return {
        claimHistoryData,
        caseData,
        setPaginated,
        pagination,
        claimHistoryisLoading,
        caseDataisLoading,
    };
};
