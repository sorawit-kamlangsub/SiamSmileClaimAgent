import { Grid } from "@mui/material";
import ConsiderCustomerHeader from "../components/ConsiderCustomerMonitor/ConsiderCustomerHeader";
import ConsiderCustomerMonitorFilter from "../components/ConsiderCustomerMonitor/ConsiderCustomerMonitorFilter";
import ConsiderCustomerDataTable from "../components/ConsiderCustomerMonitor/ConsiderCustomerDataTable";
import useSearchFilterHook, {
    AppliedFilter,
    getDefaultSearchFilter,
} from "../hooks/ClaimConsiderCustomerMonitor/SearchFilterHook";
import useDashboardHook from "../hooks/ClaimConsiderCustomerMonitor/DashboardHook";
import { useState } from "react";
import dayjs from "dayjs";

const ConsiderMonitorPage = () => {
    const { formik, statusOptions, claimTransactionTypeDataLoading } = useSearchFilterHook();
    const [appliedFilter, setAppliedFilter] = useState<AppliedFilter>({
        ...getDefaultSearchFilter(dayjs()),
        dateFrom: dayjs(),
        dateTo: dayjs(),
        isSearch: true,
        path: "customers",
    });
    const { dashboardData, dashboardDataLoading } = useDashboardHook(appliedFilter);
    const handleSearch = () => {
        setAppliedFilter({
            isSearch: true,
            dateType: formik.values.dateType,
            dateFrom: formik.values.dateFrom ?? undefined,
            dateTo: formik.values.dateTo ?? undefined,
            product: formik.values.product,
            searchFrom: formik.values.searchFrom,
            searchDetail: formik.values.searchDetail,
            statusId: formik.values.statusId,
            path: "customers",
        });
    };
    const handleClear = () => {
        formik.resetForm();
        setAppliedFilter({
            isSearch: true,
            dateType: 1,
            dateFrom: dayjs(),
            dateTo: dayjs(),
            product: [],
            searchFrom: undefined,
            searchDetail: "",
            statusId: 0,
            path: "customers",
        });
    };
    return (
        <>
            <Grid container spacing={2} sx={{ py: 2 }}>
                <Grid item xs={12} sm={12} md={12} lg={12}>
                    <ConsiderCustomerHeader dashboardData={dashboardData} dashboardDataLoading={dashboardDataLoading} />
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} sx={{ py: 2 }}>
                    <ConsiderCustomerMonitorFilter
                        formik={formik}
                        statusOptions={statusOptions}
                        onSearch={handleSearch}
                        claimTransactionTypeDataLoading={claimTransactionTypeDataLoading}
                        onClear={handleClear}
                    />
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} sx={{ py: 2 }}>
                    <ConsiderCustomerDataTable appliedFilter={appliedFilter} />
                </Grid>
            </Grid>
        </>
    );
};

export default ConsiderMonitorPage;
