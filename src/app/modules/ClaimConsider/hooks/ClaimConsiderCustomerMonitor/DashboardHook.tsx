import { useGetDashboardCustomerConsider } from "../../../../api/coreClaimApi";
import { AppliedFilter } from "./SearchFilterHook";

const useDashboardHook = (appliedFilter: AppliedFilter) => {
    const { data: dashboardData, isLoading: dashboardDataLoading } = useGetDashboardCustomerConsider(
        appliedFilter.dateType,
        appliedFilter.dateFrom,
        appliedFilter.dateTo
    );

    return { dashboardData, dashboardDataLoading };
};

export default useDashboardHook;
