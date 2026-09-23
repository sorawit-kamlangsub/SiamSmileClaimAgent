import { Box, Typography } from "@mui/material";
import EngineeringIcon from "@mui/icons-material/Engineering";
// ซ่อน UI เดิมของหน้า "ตั้งเบิกกองทุน" ไว้ชั่วคราว (2026-09-22) ตามที่ขอ — แสดงข้อความ
// "อยู่ระหว่างพัฒนาระบบ" แทน คอมเมนต์ทั้ง import และ logic เดิมไว้ (ไม่ลบไฟล์/ไม่ลบโค้ด) เพื่อเปิดกลับได้ทันที
// import { useState } from "react";
// import { useSearchParams } from "react-router-dom";
// import { Grid } from "@mui/material";
// import FundDisbursementHeader from "../components/BillingFundDisbursement/FundDisbursementHeader";
// import FundDisbursementFilter from "../components/BillingFundDisbursement/FundDisbursementFilter";
// import FundDisbursementDataTable from "../components/BillingFundDisbursement/FundDisbursementDataTable";
// import useFundDisbursementFilterHook from "../hooks/BillingFundDisbursement/FundDisbursementFilterHook";
// import useFundDisbursementDataTableHook from "../hooks/BillingFundDisbursement/FundDisbursementDataTableHook";
// import {
//     FundDisbursementFilterValues,
//     getDefaultFundFilter,
//     parseFundClaimType,
// } from "../store/fundDisbursement.types";

/**
 * หน้า "ตั้งเบิกกองทุน" (`/billing/customers` — path คงเดิมตาม Compatibility Alias ของ handoff)
 *
 * ซ่อน UI เดิม (โครงหน้าตามสเปค รอต่อ API จริง) ไว้ชั่วคราว แสดง placeholder "อยู่ระหว่างพัฒนาระบบ" แทน
 */
const BillingFundDisbursementPage = () => {
    // const [searchParams] = useSearchParams();
    // const initialClaimType = parseFundClaimType(searchParams.get("claimType"));

    // const { formik } = useFundDisbursementFilterHook(initialClaimType);
    // const [appliedFilter, setAppliedFilter] = useState<FundDisbursementFilterValues>(
    //     getDefaultFundFilter(initialClaimType)
    // );

    // const {
    //     column,
    //     rows,
    //     totalCount,
    //     totalAmount,
    //     isLoading,
    //     pagination,
    //     setPaginated,
    //     selectedIndexes,
    //     handleRowSelected,
    //     selectedCount,
    //     selectedAmount,
    // } = useFundDisbursementDataTableHook(appliedFilter.claimType, appliedFilter);

    // const handleSearch = () => setAppliedFilter({ ...formik.values });

    // const handleClear = () => {
    //     formik.resetForm({ values: getDefaultFundFilter() });
    //     setAppliedFilter(getDefaultFundFilter());
    // };

    // return (
    //     <Grid container spacing={2} sx={{ py: 2 }}>
    //         <Grid item xs={12}>
    //             <FundDisbursementHeader totalCount={totalCount} totalAmount={totalAmount} isLoading={isLoading} />
    //         </Grid>
    //         <Grid item xs={12}>
    //             <FundDisbursementFilter formik={formik} onSearch={handleSearch} onClear={handleClear} />
    //         </Grid>
    //         <Grid item xs={12}>
    //             <FundDisbursementDataTable
    //                 hasClaimType={!!appliedFilter.claimType}
    //                 column={column}
    //                 rows={rows}
    //                 isLoading={isLoading}
    //                 pagination={pagination}
    //                 setPaginated={setPaginated}
    //                 selectedIndexes={selectedIndexes}
    //                 onRowSelected={handleRowSelected}
    //                 selectedCount={selectedCount}
    //                 selectedAmount={selectedAmount}
    //             />
    //         </Grid>
    //     </Grid>
    // );

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                py: "6rem",
            }}
        >
            <EngineeringIcon sx={{ fontSize: 72, color: "primary.main", mb: 2 }} />
            <Typography variant="h5" fontWeight={700} gutterBottom>
                อยู่ระหว่างพัฒนาระบบ
            </Typography>
            <Typography variant="body1" color="text.secondary">
                ขออภัยในความไม่สะดวก หน้านี้อยู่ระหว่างการพัฒนา กรุณากลับมาใหม่อีกครั้ง
            </Typography>
        </Box>
    );
};

export default BillingFundDisbursementPage;
