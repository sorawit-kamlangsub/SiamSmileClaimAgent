import { Box, Button, Dialog, Grid, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { setDialogSuccessSummaryOpen } from "../store/generateTransferSlice";
import { useAppDispatch, useAppSelector } from "../../../../../redux";
import { numberWithCommas } from "../../../../functionHelpers";

const GenerateDialogSuccess = () => {
    const dispatch = useAppDispatch();

    const { generateSuccessSummaryDialog } = useAppSelector((state) => state.generateTransferHospital);

    const handleClose = () => {
        dispatch(setDialogSuccessSummaryOpen({ isOpen: false, generateSuccessListData: [] }));
    };
    return (
        <Dialog
            open={generateSuccessSummaryDialog.isOpen}
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
            sx={{ borderRadius: 4 }}
        >
            <Box sx={{ m: 4 }}>
                <Box
                    sx={{
                        width: 72,
                        height: 72,
                        borderRadius: "64px",
                        backgroundColor: "#079447",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 20px",
                    }}
                >
                    <CheckIcon sx={{ color: "#FFFFFF", fontSize: 36 }} />
                </Box>
                <Box>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12} md={12} lg={12} sx={{ textAlign: "center" }}>
                            <Typography variant="h6" sx={{ color: "#085C96", fontWeight: "bold" }}>
                                Generate Group สำเร็จ
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={12} md={12} lg={12} sx={{ textAlign: "center" }}>
                            <Typography variant="subtitle1" sx={{ color: "#8E9FAB" }}>
                                สร้างเลขอ้างอิงการโอนแยกตามสถานพยาบาลเรียบร้อยแล้ว
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
                <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={6} md={6} lg={6}>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 1,
                                    bgcolor: "#EFF7FB",
                                    p: 1,
                                    borderRadius: 3,
                                }}
                            >
                                <Typography variant="subtitle2" sx={{ color: "#9CADB6" }}>
                                    จำนวนเคส
                                </Typography>
                                <Typography variant="h6" sx={{ color: "#1C6DA2", fontWeight: "bold" }}>
                                    {generateSuccessSummaryDialog.generateSuccessListData?.data?.itemCount} เคส
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} sm={6} md={6} lg={6}>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 1,
                                    bgcolor: "#EFF7FB",
                                    p: 1,
                                    borderRadius: 3,
                                }}
                            >
                                <Typography variant="subtitle2" sx={{ color: "#9CADB6" }}>
                                    ยอดเงินรวม
                                </Typography>
                                <Typography variant="h6" sx={{ color: "#1C6DA2", fontWeight: "bold" }}>
                                    {numberWithCommas(
                                        generateSuccessSummaryDialog.generateSuccessListData?.data
                                            ?.totalNetPaidAmount ?? 0
                                    )}{" "}
                                    บาท
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
                <Box
                    sx={{
                        border: "1px solid #B9DDF2",
                        borderRadius: "12px",
                        overflow: "hidden",
                        mt: 1,
                    }}
                >
                    <Box
                        sx={{
                            px: 2,
                            py: 1,
                            bgcolor: "#EAF6FD",
                            color: "#0D6DA2",
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                        }}
                    >
                        <Typography fontWeight={700}>เลขอ้างอิงการโอนตามสถานพยาบาล</Typography>
                    </Box>
                    {generateSuccessSummaryDialog.generateSuccessListData?.data?.paymentCodeResponse?.map(
                        (item: any) => {
                            return (
                                <Grid
                                    container
                                    key={item?.paymentCode}
                                    alignItems="center"
                                    sx={{
                                        px: 1.5,
                                        py: 1,
                                        borderTop: "1px solid #D9E5EC",
                                    }}
                                >
                                    <Grid item xs={6}>
                                        <Typography color="#31556D">{item?.hospitalName}</Typography>
                                        <Typography variant="subtitle2" color="#0A73AE">
                                            {item?.paymentCode}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={3}>
                                        <Box
                                            sx={{
                                                bgcolor: "#DDF4E7",
                                                color: "#078B4F",
                                                borderRadius: "20px",
                                                px: 1.5,
                                                py: 0.4,
                                                width: "fit-content",
                                                fontSize: 12,
                                                fontWeight: 700,
                                            }}
                                        >
                                            {item?.totalCount} รายการ
                                        </Box>
                                    </Grid>

                                    <Grid item xs={3} sx={{ textAlign: "right" }}>
                                        <Typography color="#078B4F" fontWeight={700} fontSize={12}>
                                            {numberWithCommas(item?.netPaidAmount)} บาท
                                        </Typography>
                                    </Grid>
                                </Grid>
                            );
                        }
                    )}
                </Box>
                <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={6} md={6} lg={6}>
                            <Box
                                sx={{
                                    bgcolor: "#FFF7DC",
                                    color: "#C39A3B",
                                    borderRadius: "20px",
                                    px: 1.5,
                                    py: 0.4,
                                    width: "fit-content",
                                    fontSize: 12,
                                    fontWeight: 700,
                                }}
                            >
                                รอโอน
                            </Box>
                        </Grid>
                        <Grid item xs={6} sm={6} md={6} lg={6} sx={{ textAlign: "end" }}>
                            <Button
                                variant="contained"
                                color="success"
                                onClick={() => {
                                    handleClose();
                                }}
                                sx={{ width: "50%" }}
                            >
                                สำเร็จ
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Dialog>
    );
};

export default GenerateDialogSuccess;
