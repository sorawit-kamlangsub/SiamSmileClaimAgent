import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { Box, Grid, Typography } from "@mui/material";

export const RemainCreditLimit = () => {
    return (
        <>
            <Grid
                container
                sx={{
                    display: "flex",
                    boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px;",
                    borderRadius: "10px 10px 10px 10px",
                }}
            >
                <Box
                    sx={{
                        backgroundColor: "#007AC1",
                        p: 1,
                        borderRadius: "10px 0px 0px 10px",
                    }}
                >
                    <AttachMoneyIcon sx={{ width: "50px", fontSize: "42px", color: "#ffffff", mt: 0.5 }} />
                </Box>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        p: 1,
                        backgroundColor: "white",
                        borderRadius: "0px 10px 10px 0px",
                    }}
                >
                    <Typography component="div" sx={{ fontWeight: "bold", fontSize: "14px", color: "#7A7A7A" }}>
                        วงเงินคงเหลือ (ผู้คีย์เคลม) :
                    </Typography>
                    <Typography color={"primary"} sx={{ fontWeight: "bold", fontSize: "18px" }}>
                        THB&nbsp;&nbsp;&nbsp;
                        {(30000).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        }) ?? "0.00"}
                    </Typography>
                </Box>
            </Grid>
        </>
    );
};
