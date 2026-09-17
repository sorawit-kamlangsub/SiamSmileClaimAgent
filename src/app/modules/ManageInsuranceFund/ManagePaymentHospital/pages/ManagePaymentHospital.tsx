import { Button, Grid, useMediaQuery, useTheme } from "@mui/material";
import useManagePaymentHospitalHook from "../hooks/ManagePaymentHospitalHook";
import AddHospitalDialog from "../components/AddHospitalDialog";
import CardHeaderSummaryDetail from "../components/CardHeaderSummaryDetail";
import SearchHospitalByName from "../../_common/SearchHospitalByName";

const ManagePaymentHospital = () => {
    const theme = useTheme();
    const breakpoint = useMediaQuery(theme.breakpoints.down("md"));
    const { formik, handleOpenDialog } = useManagePaymentHospitalHook();
    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={12} lg={12} sx={{ textAlign: breakpoint ? "center" : "end" }}>
                    <Button
                        variant="contained"
                        onClick={() => {
                            handleOpenDialog();
                        }}
                        fullWidth
                        sx={{
                            color: "#FFFFFF",
                            bgcolor: "#078C59",
                            maxWidth: breakpoint ? "100%" : "15%",
                            "&:hover": {
                                color: "#FFFFFF",
                                bgcolor: "#0ab372",
                                cursor: "pointer",
                                boxShadow: 6,
                            },
                        }}
                    >
                        เพิ่มสถานพยาบาล
                    </Button>
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12}>
                    <CardHeaderSummaryDetail
                        autoEnabledCount={2}
                        holdingCount={1}
                        title="กำหนดการจ่ายอัตโนมัติรายสถานพยาบาล"
                        subtitle="เลือกระยะ Delay เป็นจำนวนวันหลังรายการพร้อมจ่าย โดยไม่ผูกกับวันที่ตายตัว"
                    />
                </Grid>

                <Grid item xs={12} sm={12} md={12} lg={12}>
                    <SearchHospitalByName formik={formik} />
                </Grid>
            </Grid>

            <AddHospitalDialog />
        </>
    );
};

export default ManagePaymentHospital;
