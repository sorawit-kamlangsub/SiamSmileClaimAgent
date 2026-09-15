import { Box, Button, Grid, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import { useFormik } from "formik";
import { FormikDropdown, FormikTextField } from "../../_common";
import FormikDatePicker from "../../_common/components/CustomFormik/FormikDatePicker";
import BranchAutocomplete from "../../_common/components/ClaimAgent/CustomDropdown/ฺBranchAutocomplete";
import dayjs, { Dayjs } from "dayjs";
import { useGetRefundStatus } from "../refundAPI";

const currentDate = dayjs();

const monitorSearchTypeData = [
    { id: "CL", name: "เลขที่ CL" },
    { id: "CC", name: "เลขที่ CC" },
];

export interface RefundSearchFilterValues {
    searchBy: string | undefined;
    searchText: string;
    branchId: number | undefined;
    statusId: number | undefined;
    transferDateFrom: Dayjs | undefined;
    transferDateTo: Dayjs | undefined;
}

export interface RefundSearchFilterFormProps {
    initialValues?: Partial<RefundSearchFilterValues>;
    onSubmit: (values: RefundSearchFilterValues) => void;
}

const defaultValues: RefundSearchFilterValues = {
    searchBy: "CL",
    searchText: "",
    branchId: undefined,
    statusId: undefined,
    transferDateFrom: currentDate,
    transferDateTo: currentDate,
};

const RefundSearchFilterForm = ({ initialValues, onSubmit }: RefundSearchFilterFormProps) => {
    const { data: refundStatusData, isLoading: refundStatusIsLoading } = useGetRefundStatus();
    const formik = useFormik<RefundSearchFilterValues>({
        initialValues: { ...defaultValues, ...initialValues },
        onSubmit: (values) => {
            onSubmit(values);
        },
    });

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
                <Grid item xs={12} sm={6} md={3}>
                    <BranchAutocomplete name="branchId" formik={formik} withAllOption />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <FormikDropdown
                        name="statusId"
                        formik={formik}
                        label="สถานะ"
                        data={refundStatusData?.data ?? []}
                        valueFieldName="id"
                        displayFieldName="name"
                        fullWidth
                        isLoading={refundStatusIsLoading}
                        firstItemText="ทั้งหมด"
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

            <Grid container spacing={2} sx={{ marginTop: "4px" }}>
                <Grid item xs={12} sm={4} md={3}>
                    <FormikDropdown
                        name="searchBy"
                        formik={formik}
                        label="ค้นหาจาก"
                        data={monitorSearchTypeData}
                        valueFieldName="id"
                        displayFieldName="name"
                        fullWidth
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={6}>
                    <FormikTextField
                        name="searchText"
                        formik={formik}
                        label="คำค้นหาเลขที่ CL/CC"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <PersonSearchIcon sx={{ color: "#9E9E9E", fontSize: 20 }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3} sx={{ display: "flex", alignItems: "center" }}>
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
            </Grid>
        </Box>
    );
};

export default RefundSearchFilterForm;
