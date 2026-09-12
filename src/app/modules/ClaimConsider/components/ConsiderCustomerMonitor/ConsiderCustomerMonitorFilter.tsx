import { useMemo } from "react";
import { Button, Grid, Icon, Paper } from "@mui/material";
import useSearchFilterHook, { SearchFilterType } from "../../hooks/ClaimConsiderCustomerMonitor/SearchFilterHook";
import { FormikCheckboxGroup, FormikDropdown, FormikTextField } from "../../../_common";
import {
    defaultDateTypeOptions,
    defaultToggleButtonOptions,
    getSearchFromOptions,
    productMultipleSelectData,
} from "../_common/Constant/ConstantValues";
import FormikDatePicker from "../../../_common/components/CustomFormik/FormikDatePicker";
import StatusFilterToggle from "../_common/StatusFilterToggle";
import { FormikProps } from "formik";
type ConsiderCustomerMonitorFilterProps = {
    formik: FormikProps<SearchFilterType>;
    statusOptions: ReturnType<typeof useSearchFilterHook>["statusOptions"];
    claimTransactionTypeDataLoading: boolean;
    onSearch: () => void;
    onClear: () => void;
    isHospital?: boolean;
};

const ConsiderCustomerMonitorFilter = ({
    formik,
    statusOptions,
    claimTransactionTypeDataLoading,
    onSearch,
    onClear,
    isHospital,
}: ConsiderCustomerMonitorFilterProps) => {
    const searchFromOptions = useMemo(() => getSearchFromOptions(isHospital), [isHospital]);

    return (
        <>
            <Paper elevation={3} sx={{ p: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={6} sm={6} md={2} lg={2}>
                        <FormikDropdown
                            formik={formik}
                            name="dateType"
                            label="ประเภทวันที่"
                            data={defaultDateTypeOptions}
                            displayFieldName="label"
                            valueFieldName="value"
                            firstItemText=""
                            disableFirstItem
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={6} sm={6} md={2} lg={2}>
                        <FormikDatePicker formik={formik} name="dateFrom" label="จากวันที่" disableFuture />
                    </Grid>
                    <Grid item xs={6} sm={6} md={2} lg={2}>
                        <FormikDatePicker formik={formik} name="dateTo" label="ถึงวันที่" disableFuture />
                    </Grid>
                    <Grid item xs={6} sm={6} md={2} lg={2}>
                        <FormikCheckboxGroup
                            formik={formik}
                            name="product"
                            label="ผลิตภัณฑ์"
                            data={productMultipleSelectData ?? []}
                            displayFieldName="label"
                            valueFieldName="value"
                            fullWidth
                            row
                        />
                    </Grid>
                    <Grid item xs={6} sm={6} md={2} lg={2} sx={{ display: "flex", alignItems: "center", px: 1 }}>
                        <Button variant="contained" fullWidth onClick={onSearch}>
                            <Icon>search</Icon>
                            &nbsp; ค้นหา
                        </Button>
                    </Grid>
                    <Grid item xs={6} sm={6} md={2} lg={2} sx={{ display: "flex", alignItems: "center", px: 1 }}>
                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={onClear}
                            sx={{
                                borderColor: "#BF360C",
                                color: "#870000",
                                ":hover": {
                                    borderColor: "#BF360C",
                                },
                            }}
                        >
                            ล้างค่า
                        </Button>
                    </Grid>
                    <Grid item xs={6} sm={6} md={2} lg={2}>
                        <FormikDropdown
                            formik={formik}
                            name="searchFrom"
                            data={searchFromOptions}
                            label="ค้นหาจาก"
                            displayFieldName="label"
                            valueFieldName="value"
                            firstItemText="---เลือก---"
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={6} sm={6} md={10} lg={10}>
                        <FormikTextField formik={formik} name="searchDetail" label="คำค้นหา" />
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={12}>
                        <StatusFilterToggle
                            formik={formik}
                            label="สถานะรายการ"
                            name="statusId"
                            options={statusOptions ?? defaultToggleButtonOptions}
                            disabled={claimTransactionTypeDataLoading}
                        />
                    </Grid>
                </Grid>
            </Paper>
        </>
    );
};

export default ConsiderCustomerMonitorFilter;
