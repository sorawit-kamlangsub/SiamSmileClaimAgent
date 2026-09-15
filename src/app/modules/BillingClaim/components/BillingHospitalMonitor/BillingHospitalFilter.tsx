import { Button, Grid, Icon, Paper } from "@mui/material";
import { FormikProps } from "formik";
import { FormikDropdown, FormikTextField } from "../../../_common";
import StatusFilterToggle from "../../../ClaimConsider/components/_common/StatusFilterToggle";
import { BillingSearchFilterValues } from "../../hooks/BillingHospitalMonitor/BillingSearchFilterHook";
import {
    BILLING_FILTER_STATUS_OPTIONS,
    BILLING_SEARCH_BY_OPTIONS,
    BillingStatusId,
} from "../../store/billingClaim.types";

type BillingHospitalFilterProps = {
    formik: FormikProps<BillingSearchFilterValues>;
    onSearch: () => void;
    onClear: () => void;
    /** เปลี่ยนสถานะรายการทันทีที่กด segmented control (ไม่ต้องกดค้นหาซ้ำ) */
    onStatusChange: (statusId: BillingStatusId) => void;
};

const BillingHospitalFilter = ({ formik, onSearch, onClear, onStatusChange }: BillingHospitalFilterProps) => {
    return (
        <Paper elevation={3} sx={{ p: 2 }}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={2} lg={2}>
                    <FormikDropdown
                        formik={formik}
                        name="searchBy"
                        data={BILLING_SEARCH_BY_OPTIONS}
                        label="ค้นหาจาก"
                        displayFieldName="label"
                        valueFieldName="value"
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={6} lg={7}>
                    <FormikTextField
                        formik={formik}
                        name="searchDetail"
                        label="คำค้นหา"
                        placeholder="ระบุคำค้นหา"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") onSearch();
                        }}
                    />
                </Grid>
                <Grid item xs={6} sm={3} md={2} lg={1.5} sx={{ display: "flex", alignItems: "center", px: 1 }}>
                    <Button variant="contained" fullWidth onClick={onSearch}>
                        <Icon>search</Icon>
                        &nbsp; ค้นหา
                    </Button>
                </Grid>
                <Grid item xs={6} sm={3} md={2} lg={1.5} sx={{ display: "flex", alignItems: "center", px: 1 }}>
                    <Button
                        variant="outlined"
                        fullWidth
                        onClick={onClear}
                        sx={{ borderColor: "#BF360C", color: "#870000", ":hover": { borderColor: "#BF360C" } }}
                    >
                        ล้างค่า
                    </Button>
                </Grid>
                <Grid item xs={12}>
                    <StatusFilterToggle
                        formik={formik}
                        name="statusId"
                        label="สถานะรายการ"
                        options={BILLING_FILTER_STATUS_OPTIONS}
                        onAfterChange={(value) => onStatusChange(value as BillingStatusId)}
                    />
                </Grid>
            </Grid>
        </Paper>
    );
};

export default BillingHospitalFilter;
