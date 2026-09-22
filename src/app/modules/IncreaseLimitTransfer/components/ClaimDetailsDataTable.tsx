import { ClaimFundStandardDataTable, NOT_FOUND_MESSAGE } from "../../_common";
import useClaimCpgTransferDataTableHook, { IncreaseTransferMonitorRow } from "../hooks/ClaimDetailsDataTableHook";
import { ClaimSearchFilterValues } from "../_common/ClaimSearchFilterForm";

type ClaimDetailsDataTableProps = {
    filter: ClaimSearchFilterValues | undefined;
    hasSearched: boolean;
    onEdit?: (row: IncreaseTransferMonitorRow) => void;
};

const ClaimDetailsDataTable = ({ filter, hasSearched, onEdit }: ClaimDetailsDataTableProps) => {
    const { columns, data, isLoading, isError, error, pagination, setPaginated } = useClaimCpgTransferDataTableHook({
        filter,
        hasSearched,
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
