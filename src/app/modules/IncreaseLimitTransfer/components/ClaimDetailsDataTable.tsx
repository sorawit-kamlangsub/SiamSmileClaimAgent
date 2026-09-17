import { ClaimFundStandardDataTable, NOT_FOUND_MESSAGE } from "../../_common";
import useClaimCpgTransferDataTableHook, { IncreaseTransferMonitorRow } from "../hooks/ClaimDetailsDataTableHook";
import { ClaimSearchFilterValues } from "../_common/ClaimSearchFilterForm";

type ClaimDetailsDataTableProps = {
    filter: ClaimSearchFilterValues | undefined;
    hasSearched: boolean;
    searchKey: number;
    onEdit?: (row: IncreaseTransferMonitorRow) => void;
};

const ClaimDetailsDataTable = ({ filter, hasSearched, searchKey, onEdit }: ClaimDetailsDataTableProps) => {
    const { columns, data, isLoading, isError, error, pagination, setPaginated } = useClaimCpgTransferDataTableHook({
        filter,
        hasSearched,
        searchKey,
        onEdit,
    });

    return (
        <ClaimFundStandardDataTable
            name="cpgTransfer"
            title=""
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
    );
};

export default ClaimDetailsDataTable;
