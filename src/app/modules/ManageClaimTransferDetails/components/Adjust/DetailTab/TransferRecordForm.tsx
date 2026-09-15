import { Box, Grid, Typography } from "@mui/material";
import { FormikProps } from "formik";
import ReceivingAccountCard, { ReceivingAccountCardProps } from "./ReceivingAccountCard";
import { FormikDropdown, FormikTextField } from "../../../../_common";

export interface TransferRecordFormValues {
    reasonId: number | undefined;
    note: string;
}

export interface TransferRecordFormProps<T extends TransferRecordFormValues> {
    formik: FormikProps<T>;
    account: ReceivingAccountCardProps;
    reasonOptions: any[];
    isLoadingDropdown: boolean;
    onChangeAccount?: () => void;
}

const TransferRecordForm = <T extends TransferRecordFormValues>({
    formik,
    account,
    reasonOptions,
    isLoadingDropdown,
}: TransferRecordFormProps<T>) => {
    return (
        <Box
            sx={{
                backgroundColor: "#FFFFFF",
                borderRadius: "10px",
                border: "1px solid #E0E0E0",
                padding: "20px 24px",
            }}
        >
            <Typography sx={{ fontWeight: 700, color: "#212121", marginBottom: "16px" }}>บันทึกรายการ</Typography>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Typography sx={{ fontSize: "0.85rem", color: "#455A64", marginBottom: "8px" }}>
                        บัญชีรับสินไหม :
                    </Typography>
                    <ReceivingAccountCard {...account} />
                </Grid>

                <Grid item xs={12} sm={12} md={12} lg={12}>
                    <Grid item xs={12} sm={6} md={4}>
                        <FormikDropdown
                            formik={formik}
                            name="reasonId"
                            data={reasonOptions ?? []}
                            size="small"
                            fullWidth
                            firstItemText="กรุณาเลือก"
                            defaultValue={formik.values.reasonId}
                            label="สาเหตุการโอนเพิ่ม"
                            valueFieldName="id"
                            displayFieldName="name"
                            required
                            isLoading={isLoadingDropdown}
                        />
                    </Grid>
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12}>
                    <Grid item xs={12} sm={6} md={4}>
                        <FormikTextField
                            formik={formik}
                            fullWidth
                            size="small"
                            name="note"
                            label="หมายเหตุ"
                            multiline
                            minRows={3}
                        />
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
};

export default TransferRecordForm;
