import { StandardDataTable } from "../../../_common";
import useDataTableConsiderCustomerHook from "../../hooks/ClaimConsiderCustomerMonitor/DataTableConsiderCustomer";
import { AppliedFilter } from "../../hooks/ClaimConsiderCustomerMonitor/SearchFilterHook";

const ConsiderCustomerDataTable = ({ appliedFilter }: { appliedFilter: AppliedFilter }) => {
    const { column, claimTransactionData, claimTransactionDataLoading, setPaginated, pagination } =
        useDataTableConsiderCustomerHook(appliedFilter);
    return (
        <>
            <StandardDataTable
                name="dataTableConsiderCustomer"
                columns={column ?? []}
                data={claimTransactionData?.data ?? []}
                isLoading={claimTransactionDataLoading}
                color="primary"
                setPaginated={setPaginated}
                paginated={pagination}
                columnHeaderAlign="center"
            />
        </>
    );
};

export default ConsiderCustomerDataTable;
