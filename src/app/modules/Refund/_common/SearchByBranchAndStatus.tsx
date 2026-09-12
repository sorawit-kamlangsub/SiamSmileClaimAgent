import { Box, Button, Grid } from "@mui/material";
import { useFormik } from "formik";
import { FormikDropdown } from "../../_common";
import { useGetBranch, useGetPaymentStatus } from "../../IncreaseLimitTransfer/_common/masterAPI";
import { useGetRefundStatus } from "../refundAPI";
import { useEffect } from "react";
import { useAppDispatch } from "../../../../redux";
import { resetFilterSearch, setSearchMonitorByFilter } from "../store/refundSlice";

export interface SelectOption {
    value: string | number;
    label: string;
}

export interface BranchStatusFilterValues {
    branch: number | undefined;
    status: number | undefined;
}

export interface SearchByBranchAndStatusProps {
    initialValues?: Partial<BranchStatusFilterValues>;
    buttonIcon: React.ReactNode;
    buttonText: string;
    onButtonClick: (values: BranchStatusFilterValues) => void;
    statusSource?: "payment" | "refund";
}

const defaultValues: BranchStatusFilterValues = {
    branch: undefined,
    status: undefined,
};

const SearchByBranchAndStatus = ({
    initialValues,
    buttonIcon,
    buttonText,
    onButtonClick,
    statusSource = "payment",
}: SearchByBranchAndStatusProps) => {
    const { data: branchData, isLoading: branchDataIsLoading } = useGetBranch();
    const isRefundSource = statusSource === "refund";
    const { data: paymentStatus, isLoading: paymentStatusIsLoading } = useGetPaymentStatus(
        isRefundSource ? false : true
    );
    const { data: refundStatus, isLoading: refundStatusIsLoading } = useGetRefundStatus(isRefundSource);
    const statusData = isRefundSource ? refundStatus?.data ?? [] : paymentStatus?.data ?? [];
    const statusIsLoading = isRefundSource ? refundStatusIsLoading : paymentStatusIsLoading;
    const formik = useFormik<BranchStatusFilterValues>({
        initialValues: { ...defaultValues, ...initialValues },
        onSubmit: (values) => {
            onButtonClick(values);
        },
    });

    const dispatch = useAppDispatch();

    useEffect(() => {
        if (formik?.values) {
            const payload = {
                branchId: formik.values?.branch ?? undefined,
                paymentStatusId: formik.values?.status ?? undefined,
            };
            dispatch(setSearchMonitorByFilter(payload));
        }

        return () => {
            dispatch(resetFilterSearch());
        };
    }, [formik.values]);

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
                        data={branchData?.data ?? []}
                        valueFieldName="branchId"
                        displayFieldName="branchName"
                        isLoading={branchDataIsLoading}
                        firstItemText="ทั้งหมด"
                    />
                </Grid>

                <Grid item xs={12} sm={4} md={3}>
                    <FormikDropdown
                        name="status"
                        formik={formik}
                        label="สถานะ"
                        fullWidth
                        data={statusData}
                        valueFieldName="id"
                        displayFieldName="name"
                        isLoading={statusIsLoading}
                        firstItemText="กรุณาเลือกสถานะ"
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
