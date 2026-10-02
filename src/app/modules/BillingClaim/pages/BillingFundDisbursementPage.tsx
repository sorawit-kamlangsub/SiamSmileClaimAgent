// ซ่อน UI เดิมของหน้า "ตั้งเบิกกองทุน" ไว้ชั่วคราว (2026-09-22) ตามที่ขอ — แสดงข้อความ
// "อยู่ระหว่างพัฒนาระบบ" แทน คอมเมนต์ทั้ง import และ logic เดิมไว้ (ไม่ลบไฟล์/ไม่ลบโค้ด) เพื่อเปิดกลับได้ทันที
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Grid } from "@mui/material";
import FundDisbursementHeader from "../components/BillingFundDisbursement/FundDisbursementHeader";
import FundDisbursementFilter from "../components/BillingFundDisbursement/FundDisbursementFilter";
import FundDisbursementDataTable from "../components/BillingFundDisbursement/FundDisbursementDataTable";
import useFundDisbursementFilterHook from "../hooks/BillingFundDisbursement/FundDisbursementFilterHook";
import useFundDisbursementDataTableHook from "../hooks/BillingFundDisbursement/FundDisbursementDataTableHook";
import {
    FundDisbursementFilterValues,
    getDefaultFundFilter,
    parseFundClaimType,
} from "../store/fundDisbursement.types";
import { useGetHospitalBillingClaimMonitor } from "../billingClaimHospitalApi";

/**
 * หน้า "ตั้งเบิกกองทุน" (`/billing/customers` — path คงเดิมตาม Compatibility Alias ของ handoff)
 *
 * ซ่อน UI เดิม (โครงหน้าตามสเปค รอต่อ API จริง) ไว้ชั่วคราว แสดง placeholder "อยู่ระหว่างพัฒนาระบบ" แทน
 */
const BillingFundDisbursementPage = () => {
    const [searchParams] = useSearchParams();
    const [rowsSelected, setRowsSelected] = useState<any[]>([]);
    const initialClaimType = parseFundClaimType(searchParams.get("claimType"));

    const { formik } = useFundDisbursementFilterHook(initialClaimType);
    const [appliedFilter, setAppliedFilter] = useState<FundDisbursementFilterValues>(
        getDefaultFundFilter(initialClaimType)
    );

    const {
        column,
        pagination,
        setPaginated,
        selectedIndexes,
        handleRowSelected,
        selectedCount,
        paginated,
        handleClearRowSelected,
    } = useFundDisbursementDataTableHook(appliedFilter.claimType, appliedFilter);

    const { data: getHospitalBillingClaimMonitorData, isLoading: isHospitalBillingClaimMonitorLoading } =
        useGetHospitalBillingClaimMonitor(
            formik.values.branchId,
            formik.values.userId,
            formik.values.claimType,
            formik.values.searchBy,
            formik.values.searchDetail,
            undefined,
            undefined,
            paginated.page,
            paginated.recordsPerPage,
            formik.values.isSearch
        );

    useEffect(() => {
        if (selectedIndexes) {
            const rows = selectedIndexes.map((rowIndex) => getHospitalBillingClaimMonitorData?.data?.[rowIndex]);
            setRowsSelected(rows);
        }

        return () => {};
    }, [selectedIndexes]);

    const totalCount = getHospitalBillingClaimMonitorData?.data?.length ?? 0;
    const totalAmount =
        getHospitalBillingClaimMonitorData?.data?.reduce((sum, item) => sum + (item?.billingAmount ?? 0), 0) ?? 0;
    const totalAmountSelected = rowsSelected.reduce((sum, item) => sum + (item?.billingAmount ?? 0), 0) ?? 0;

    const handleSearch = () => {
        formik.setFieldValue("isSearch", true);
        setAppliedFilter({ ...formik.values });
    };

    const handleClear = () => {
        formik.resetForm({ values: getDefaultFundFilter() });
        setAppliedFilter(getDefaultFundFilter());
        setRowsSelected([]);
        handleClearRowSelected();
    };

    return (
        <Grid container spacing={2} sx={{ py: 2 }}>
            <Grid item xs={12}>
                <FundDisbursementHeader
                    totalCount={totalCount}
                    totalAmount={totalAmount}
                    isLoading={isHospitalBillingClaimMonitorLoading}
                />
            </Grid>
            <Grid item xs={12}>
                <FundDisbursementFilter formik={formik} onSearch={handleSearch} onClear={handleClear} />
            </Grid>
            <Grid item xs={12}>
                <FundDisbursementDataTable
                    hasClaimType={!!appliedFilter.claimType}
                    column={column}
                    rows={getHospitalBillingClaimMonitorData?.data ?? []}
                    isLoading={isHospitalBillingClaimMonitorLoading}
                    pagination={pagination}
                    setPaginated={setPaginated}
                    selectedIndexes={selectedIndexes}
                    onRowSelected={handleRowSelected}
                    selectedCount={selectedCount}
                    selectedAmount={totalAmountSelected}
                    selectedData={rowsSelected}
                />
            </Grid>
        </Grid>
    );
};

export default BillingFundDisbursementPage;
