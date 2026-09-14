import { Alert } from "@mui/material";
import { StandardDataTable } from "../../../_common";
import useDataTableConsiderCustomerHook from "../../hooks/ClaimConsiderCustomerMonitor/DataTableConsiderCustomer";
import { AppliedFilter } from "../../hooks/ClaimConsiderCustomerMonitor/SearchFilterHook";

const ConsiderCustomerDataTable = ({ appliedFilter }: { appliedFilter: AppliedFilter }) => {
    const {
        column,
        claimTransactionData,
        claimTransactionDataLoading,
        claimTransactionDataError,
        setPaginated,
        pagination,
    } = useDataTableConsiderCustomerHook(appliedFilter);
    return (
        <>
            {claimTransactionDataError && (
                <Alert severity="error" variant="outlined" sx={{ mb: 2 }}>
                    ไม่สามารถโหลดรายการเคลมได้ กรุณาลองใหม่อีกครั้ง
                </Alert>
            )}
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
