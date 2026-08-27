import { Backdrop, CircularProgress, Grid } from "@mui/material";
import AutoTransferPaymentCard from "../components/ManageTransfers/AutoTransferPaymentCard";
import useManageAutoTransferHook from "../hooks/ManageTransferHook/ManageAutoTransferHook";
import AutoTransferHint from "../components/ManageTransfers/AutoTransferHint";
import AutoTransferHistory from "../components/ManageTransfers/AutoTransferHistory";

const ManageTransferPage = () => {
    const { formik, currentSettingData, currentSettingIsLoading } = useManageAutoTransferHook();

    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={9} lg={9}>
                    <Grid container direction="column" spacing={2}>
                        <Grid item>
                            <AutoTransferPaymentCard
                                enabled={formik.values.transferAutoStatus}
                                onChange={(value) => formik.setFieldValue("transferAutoStatus", value)}
                            />
                        </Grid>
                        <Grid item>
                            <AutoTransferHistory
                                data={currentSettingData?.data?.history}
                                isLoading={currentSettingIsLoading}
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12} sm={12} md={3} lg={3}>
                    <AutoTransferHint
                        tips={[
                            "กรณีที่กดเปิด (ON) : จะทำการเปิดการใช้งานโอนเงิน Auto ตามช่วงเวลาทำการ (8:00-18:00 น.)",
                            "กรณีที่กดปิด (OFF) : จะปิดการโอนเงิน Auto รายการเคลมจะเป็นสถานะ >> รอโอนเงิน และระบบจะเปิดทำงาน Auto ได้ก็ต่อเมื่อมีการกดปุ่มเปิดเท่านั้น",
                        ]}
                    />
                </Grid>
            </Grid>
            <Backdrop open={currentSettingIsLoading} style={{ zIndex: 9999 }}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </>
    );
};

export default ManageTransferPage;
