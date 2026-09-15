import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { Box, Grid, Skeleton, Typography } from "@mui/material";
import { useGetEmployeeClaimPaymentLimit } from "../../../../api/coreClaimMastersApi";
import { useAuth } from "../../../_auth";

export const RemainCreditLimit = () => {
    const { userProfile } = useAuth();
    const { data: employeeClaimPaymentLimit, isLoading } = useGetEmployeeClaimPaymentLimit(userProfile?.userId ?? 0);
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
                    {isLoading ? (
                        <Skeleton variant="text" width={140} height={28} />
                    ) : (
                        <Typography color={"primary"} sx={{ fontWeight: "bold", fontSize: "18px" }}>
                            THB&nbsp;&nbsp;&nbsp;
                            {(employeeClaimPaymentLimit?.data?.remainingLimit ?? 0).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </Typography>
                    )}
                </Box>
            </Grid>
        </>
    );
};
