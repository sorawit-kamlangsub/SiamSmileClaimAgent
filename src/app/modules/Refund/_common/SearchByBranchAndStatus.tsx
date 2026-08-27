import { Box, Button, Grid } from "@mui/material";
import { useFormik } from "formik";
import { FormikDropdown } from "../../_common";

export interface SelectOption {
    value: string | number;
    label: string;
}

export interface BranchStatusFilterValues {
    branch: string | number;
    status: string | number;
}

export interface SearchByBranchAndStatusProps {
    initialValues?: Partial<BranchStatusFilterValues>;
    buttonIcon: React.ReactNode;
    buttonText: string;
    onButtonClick: (values: BranchStatusFilterValues) => void;
}

const defaultValues: BranchStatusFilterValues = {
    branch: "",
    status: "",
};

const SearchByBranchAndStatus = ({
    initialValues,
    buttonIcon,
    buttonText,
    onButtonClick,
}: SearchByBranchAndStatusProps) => {
    const formik = useFormik<BranchStatusFilterValues>({
        initialValues: { ...defaultValues, ...initialValues },
        onSubmit: (values) => {
            onButtonClick(values);
        },
    });

    return (
        <Box
            component="form"
            onSubmit={formik.handleSubmit}
            sx={{
                border: "1px solid #E0E0E0",
                borderRadius: "12px",
                padding: "16px 20px",
                backgroundColor: "#FFFFFF",
            }}
        >
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4} md={3}>
                    <FormikDropdown
                        name="branch"
                        formik={formik}
                        label="สาขา"
                        fullWidth
                        data={[]}
                        displayFieldName="label"
                        valueFieldName="value"
                    />
                </Grid>

                <Grid item xs={12} sm={4} md={3}>
                    <FormikDropdown
                        name="status"
                        formik={formik}
                        label="สถานะ"
                        fullWidth
                        data={[]}
                        displayFieldName="label"
                        valueFieldName="value"
                    />
                </Grid>

                <Grid item xs={12} sm={4} md={2}>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        startIcon={buttonIcon}
                        sx={{
                            backgroundColor: "#0D4C8C",
                            textTransform: "none",
                            "&:hover": { backgroundColor: "#0A3D70" },
                        }}
                    >
                        {buttonText}
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
};

export default SearchByBranchAndStatus;
