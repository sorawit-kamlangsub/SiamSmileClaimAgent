import { Grid } from "@mui/material";
import { useState } from "react";
import dayjs from "dayjs";
import useDeathDisabilityDashboardHook from "../hooks/ClaimConsiderDeathDisabilityMonitor/DeathDisabilityDashboardHook";
import ConsiderDeathDisabilityHeader from "../components/ConsiderDeathDisabilityMonitor/ConsiderDeathDisabilityHeader";
import ConsiderDeathDisabilityMonitorFilter from "../components/ConsiderDeathDisabilityMonitor/ConsiderDeathDisabilityMonitorFilter";
import ConsiderDeathDisabilityDataTable from "../components/ConsiderDeathDisabilityMonitor/ConsiderDeathDisabilityDataTable";
import useSearchFilterHook, {
    AppliedFilter,
    getDefaultSearchFilter,
} from "../hooks/ClaimConsiderCustomerMonitor/SearchFilterHook";

/** หน้ารายละเอียดอยู่ที่ path ลูก ":id/:caseId" ของหน้านี้เอง — ใช้ "." ให้ navigate แบบ relative */
const DETAIL_PATH = ".";

/**
 * ตาม spec: ตัวเลือกสถานะของหน้านี้กำหนดตายตัว (ลำดับ + ชื่อ) ไม่ดึงจาก master เพราะ master มีสถานะเกิน
 * (รอเอกสาร(3), รอตรวจสอบการแก้ไข(8)) และใช้ชื่อ "อยู่ระหว่างดำเนินการ" แทน "อยู่ระหว่างทำรายการ"
 */
const STATUS_OPTIONS = [
    { value: 0, label: "ทั้งหมด" },
    { value: 2, label: "รอพิจารณา" },
    { value: 7, label: "อยู่ระหว่างทำรายการ" },
    { value: 4, label: "รอแก้ไข" },
    { value: 5, label: "ปฏิเสธ" },
    { value: 6, label: "ยกเลิก" },
    { value: 9, label: "อนุมัติ" },
];

const getInitialAppliedFilter = (): AppliedFilter => ({
    ...getDefaultSearchFilter(dayjs()),
    dateFrom: dayjs(),
    dateTo: dayjs(),
    isSearch: true,
    path: DETAIL_PATH,
});

const ConsiderDeathDisabilityMonitorPage = () => {
    const { formik } = useSearchFilterHook();
    const [appliedFilter, setAppliedFilter] = useState<AppliedFilter>(getInitialAppliedFilter);
    const { dashboardData, dashboardDataLoading, dashboardDataError } = useDeathDisabilityDashboardHook(appliedFilter);

    const handleSearch = () => {
        setAppliedFilter({
            isSearch: true,
            dateType: formik.values.dateType,
            dateFrom: formik.values.dateFrom ?? appliedFilter.dateFrom,
            dateTo: formik.values.dateTo ?? appliedFilter.dateTo,
            product: formik.values.product,
            searchFrom: formik.values.searchFrom,
            searchDetail: formik.values.searchDetail,
            statusId: formik.values.statusId,
            path: DETAIL_PATH,
        });
    };
    const handleClear = () => {
        formik.resetForm();
        setAppliedFilter(getInitialAppliedFilter());
    };

    return (
        <Grid container spacing={2} sx={{ py: 2 }}>
            <Grid item xs={12}>
                <ConsiderDeathDisabilityHeader
                    dashboardData={dashboardData}
                    dashboardDataLoading={dashboardDataLoading}
                    dashboardDataError={dashboardDataError}
                />
            </Grid>
            <Grid item xs={12} sx={{ py: 2 }}>
                <ConsiderDeathDisabilityMonitorFilter
                    formik={formik}
                    statusOptions={STATUS_OPTIONS}
                    onSearch={handleSearch}
                    onClear={handleClear}
                />
            </Grid>
            <Grid item xs={12} sx={{ py: 2 }}>
                <ConsiderDeathDisabilityDataTable appliedFilter={appliedFilter} />
            </Grid>
        </Grid>
    );
};

export default ConsiderDeathDisabilityMonitorPage;
