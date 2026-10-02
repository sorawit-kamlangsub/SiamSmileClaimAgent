import { useParams } from "react-router-dom";
import { useGetClaimTransactionLog } from "../../../../api/coreClaimApi";
import { PaginationResultDto, PaginationSortableDto } from "../../../_common";
import { safeAtob } from "../../../../functionHelpers";
import { useMemo, useRef, useState } from "react";

const useClaimTransactionHook = () => {
    const { id } = useParams();
    const claimId = safeAtob(id);
    const [paginated, setPaginated] = useState<PaginationSortableDto>({
        page: 1,
        recordsPerPage: 10,
    });
    // ClaimDetailsTab ไม่ถูก unmount ตอนสลับไปดูอีกเคลม (เหมือนที่ ConsiderDetailHook.tsx แก้ไว้แล้ว)
    // ถ้าไม่รีเซ็ต page ตรงนี้ด้วย แท็บนี้จะค้าง page เดิมของเคลมก่อนหน้าข้ามไปเคลมใหม่
    const prevClaimIdRef = useRef(claimId);
    if (prevClaimIdRef.current !== claimId) {
        prevClaimIdRef.current = claimId;
        setPaginated({ page: 1, recordsPerPage: 10 });
    }
    const {
        data: transaction,
        isLoading: transactionLoading,
        isError: transactionError,
    } = useGetClaimTransactionLog(
        claimId ?? "",
        undefined,
        undefined,
        undefined,
        paginated.page,
        paginated.recordsPerPage
    );
    const pagination: PaginationResultDto = useMemo(
        () => ({
            totalAmountRecords: transaction?.totalAmountRecords ?? 0,
            totalAmountPages: transaction?.totalAmountPages ?? 0,
            currentPage: transaction?.currentPage ?? 0,
            recordsPerPage: transaction?.recordsPerPage ?? 0,
            pageIndex: transaction?.pageIndex ?? 0,
        }),
        [transaction]
    );
    return {
        transaction,
        transactionLoading,
        transactionError,
        pagination,
        setPaginated,
    };
};

export default useClaimTransactionHook;
