import { useGetDashboardDeathAndDisabilityClaimConsider } from "../../../../api/coreClaimApi";
import { AppliedFilter } from "../ClaimConsiderCustomerMonitor/SearchFilterHook";

const useDeathDisabilityDashboardHook = (appliedFilter: AppliedFilter) => {
    const {
        data: dashboardData,
        isLoading: dashboardDataLoading,
        isError: dashboardDataError,
    } = useGetDashboardDeathAndDisabilityClaimConsider(appliedFilter.dateFrom, appliedFilter.dateTo);

    return { dashboardData, dashboardDataLoading, dashboardDataError };
};

export default useDeathDisabilityDashboardHook;
