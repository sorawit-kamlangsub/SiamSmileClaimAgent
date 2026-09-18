import { ClaimFundStandardDataTable, NOT_FOUND_MESSAGE } from "../../_common";
import useRefundApproveDataTableHook, { RefundApproveMonitorRow } from "../hooks/RefundApproveDataTableHook";
import { RefundSearchFilterValues } from "../../Refund/_common/RefundSearchFilterForm";

type RefundApproveDataTableProps = {
    filter: RefundSearchFilterValues | undefined;
    hasSearched: boolean;
    searchKey: number;
    onEdit?: (row: RefundApproveMonitorRow) => void;
    onView?: (row: RefundApproveMonitorRow) => void;
};

const RefundApproveDataTable = ({ filter, hasSearched, searchKey, onEdit, onView }: RefundApproveDataTableProps) => {
    const { columns, data, isLoading, isError, error, pagination, setPaginated } = useRefundApproveDataTableHook({
        filter,
        hasSearched,
        searchKey,
        onEdit,
        onView,
    });
    return (
        <>
            <ClaimFundStandardDataTable
                name="refundApprove"
                columns={columns}
                data={data ?? []}
                color="primary"
                paginated={pagination}
                setPaginated={setPaginated}
                isLoading={hasSearched ? isLoading : false}
                isError={hasSearched ? isError : false}
                error={error}
                noMatchText={NOT_FOUND_MESSAGE}
                delayNoMatch={false}
            />
        </>
    );
};

export default RefundApproveDataTable;