import { Chip, Grid, Paper, Theme, Typography, useMediaQuery } from "@mui/material";
import { StandardDataTable } from "../../_common";
import useGetPaymentDataHook from "../hooks/useGetPaymentData";
import { numberWithCommas } from "../../../functionHelpers";

const PaymentDataTable = () => {
    const { column, data } = useGetPaymentDataHook();
    const breakpoint = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={12} lg={12}>
                    <Chip
                        label={<Typography sx={{ fontWeight: "bold", fontSize: "14px" }}>Payment Detail</Typography>}
                        sx={{
                            display: "flex",
                            background: breakpoint
                                ? "linear-gradient(to right,#0458AD 0%,#2B96EC 30%,#29ABE2 50%,#2B96EC 70%,#0458AD 100%)"
                                : "linear-gradient(to right,#0458AD 0%,#157CD9 10%,#2B96EC 40%,#29ABE2 70%)",
                            color: "#FFFFFF",
                            fontWeight: "bold",
                            px: 2,
                            py: 0.5,
                            borderRadius: breakpoint ? "5px 5px 5px 5px" : "6px 0 0 6px",
                            width: breakpoint ? "100%" : "10%",
                        }}
                    />
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12}>
                    <Paper elevation={3} sx={{ p: { xs: 1, md: 3 }, boxShadow: 6, borderRadius: "0 0 10 10" }}>
                        <StandardDataTable
                            name="paymentSlipDataTable"
                            columns={column ?? []}
                            data={data?.data?.paymentItemDetail ?? []}
                            displayFooter={false}
                            sx={{
                                width: "100%",
                                minWidth: 0,
                            }}
                            options={{
                                customTableBodyFooterRender: () => (
                                    <tfoot>
                                        <tr style={{ background: "#E3F0FB" }}>
                                            <td style={{ padding: "10px" }}>
                                                <Typography sx={{ color: "#0458AD", fontWeight: "bold" }}>
                                                    Grand Total
                                                </Typography>
                                            </td>
                                            <td style={{ padding: "10px" }}></td>
                                            <td style={{ padding: "10px" }}>
                                                <Typography
                                                    sx={{ color: "#0458AD", fontWeight: "bold", textAlign: "end" }}
                                                >
                                                    {numberWithCommas(
                                                        data?.data?.paymentItemDetail?.reduce(
                                                            (acc: any, curr: any) => acc + curr.transactionAmount,
                                                            0
                                                        )
                                                    )}
                                                </Typography>
                                            </td>
                                            <td style={{ padding: "10px" }}></td>
                                            <td style={{ padding: "10px" }}>
                                                <Typography
                                                    sx={{ color: "#0458AD", fontWeight: "bold", textAlign: "end" }}
                                                >
                                                    {numberWithCommas(
                                                        data?.data?.paymentItemDetail?.reduce(
                                                            (acc: any, curr: any) => acc + curr.approvedAmount,
                                                            0
                                                        )
                                                    )}
                                                </Typography>
                                            </td>
                                        </tr>
                                    </tfoot>
                                ),
                            }}
                        />
                    </Paper>
                </Grid>
            </Grid>
        </>
    );
};

export default PaymentDataTable;
