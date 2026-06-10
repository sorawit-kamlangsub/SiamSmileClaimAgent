import React from "react";
import { Button, Collapse, Grid } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { FormikCheckbox, FormikTextField } from "../../../_common";
import SearchTypeDropDown from "../../../_common/components/ClaimAgent/CustomDropdown/SearchTypeDropDown";
import { useMonitorToolbarForm } from "../../hooks/Monitor/useMonitorToolbarForm";
import CustomPaper from "../../../_common/components/CustomComponent/CustomPaper";
import FormikDatePicker from "../../../_common/components/CustomFormik/FormikDatePicker";
import ProvinceDropdown from "../../../_common/components/ClaimAgent/CustomDropdown/ProvinceDropdown";

const MonitorToolbar: React.FC = () => {
    const { formik, handleClear } = useMonitorToolbarForm();
    const isAdvanced = formik.values.isAdvancedSearch;
    return (
        <CustomPaper>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={5} md={4} lg={3}>
                    <SearchTypeDropDown formik={formik} name="searchTypeId" />
                </Grid>
                <Grid item xs={12} sm={5} md={4} lg={4}>
                    <FormikTextField formik={formik} name="searchDetail" label="คำค้นหา" fullWidth />
                </Grid>
                <Grid item xs={12} sm={2} md={2} lg={1.5}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        startIcon={<SearchIcon />}
                        fullWidth
                        size="medium"
                        onClick={() => formik.submitForm()}
                    >
                        ค้นหา
                    </Button>
                </Grid>
                <Grid item xs={12} sm={2} md={2} lg={1.5}>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<ClearIcon />}
                        onClick={handleClear}
                        fullWidth
                        size="medium"
                    >
                        ล้างค่า
                    </Button>
                </Grid>
                <Grid item xs={12} sm={2} md={2} lg={2}>
                    <FormikCheckbox name="isAdvancedSearch" label="ค้นหาแบบละเอียด" formik={formik} />
                </Grid>
                {isAdvanced && (
                    <Grid item xs={12}>
                        <Collapse in={isAdvanced} unmountOnExit>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={5} md={4} lg={3}>
                                    <FormikDatePicker
                                        name="dateHappen"
                                        label="วันที่เกิดเหตุ"
                                        formik={formik}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12} sm={5} md={4} lg={3}>
                                    <ProvinceDropdown formik={formik} name="provinceId" fullWidth />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4} lg={4}>
                                    <FormikTextField formik={formik} name="school" label="โรงเรียน" fullWidth />
                                </Grid>
                            </Grid>
                        </Collapse>
                    </Grid>
                )}
            </Grid>
        </CustomPaper>
    );
};

export default MonitorToolbar;
