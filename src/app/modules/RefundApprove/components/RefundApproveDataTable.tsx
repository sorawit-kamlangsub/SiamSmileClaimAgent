import { ClaimFundStandardDataTable } from "../../_common";
import useRefundApproveDataTableHook from "../hooks/RefundApproveDataTableHook";
import { RefundSearchFilterValues } from "../../Refund/_common/RefundSearchFilterForm";

type RefundApproveDataTableProps = {
    filter: RefundSearchFilterValues | undefined;
    hasSearched: boolean;
    searchKey: number;
};

const RefundApproveDataTable = ({ filter, hasSearched, searchKey }: RefundApproveDataTableProps) => {
    const { columns, data, isLoading, pagination, setPaginated } = useRefundApproveDataTableHook({
        filter,
        hasSearched,
        searchKey,
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
                delayNoMatch={hasSearched}
            />
        </>
    );
};

export default RefundApproveDataTable;