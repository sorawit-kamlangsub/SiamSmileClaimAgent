import { useState } from "react";
import { PaginationSortableDto, StandardDataTable } from "../../_common";
import useRefundApproveDataTableHook from "../hooks/RefundApproveDataTableHook";

const RefundApproveDataTable = () => {
    const [paginated, setPaginated] = useState<PaginationSortableDto>({
        page: 1,
        recordsPerPage: 5,
    });
    const { columns, dataMock } = useRefundApproveDataTableHook();
    return (
        <>
            <StandardDataTable
                name="refundApprove"
                columns={columns}
                data={dataMock ?? []}
                color="primary"
                paginated={paginated}
                setPaginated={setPaginated}
            />
        </>
    );
};

export default RefundApproveDataTable;
