import { Box, Button, Grid, InputAdornment, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import { useFormik } from "formik";
import { FormikDropdown, FormikTextField } from "../../_common";
import FormikDatePicker from "../../_common/components/CustomFormik/FormikDatePicker";
import BranchAutocomplete from "../../_common/components/ClaimAgent/CustomDropdown/ฺBranchAutocomplete";
import dayjs, { Dayjs } from "dayjs";

const currentDate = dayjs();

export interface ClaimSearchFilterValues {
    searchBy: number | undefined;
    searchText: string;
    branchId: number | undefined;
    statusId: number | undefined;
    transferDateFrom: Dayjs | undefined;
    transferDateTo: Dayjs | undefined;
}

export interface ClaimSearchFilterFormProps {
    initialValues?: Partial<ClaimSearchFilterValues>;
    onSubmit: (values: ClaimSearchFilterValues) => void;
}

const defaultValues: ClaimSearchFilterValues = {
    searchBy: undefined,
    searchText: "",
    branchId: undefined,
    statusId: undefined,
    transferDateFrom: currentDate,
    transferDateTo: currentDate,
};

const ClaimSearchFilterForm = ({ initialValues, onSubmit }: ClaimSearchFilterFormProps) => {
    const formik = useFormik<ClaimSearchFilterValues>({
        initialValues: { ...defaultValues, ...initialValues },
        onSubmit: (values) => {
            onSubmit(values);
        },
    });

    const fieldLabelSx = { fontSize: "0.8rem", color: "#78909C", marginBottom: "4px" };

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
            <Grid container spacing={2} alignItems="flex-end">
                <Grid item xs={12} sm={3} md={2}>
                    <FormikDropdown
                        name="searchBy"
                        formik={formik}
                        label="ค้นหาจาก"
                        data={[]}
                        valueFieldName=""
                        displayFieldName=""
                        fullWidth
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <Typography sx={{ ...fieldLabelSx, visibility: "hidden" }}>.</Typography>
                    <FormikTextField
                        name="searchText"
                        formik={formik}
                        label="คำค้นหาเลขที่ CPG/CL"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <PersonSearchIcon sx={{ color: "#9E9E9E", fontSize: 20 }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>

                <Grid item xs={12} sm={3} md={2} sx={{ display: "flex", alignItems: "center" }}>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        startIcon={<SearchIcon />}
                        sx={{
                            backgroundColor: "#0D4C8C",
                            textTransform: "none",
                            "&:hover": { backgroundColor: "#0A3D70" },
                        }}
                    >
                        ค้นหา
                    </Button>
                </Grid>
                <Grid item></Grid>
            </Grid>

            <Grid container spacing={2} sx={{ marginTop: "4px" }}>
                <Grid item xs={12} sm={6} md={3}>
                    <BranchAutocomplete name="branchId" formik={formik} />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <FormikDropdown
                        name="statusId"
                        formik={formik}
                        label="สถานะ"
                        data={[]}
                        valueFieldName=""
                        displayFieldName=""
                        fullWidth
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <FormikDatePicker
                        name="transferDateFrom"
                        formik={formik}
                        label={"ช่วงวันที่โอนคืน"}
                        disableFuture
                        fullWidth
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <FormikDatePicker
                        name="transferDateTo"
                        formik={formik}
                        label={"ถึงวันที่"}
                        disableFuture
                        fullWidth
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default ClaimSearchFilterForm;
