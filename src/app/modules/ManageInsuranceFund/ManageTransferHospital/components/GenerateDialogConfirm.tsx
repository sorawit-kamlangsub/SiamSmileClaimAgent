import { Box, Button, Dialog, Grid, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../../../redux";
import { setDialogOpen } from "../store/generateTransferSlice";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import { numberWithCommas } from "../../../../functionHelpers";

const GenerateDialogConfirm = () => {
    const dispatch = useAppDispatch();
    const { generateTransferDialog } = useAppSelector((s) => s.generateTransferHospital);
    const handleClose = () => {
        dispatch(setDialogOpen({ isOpen: false, generateListData: [] }));
    };

    const groupedByHospital = generateTransferDialog?.generateListData?.reduce<
        Record<string, typeof generateTransferDialog.generateListData>
    >((groups, item) => {
        if (!groups[item.hospitalName]) {
            groups[item.hospitalName] = [];
        }

        groups[item.hospitalName].push(item);

        return groups;
    }, {});
    return (
        <Dialog
            open={generateTransferDialog.isOpen}
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
                        borderRadius: "16px",
                        backgroundColor: "#F8B923",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 20px",
                    }}
                >
                    <AutoAwesomeOutlinedIcon sx={{ color: "#FFFFFF", fontSize: 36 }} />
                </Box>
                <Box>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12} md={12} lg={12} sx={{ textAlign: "center" }}>
                            <Typography variant="h6" sx={{ color: "#085C96", fontWeight: "bold" }}>
                                ยืนยันการ Generate Group
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={12} md={12} lg={12} sx={{ textAlign: "center" }}>
                            <Typography variant="subtitle1" sx={{ color: "#8E9FAB" }}>
                                ระบบจะแยกรายการตามสถานพยาบาล และสร้างเลข HCG แยกกัน
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
                <Box
                    sx={{
                        borderRadius: "16px",
                        backgroundColor: "#EFF6FB",
                        display: "flex",
                        alignItems: "center",
                        margin: "0 auto 20px",
                        p: 2,
                    }}
                >
                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={6} md={6} lg={6}>
                            <Typography sx={{ color: "#0D6DA2" }}>รายการที่เลือก</Typography>
                        </Grid>
                        <Grid item xs={6} sm={6} md={6} lg={6} sx={{ textAlign: "end" }}>
                            <Typography sx={{ color: "#0D6DA2", fontWeight: "bold" }}>
                                {`${generateTransferDialog?.generateListData?.length ?? 0} รายการ`}
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>

                <Box
                    sx={{
                        border: "1px solid #B9DDF2",
                        borderRadius: "12px",
                        overflow: "hidden",
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
                        <AccountBalanceOutlinedIcon fontSize="small" />
                        <Typography fontWeight={700}>
                            ระบบจะสร้าง {Object.keys(groupedByHospital ?? {}).length} กลุ่มตามสถานพยาบาล
                        </Typography>
                    </Box>

                    {Object.entries(groupedByHospital ?? {}).map(([hospitalName, items]) => {
                        const totalAmount = items.reduce((total, item) => total + item.amount, 0);

                        return (
                            <Grid
                                container
                                key={hospitalName}
                                alignItems="center"
                                sx={{
                                    px: 1.5,
                                    py: 1,
                                    borderTop: "1px solid #D9E5EC",
                                }}
                            >
                                <Grid item xs={6}>
                                    <Typography color="#526A7A">{hospitalName}</Typography>
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
                                        {items.length} รายการ
                                    </Box>
                                </Grid>

                                <Grid item xs={3} sx={{ textAlign: "right" }}>
                                    <Typography color="#078B4F" fontWeight={700} fontSize={12}>
                                        {numberWithCommas(totalAmount)} บาท
                                    </Typography>
                                </Grid>
                            </Grid>
                        );
                    })}
                </Box>
                <Box
                    sx={{
                        mt: 1.5,
                        px: 2,
                        py: 1.5,
                        bgcolor: "#DDF4E7",
                        borderRadius: "10px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Typography color="#237A4B">ยอดเงินรวมทั้งหมด</Typography>
                    <Typography color="#176B40" fontWeight={700}>
                        {numberWithCommas(
                            generateTransferDialog?.generateListData?.reduce((total, item) => total + item.amount, 0) ??
                                0
                        )}{" "}
                        บาท
                    </Typography>
                </Box>
                <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={6} md={6} lg={6} sx={{ textAlign: "end" }}>
                            <Button variant="outlined" color="error" sx={{ width: "45%" }} onClick={handleClose}>
                                ยกเลิก
                            </Button>
                        </Grid>
                        <Grid item xs={6} sm={6} md={6} lg={6} sx={{ textAlign: "start" }}>
                            <Button
                                variant="contained"
                                color="success"
                                sx={{ width: "45%" }}
                                onClick={() => {
                                    console.log(generateTransferDialog?.generateListData);
                                }}
                            >
                                ยืนยัน
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Dialog>
    );
};

export default GenerateDialogConfirm;
