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
 * ตาม spec: สถานะของหน้านี้มีแค่ รอพิจารณา(2)/อยู่ระหว่างดำเนินการ(7)/รอแก้ไข(4)/รอตรวจสอบการแก้ไข(8)/ปฏิเสธ(5)/ยกเลิก(6)/อนุมัติ(9)
 * รอตรวจสอบการแก้ไข = ส่งพิจารณาอีกครั้งหลังแก้ไขเรียบร้อย
 * ชื่อสถานะดึงจาก master ClaimTransactionType — ตัด รอเอกสาร(3) ออก
 * ประกาศนอก component ให้ reference คงที่ (อยู่ใน deps ของ useMemo ใน useSearchFilterHook)
 */
const INCLUDED_STATUS_IDS = [2, 7, 4, 8, 5, 6, 9];

const getInitialAppliedFilter = (): AppliedFilter => ({
    ...getDefaultSearchFilter(dayjs()),
    dateFrom: dayjs(),
    dateTo: dayjs(),
    isSearch: true,
    path: DETAIL_PATH,
});

const ConsiderDeathDisabilityMonitorPage = () => {
    const { formik, statusOptions, claimTransactionTypeDataLoading } = useSearchFilterHook({
        includedStatusIds: INCLUDED_STATUS_IDS,
    });
    const [appliedFilter, setAppliedFilter] = useState<AppliedFilter>(getInitialAppliedFilter);
    const { dashboardData, dashboardDataLoading, dashboardDataError } = useDeathDisabilityDashboardHook(appliedFilter);

    const handleSearch = async () => {
        // ถึงวันที่ < จากวันที่ → โชว์ error ที่ช่องแล้วไม่ค้นหา
        const errors = await formik.validateForm();
        if (Object.keys(errors).length > 0) {
            formik.setTouched({ dateFrom: true, dateTo: true }, false);
            return;
        }
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
                    statusOptions={statusOptions}
                    claimTransactionTypeDataLoading={claimTransactionTypeDataLoading}
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
