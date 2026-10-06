import { Box, Button, Grid, IconButton, Typography } from "@mui/material";
import { FormikProps } from "formik";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import { FormikDropdown, FormikTextField } from "../../../_common";
import { ClearIcon } from "@mui/x-date-pickers";
import SearchIcon from "@mui/icons-material/Search";
import FormikDatePicker from "../../../_common/components/CustomFormik/FormikDatePicker";

type SearchTransferByStatusProps = {
    formik: FormikProps<any>;
};

export const statusMock = [
    { id: 1, label: "รอสร้างรายการ" },
    { id: 2, label: "รอโอน" },
    { id: 3, label: "โอนสำเร็จ" },
    { id: 5, label: "โอนไม่สำเร็จ" },
];

const emailStatus = [
    { id: 1, label: "รอส่ง" },
    { id: 2, label: "ส่งสำเร็จ" },
    { id: 3, label: "ส่งไม่สำเร็จ" },
];

const SearchTransferByStatus = ({ formik }: SearchTransferByStatusProps) => {
    return (
        <>
            <Box
                sx={{
                    border: "1px solid #E0E0E0",
                    borderRadius: "12px",
                    backgroundColor: "#FFFFFF",
                    padding: "20px 24px",
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                    <FilterAltOutlinedIcon sx={{ color: "#1565C0", fontSize: 20 }} />
                    <Typography sx={{ fontWeight: 700, color: "#1565C0" }}>ค้นหาสถานพยาบาล</Typography>
                </Box>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={12} md={2} lg={2}>
                        <FormikDropdown
                            formik={formik}
                            name="statusId"
                            label="สถานะ"
                            valueFieldName="id"
                            displayFieldName="label"
                            data={statusMock ?? []}
                            fullWidth
                            firstItemText="กรุณาเลือก"
                        />
                    </Grid>
                    {formik.values.statusId == 1 || formik.values.statusId == 2 ? (
                        <Grid item xs={12} sm={12} md={10} lg={10}>
                            <Grid container spacing={2} alignItems="flex-end">
                                <Grid item xs={12} sm={12} md={9} lg={9}>
                                    <FormikTextField
                                        formik={formik}
                                        label="ชื่อสถานพยาบาล"
                                        fullWidth
                                        size="small"
                                        name="searchDetail"
                                        placeholder="ค้นหาด้วยชื่อสถานพยาบาล"
                                        InputProps={{
                                            endAdornment: formik.values.searchDetail ? (
                                                <IconButton
                                                    size="small"
                                                    aria-label="ล้างคำค้นหา"
                                                    onClick={() => formik.setFieldValue("searchDetail", "")}
                                                >
                                                    <ClearIcon fontSize="small" />
                                                </IconButton>
                                            ) : undefined,
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={12} md={3} lg={3} sx={{ pb: 0.7 }}>
                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        startIcon={<SearchIcon />}
                                        sx={{
                                            backgroundColor: "#0D4C8C",
                                            borderRadius: 3,
                                            textTransform: "none",
                                            height: "40px",
                                            "&:hover": { backgroundColor: "#0A3D70" },
                                        }}
                                    >
                                        ค้นหา
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    ) : formik.values.statusId == 3 || formik.values.statusId == 5 ? (
                        <Grid item xs={12} sm={12} md={10} lg={10}>
                            <Grid container spacing={2} alignItems="flex-end">
                                <Grid item xs={12} sm={12} md={2.4} lg={2.4}>
                                    <FormikDatePicker
                                        formik={formik}
                                        name="dateFrom"
                                        label={"วันที่สร้างรายการ"}
                                        disableFuture
                                    />
                                </Grid>
                                <Grid item xs={12} sm={12} md={2.4} lg={2.4}>
                                    <FormikDatePicker formik={formik} name="dateTo" label={"ถึงวันที่"} disableFuture />
                                </Grid>
                                <Grid item xs={12} sm={12} md={2.4} lg={2.4}>
                                    <FormikDropdown
                                        formik={formik}
                                        name="emailStatusId"
                                        label="สถานะการส่งเมล"
                                        valueFieldName="id"
                                        displayFieldName="label"
                                        data={emailStatus ?? []}
                                        fullWidth
                                        firstItemText="ทั้งหมด"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={12} md={2.4} lg={2.4}>
                                    <FormikTextField
                                        formik={formik}
                                        label="ชื่อสถานพยาบาล"
                                        fullWidth
                                        size="small"
                                        name="searchDetail"
                                        placeholder="ค้นหาด้วยชื่อสถานพยาบาล"
                                        InputProps={{
                                            endAdornment: formik.values.searchDetail ? (
                                                <IconButton
                                                    size="small"
                                                    aria-label="ล้างคำค้นหา"
                                                    onClick={() => formik.setFieldValue("searchDetail", "")}
                                                >
                                                    <ClearIcon fontSize="small" />
                                                </IconButton>
                                            ) : undefined,
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={12} md={2.4} lg={2.4} sx={{ pb: 0.7 }}>
                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        startIcon={<SearchIcon />}
                                        sx={{
                                            backgroundColor: "#0D4C8C",
                                            borderRadius: 3,
                                            textTransform: "none",
                                            height: "40px",
                                            "&:hover": { backgroundColor: "#0A3D70" },
                                        }}
                                    >
                                        ค้นหา
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    ) : null}
                </Grid>
            </Box>
        </>
    );
};

export default SearchTransferByStatus;
