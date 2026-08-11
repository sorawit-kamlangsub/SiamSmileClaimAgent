import { StandardDataTable } from "../../../_common";
import useDataTableConsiderCustomerHook from "../../hooks/ClaimConsiderCustomerMonitor/DataTableConsiderCustomer";

const ConsiderCustomerDataTable = () => {
    const { column, mockData } = useDataTableConsiderCustomerHook();
    return (
        <>
            <StandardDataTable
                name="dataTableConsiderCustomer"
                columns={column ?? []}
                data={mockData ?? []}
                color="primary"
            />
        </>
    );
};

export default ConsiderCustomerDataTable;
