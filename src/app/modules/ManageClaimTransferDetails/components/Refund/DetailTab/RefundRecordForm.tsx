import { Box, Grid, Typography } from "@mui/material";
import { FormikProps } from "formik";
import { Dayjs } from "dayjs";
import FormikDateTimePicker from "../../../../_common/components/CustomFormik/FormikDateTimePicker";
import { FormikDropdown, FormikTextField } from "../../../../_common";
import RefundSlipFileUpload from "./RefundSlipFileUpload";

export interface RefundRecordFormValues {
    refundTransferType: number | undefined;
    refundSlipDateTime: Dayjs | null;
    reasonId: number | undefined;
    note: string;
    slipFile: File[] | undefined;
}

export interface RefundRecordFormProps<T extends RefundRecordFormValues> {
    formik: FormikProps<T>;
    reasonOptions: any[];
    isLoadingDropdown: boolean;
    transferTypeOptions: any[];
    isTransferTypeLoading: boolean;
}

const RefundRecordForm = <T extends RefundRecordFormValues>({
    formik,
    reasonOptions,
    isLoadingDropdown,
    transferTypeOptions,
    isTransferTypeLoading,
}: RefundRecordFormProps<T>) => {
    return (
        <Box
            sx={{
                backgroundColor: "#FFFFFF",
                borderRadius: "10px",
                border: "1px solid #E0E0E0",
                padding: "20px 24px",
            }}
        >
            <Typography sx={{ fontWeight: 700, color: "#212121", marginBottom: "16px" }}>
                บันทึกรายการคืนเงิน
            </Typography>

            <Grid container direction="column" spacing={3}>
                <Grid item xs={12}>
                    <Box sx={{ maxWidth: "350px" }}>
                        <FormikDropdown
                            formik={formik}
                            name="refundTransferType"
                            label="ประเภทการโอน"
                            data={transferTypeOptions ?? []}
                            size="small"
                            fullWidth
                            firstItemText="กรุณาเลือกประเภทการโอน"
                            disableFirstItem
                            valueFieldName="id"
                            displayFieldName="name"
                            required
                            isLoading={isTransferTypeLoading}
                        />
                    </Box>
                </Grid>

                <Grid item xs={12}>
                    <Box sx={{ maxWidth: "350px" }}>
                        <FormikDateTimePicker
                            formik={formik}
                            name="refundSlipDateTime"
                            label="วันที่/เวลาโอนคืน Slip"
                            size="small"
                            fullWidth
                            required
                            InputLabelProps={{ shrink: true }}
                        />
                    </Box>
                </Grid>

                <Grid item xs={12}>
                    <Box sx={{ maxWidth: "350px" }}>
                        <FormikDropdown
                            formik={formik}
                            name="reasonId"
                            data={reasonOptions ?? []}
                            size="small"
                            fullWidth
                            firstItemText="กรุณาเลือก"
                            disableFirstItem
                            label="สาเหตุที่โอนคืน"
                            valueFieldName="id"
                            displayFieldName="name"
                            required
                            isLoading={isLoadingDropdown}
                        />
                    </Box>
                </Grid>

                <Grid item xs={12}>
                    <Box sx={{ maxWidth: "350px" }}>
                        <FormikTextField
                            formik={formik}
                            fullWidth
                            size="small"
                            name="note"
                            label="หมายเหตุ"
                            placeholder="กรุณากรอกหมายเหตุ"
                            required
                            InputLabelProps={{ shrink: true }}
                        />
                    </Box>
                </Grid>

                <Grid item xs={12}>
                    <RefundSlipFileUpload formik={formik} name="slipFile" />
                </Grid>
            </Grid>
        </Box>
    );
};

export default RefundRecordForm;