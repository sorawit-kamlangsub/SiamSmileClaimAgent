import { useState } from "react";
import { Grid } from "@mui/material";
import BillingHospitalHeader from "../components/BillingHospitalMonitor/BillingHospitalHeader";
import BillingHospitalFilter from "../components/BillingHospitalMonitor/BillingHospitalFilter";
import BillingHospitalDataTable from "../components/BillingHospitalMonitor/BillingHospitalDataTable";
import useBillingSearchFilterHook, {
    getDefaultBillingFilter,
} from "../hooks/BillingHospitalMonitor/BillingSearchFilterHook";
import useBillingHospitalDataTableHook, {
    BillingAppliedFilter,
} from "../hooks/BillingHospitalMonitor/BillingHospitalDataTableHook";
import { BillingStatusId } from "../store/billingClaim.types";

/**
 * หน้า list "วางบิลเคลม - เคลมโรงพยาบาล" (billingClaimPage)
 *
 * เก็บ appliedFilter ไว้ที่หน้านี้ — formik อยู่ใน hook, กด "ค้นหา" จึง copy formik → appliedFilter
 * ตารางค่อย re-query ยกเว้น segmented status ที่เปลี่ยนตารางทันที (Handoff FE ข้อ 1 : "เปิดหน้ารายการ
 * → เรียก Filter" — สถานะ default คือ "รอตรวจสอบ")
 */
const BillingHospitalMonitorPage = () => {
    const { formik } = useBillingSearchFilterHook();
    const [appliedFilter, setAppliedFilter] = useState<BillingAppliedFilter>(getDefaultBillingFilter());

    const { column, rows, counts, isLoading, setPaginated, pagination } =
        useBillingHospitalDataTableHook(appliedFilter);

    const handleSearch = (override?: Partial<BillingAppliedFilter>) => {
        setAppliedFilter({
            searchBy: formik.values.searchBy,
            searchDetail: formik.values.searchDetail,
            statusId: formik.values.statusId,
            ...override,
        });
    };

    const handleClear = () => {
        formik.resetForm();
        setAppliedFilter(getDefaultBillingFilter());
    };

    const handleStatusChange = (statusId: BillingStatusId) => handleSearch({ statusId });

    return (
        <Grid container spacing={2} sx={{ py: 2 }}>
            <Grid item xs={12}>
                <BillingHospitalHeader counts={counts} isLoading={isLoading} />
            </Grid>
            <Grid item xs={12}>
                <BillingHospitalFilter
                    formik={formik}
                    onSearch={() => handleSearch()}
                    onClear={handleClear}
                    onStatusChange={handleStatusChange}
                />
            </Grid>
            <Grid item xs={12}>
                <BillingHospitalDataTable
                    column={column}
                    rows={rows}
                    isLoading={isLoading}
                    pagination={pagination}
                    setPaginated={setPaginated}
                />
            </Grid>
        </Grid>
    );
};

export default BillingHospitalMonitorPage;
