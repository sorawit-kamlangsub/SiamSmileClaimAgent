import { Box, Button, Grid, Typography } from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import SearchIcon from "@mui/icons-material/Search";
import FormikDatePicker from "../../_common/components/CustomFormik/FormikDatePicker";
import useSearchFilterHook from "../hooks/SearchFilterHook";
import { FormikDropdown, FormikTextField } from "../../_common";

const fieldLabelSx = { fontSize: "0.8rem", color: "#78909C", marginBottom: "4px" };

const SearchFilter = () => {
    const { formik, searchByTypeDropDownDataMock } = useSearchFilterHook();
    return (
        <Box
            component="form"
            onSubmit={formik.handleSubmit}
            sx={{
                border: "1px solid #E0E0E0",
                borderRadius: "12px",
                padding: "20px",
                backgroundColor: "#FFFFFF",
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <FilterAltIcon sx={{ color: "#1565C0", fontSize: 20 }} />
                <Typography sx={{ fontWeight: 700, color: "#212121" }}>ตัวกรองการค้นหา</Typography>
            </Box>

            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={2.4}>
                    <Typography sx={fieldLabelSx}>วันที่ส่งวางบิล</Typography>
                    <FormikDatePicker
                        formik={formik}
                        name="dateFrom"
                        format="DD/MM/YYYY"
                        label={""}
                        disableFuture
                        fullWidth
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={2.4}>
                    <Typography sx={fieldLabelSx}>ถึงวันที่</Typography>
                    <FormikDatePicker
                        formik={formik}
                        name="dateTo"
                        format="DD/MM/YYYY"
                        label={""}
                        disableFuture
                        fullWidth
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={2.4}>
                    <Typography sx={fieldLabelSx}>บริษัทประกัน</Typography>
                    <FormikDropdown
                        formik={formik}
                        label={""}
                        data={[]}
                        name="insuranceId"
                        displayFieldName=""
                        valueFieldName=""
                        firstItemText="ทั้งหมด"
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={2.4}>
                    <Typography sx={fieldLabelSx}>สถานะ</Typography>
                    <FormikDropdown
                        formik={formik}
                        label={""}
                        data={[]}
                        name="billingStatusId"
                        displayFieldName=""
                        valueFieldName=""
                        firstItemText="ทั้งหมด"
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={2.4}>
                    <Typography sx={fieldLabelSx}>สาขา</Typography>
                    <FormikDropdown
                        formik={formik}
                        label={""}
                        data={[]}
                        name="branchId"
                        displayFieldName=""
                        valueFieldName=""
                        firstItemText="ทั้งหมด"
                    />
                </Grid>

                <Grid item xs={12} sm={8} md={2.4}>
                    <FormikDropdown
                        formik={formik}
                        label={""}
                        data={searchByTypeDropDownDataMock ?? []}
                        name="searchByType"
                        displayFieldName="label"
                        valueFieldName="id"
                        firstItemText="ทั้งหมด"
                        defaultValue={1}
                    />
                </Grid>

                <Grid item xs={12} sm={8} md={9.2}>
                    <FormikTextField formik={formik} label={"คำค้นหา"} name="billingStatusId" />
                </Grid>

                <Grid item xs={12} sm={4} md={2.4}>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        startIcon={<SearchIcon />}
                        sx={{
                            backgroundColor: "#0D4C8C",
                            textTransform: "none",
                            height: "40px",
                            "&:hover": { backgroundColor: "#0A3D70" },
                        }}
                    >
                        ค้นหา
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
};

export default SearchFilter;
