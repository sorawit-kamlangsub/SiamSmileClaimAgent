import { Box, Button, Dialog, Grid, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../../../redux";
import { setDialogOpen } from "../store/managePaymentHospitalSlice";
import { useEffect } from "react";
import useAddHospitalHook from "../hooks/AddHospitalHook";
import { useGetHospitalName } from "../addHospitalAPI";
import FormikAutoCompleteHospitalSearch from "../../_common/FormikAutoCompleteHospitalSearch";
import { FormikCheckbox, FormikTextNumber } from "../../../_common";

const AddHospitalDialog = () => {
    const { addDialog } = useAppSelector((s) => s.managePaymentHospital);
    const dispatch = useAppDispatch();
    const { formik } = useAddHospitalHook();
    const handleClose = () => {
        dispatch(setDialogOpen({ isOpen: false }));
        formik.resetForm();
    };

    useEffect(() => {
        return () => {
            dispatch(setDialogOpen({ isOpen: false }));
            formik.resetForm();
        };
    }, []);

    return (
        <Dialog open={addDialog.isOpen} onClose={handleClose} maxWidth={"md"} fullWidth sx={{ borderRadius: "12px" }}>
            <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={12} md={12} lg={12} sx={{ textAlign: "center" }}>
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                            เพิ่มสถานพยาบาลที่ต้องการตั้งค่า
                        </Typography>
                        <Typography variant="subtitle1">ระบุข้อมูลเริ่มต้นสำหรับการจ่ายเงินของสถานพยาบาลนี้</Typography>
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={12}>
                        <FormikAutoCompleteHospitalSearch
                            formik={formik}
                            name="hospitalId"
                            fullWidth
                            label="ชื่อสถานพยาบาล"
                            useQueryGet={useGetHospitalName.bind(this)}
                            valueFieldName="orgId"
                            displayFieldName="orgName"
                            selectedCallback={() => {
                                formik.setFieldValue("hospitalName", undefined, true);
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={12}>
                        <FormikCheckbox formik={formik} name="isAutoPay" label="เปิดการจ่ายเงินอัตโนมัติ" />
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={12}>
                        <FormikTextNumber formik={formik} name="autoPayDelayDays" label="Delay (วัน)" />
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={12}>
                        <FormikCheckbox formik={formik} name="holdStatusId" label="Hold การจ่ายเงิน" />
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={12}>
                        <Grid container spacing={2}>
                            <Grid item xs={6} sm={6} md={6} lg={6} sx={{ textAlign: "end" }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => {
                                        handleClose();
                                    }}
                                    sx={{
                                        borderColor: "#870000",
                                        color: "#870000",
                                        "&:hover": {
                                            borderColor: "#c02424",
                                            bgcolor: "#d82626",
                                            color: "#FFFFFF",
                                        },
                                    }}
                                >
                                    ยกเลิก
                                </Button>
                            </Grid>
                            <Grid item xs={6} sm={6} md={6} lg={6}>
                                <Button
                                    variant="contained"
                                    onClick={() => {
                                        formik.submitForm();
                                    }}
                                    color="submit"
                                >
                                    เพิ่มและบันทึกการตั้งค่า
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Box>
        </Dialog>
    );
};

export default AddHospitalDialog;
