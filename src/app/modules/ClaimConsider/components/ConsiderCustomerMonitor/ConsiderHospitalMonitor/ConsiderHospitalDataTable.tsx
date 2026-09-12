import { StandardDataTable } from "../../../../_common";
import useDataTableConsiderHospitalHook from "../../../hooks/ClaimConsiderCustomerMonitor/DataTableConsiderHospital";
import { AppliedFilter } from "../../../hooks/ClaimConsiderCustomerMonitor/SearchFilterHook";

const ConsiderHospitalDataTable = ({ appliedFilter }: { appliedFilter: AppliedFilter }) => {
    const { column, claimHospitalData, claimHospitalDataLoading, setPaginated, pagination } =
        useDataTableConsiderHospitalHook(appliedFilter);
    return (
        <>
            <StandardDataTable
                name="dataTableConsiderHospital"
                columns={column ?? []}
                data={claimHospitalData?.data ?? []}
                isLoading={claimHospitalDataLoading}
                color="primary"
                setPaginated={setPaginated}
                paginated={pagination}
                columnHeaderAlign="center"
            />
        </>
    );
};

export default ConsiderHospitalDataTable;
