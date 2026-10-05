import { Button, Grid, useMediaQuery, useTheme } from "@mui/material";
import useManagePaymentHospitalHook from "../hooks/ManagePaymentHospitalHook";
import AddHospitalDialog from "../components/AddHospitalDialog";
import CardHeaderSummaryDetail from "../components/CardHeaderSummaryDetail";
import SearchHospitalByName from "../../_common/SearchHospitalByName";
import HospitalPaySettingsTable from "../components/HospitalManagementDataTable";
import HistorySettingByHospitalId from "../components/HistorySettingByHospitalId";
import { swalConfirm } from "../../../_common";

const ManagePaymentHospital = () => {
    const theme = useTheme();
    const breakpoint = useMediaQuery(theme.breakpoints.down("md"));
    const {
        formik,
        handleOpenDialog,
        hospitalData,
        isGetHospitalLoading,
        updateHospitalSettingMutate,
        isUpdateHospitalSettingLoading,
    } = useManagePaymentHospitalHook();

    const countAutoPay = hospitalData?.filter((item: any) => item.holdStatusId === 1).length;
    const countHolding = hospitalData?.filter((item: any) => item.holdStatusId === 2).length;
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
                        autoEnabledCount={countAutoPay ?? 0}
                        holdingCount={countHolding ?? 0}
                        title="กำหนดการจ่ายอัตโนมัติรายสถานพยาบาล"
                        subtitle="เลือกระยะ Delay เป็นจำนวนวันหลังรายการพร้อมจ่าย โดยไม่ผูกกับวันที่ตายตัว"
                    />
                </Grid>

                <Grid item xs={12} sm={12} md={12} lg={12}>
                    <SearchHospitalByName formik={formik} />
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12}>
                    {hospitalData?.length > 0 && (
                        <HospitalPaySettingsTable
                            initialRows={hospitalData ?? []}
                            onSaveRow={(row) => {
                                const payload = {
                                    hospitalPaymentSettingId: row?.hospitalPaymentSettingId,
                                    autoPayDelayDays: row?.delayDays,
                                    holdStatusId: row?.holdStatusId,
                                    isAutoPay: row?.isAutoPay,
                                };
                                swalConfirm("ยืนยันทำรายการ", "", "ยืนยัน", "ยกเลิก").then((res) => {
                                    if (res.isConfirmed) {
                                        updateHospitalSettingMutate(payload);
                                    }
                                });
                            }}
                            renderHistory={(hospitalPaymentSettingId, hospitalName) => {
                                return (
                                    <HistorySettingByHospitalId
                                        hospitalPaymentSettingId={hospitalPaymentSettingId}
                                        hospitalName={hospitalName}
                                    />
                                );
                            }}
                            isLoading={isGetHospitalLoading || isUpdateHospitalSettingLoading}
                        />
                    )}
                </Grid>
            </Grid>

            <AddHospitalDialog />
        </>
    );
};

export default ManagePaymentHospital;
