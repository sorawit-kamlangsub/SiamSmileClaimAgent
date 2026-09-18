import { StandardDataTable } from "../../../_common";
import useDataTableConsiderDeathDisabilityHook from "../../hooks/ClaimConsiderDeathDisabilityMonitor/DataTableConsiderDeathDisability";
import { AppliedFilter } from "../../hooks/ClaimConsiderCustomerMonitor/SearchFilterHook";

const ConsiderDeathDisabilityDataTable = ({ appliedFilter }: { appliedFilter: AppliedFilter }) => {
    const { column, rows, isLoading, setPaginated, pagination } =
        useDataTableConsiderDeathDisabilityHook(appliedFilter);
    return (
        <StandardDataTable
            name="dataTableConsiderDeathDisability"
            columns={column}
            data={rows}
            isLoading={isLoading}
            color="primary"
            setPaginated={setPaginated}
            paginated={pagination}
            columnHeaderAlign="center"
        />
    );
};

export default ConsiderDeathDisabilityDataTable;
