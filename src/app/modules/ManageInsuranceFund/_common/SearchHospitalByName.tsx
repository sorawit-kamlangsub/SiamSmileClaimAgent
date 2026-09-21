import { Box, Button, Grid, IconButton, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { FormikProps } from "formik";
import { FormikTextField } from "../../_common";
import { ClearIcon } from "@mui/x-date-pickers";

interface SearchFormValues {
    searchDetail: string;
}

type SearchHospitalByNameProps<T extends SearchFormValues> = {
    formik: FormikProps<T>;
};

const SearchHospitalByName = <T extends SearchFormValues>({ formik }: SearchHospitalByNameProps<T>) => {
    return (
        <Box
            component="form"
            onSubmit={formik.handleSubmit}
            sx={{
                border: "1px solid #E0E0E0",
                borderRadius: "12px",
                backgroundColor: "#FFFFFF",
                padding: "20px 24px",
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <SearchIcon sx={{ color: "#1565C0", fontSize: 20 }} />
                <Typography sx={{ fontWeight: 700, color: "#1565C0" }}>ค้นหาสถานพยาบาล</Typography>
            </Box>

            <Grid container spacing={2} alignItems="flex-end">
                <Grid item xs={12} sm={12} md={9} lg={9}>
                    <Typography sx={{ fontSize: "0.8rem", color: "#78909C", marginBottom: "4px" }}>
                        ชื่อสถานพยาบาล
                    </Typography>
                    <FormikTextField
                        formik={formik}
                        label=""
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

export default SearchHospitalByName;
