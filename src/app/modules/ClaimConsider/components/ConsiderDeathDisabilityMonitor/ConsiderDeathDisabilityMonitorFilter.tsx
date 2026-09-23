import { Button, Grid, Icon, Paper } from "@mui/material";
import { FormikProps } from "formik";
import { FormikCheckboxGroup } from "../../../_common";
import FormikDatePicker from "../../../_common/components/CustomFormik/FormikDatePicker";
import { SearchFilterType } from "../../hooks/ClaimConsiderCustomerMonitor/SearchFilterHook";
import { productMultipleSelectData } from "../_common/Constant/ConstantValues";
import StatusFilterToggle from "../_common/StatusFilterToggle";

type ConsiderDeathDisabilityMonitorFilterProps = {
    formik: FormikProps<SearchFilterType>;
    statusOptions: { value: number; label: string }[];
    claimTransactionTypeDataLoading?: boolean;
    onSearch: () => void;
    onClear: () => void;
};

const ConsiderDeathDisabilityMonitorFilter = ({
    formik,
    statusOptions,
    claimTransactionTypeDataLoading,
    onSearch,
    onClear,
}: ConsiderDeathDisabilityMonitorFilterProps) => (
    <Paper elevation={3} sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={6} md={2}>
                <FormikDatePicker formik={formik} name="dateFrom" label="จากวันที่แจ้งเคลม" disableFuture required />
            </Grid>
            <Grid item xs={6} md={2}>
                <FormikDatePicker
                    formik={formik}
                    name="dateTo"
                    label="ถึงวันที่แจ้งเคลม"
                    minDate={formik.values.dateFrom ?? undefined}
                    disableFuture
                    required
                />
            </Grid>
            <Grid item xs={12} md={2}>
                <FormikCheckboxGroup
                    formik={formik}
                    name="product"
                    data={productMultipleSelectData}
                    displayFieldName="label"
                    valueFieldName="value"
                    fullWidth
                    row
                />
            </Grid>
            <Grid item xs={6} md={2}>
                <Button variant="contained" fullWidth onClick={onSearch}>
                    <Icon>search</Icon>
                    &nbsp; ค้นหา
                </Button>
            </Grid>
            <Grid item xs={6} md={2}>
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
                    label="สถานะรายการ"
                    name="statusId"
                    options={statusOptions}
                    disabled={claimTransactionTypeDataLoading}
                />
            </Grid>
        </Grid>
    </Paper>
);

export default ConsiderDeathDisabilityMonitorFilter;
