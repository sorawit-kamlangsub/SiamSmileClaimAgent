import { useGetDashboardCustomerConsider } from "../../../../api/coreClaimApi";
import { AppliedFilter } from "./SearchFilterHook";

const useDashboardHook = (appliedFilter: AppliedFilter) => {
    const {
        data: dashboardData,
        isLoading: dashboardDataLoading,
        isError: dashboardDataError,
    } = useGetDashboardCustomerConsider(appliedFilter.dateType, appliedFilter.dateFrom, appliedFilter.dateTo);

    return { dashboardData, dashboardDataLoading, dashboardDataError };
};

export default useDashboardHook;
