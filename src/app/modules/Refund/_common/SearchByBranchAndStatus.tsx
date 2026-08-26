import { Box, Button, Grid, MenuItem, TextField, Typography } from "@mui/material";
import { useFormik } from "formik";

export interface SelectOption {
    value: string | number;
    label: string;
}

export interface BranchStatusFilterValues {
    branch: string | number;
    status: string | number;
}

export interface SearchByBranchAndStatusProps {
    branchOptions: SelectOption[];
    statusOptions: SelectOption[];
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
    branchOptions,
    statusOptions,
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
    const fieldLabelSx = { fontSize: "0.8rem", color: "#78909C", marginBottom: "4px" };

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
            <Grid container spacing={2} alignItems="flex-end">
                <Grid item xs={12} sm={4} md={3}>
                    <Typography sx={fieldLabelSx}>สาขา</Typography>
                    <TextField
                        select
                        fullWidth
                        size="small"
                        name="branch"
                        value={formik.values.branch}
                        onChange={formik.handleChange}
                    >
                        {branchOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>

                <Grid item xs={12} sm={4} md={3}>
                    <Typography sx={fieldLabelSx}>สถานะ</Typography>
                    <TextField
                        select
                        fullWidth
                        size="small"
                        name="status"
                        value={formik.values.status}
                        onChange={formik.handleChange}
                    >
                        {statusOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
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
