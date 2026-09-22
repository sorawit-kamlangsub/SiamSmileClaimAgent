import { ClaimFundStandardDataTable, NOT_FOUND_MESSAGE } from "../../_common";
import useClaimCpgTransferDataTableHook from "../hooks/ClaimDetailsDataTableHook";
import { ClaimSearchFilterValues } from "../_common/ClaimSearchFilterForm";

type ClaimDetailsDataTableProps = {
    filter: ClaimSearchFilterValues | undefined;
    hasSearched: boolean;
};

const ClaimDetailsDataTable = ({ filter, hasSearched }: ClaimDetailsDataTableProps) => {
    const { columns, data, isLoading, isError, error, pagination, setPaginated } = useClaimCpgTransferDataTableHook({
        filter,
        hasSearched,
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
