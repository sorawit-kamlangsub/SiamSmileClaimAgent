import { Box, Button, Grid, Paper, Theme, useMediaQuery } from "@mui/material";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import { ClaimFundStandardDataTable, NOT_FOUND_MESSAGE } from "../../_common";
import { useAppDispatch, useAppSelector } from "../../../../redux";
import useRefundDataTableHook from "../hooks/RefundDataTableHook";
import { setIsOpenDialog } from "../store/refundSlice";

const RefundDataTable = () => {
    const dispatch = useAppDispatch();
    const { searchMonitor } = useAppSelector((state) => state.refund);
    const isStatusSelected = !!searchMonitor.paymentStatusId;
    const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
    const { columns, getRefundMonitorData, isGetRefundLoading, pagination, setPaginated } =
        useRefundDataTableHook();
    return (
        <>
            <Grid container>
                <Grid item xs={12} sm={12} md={12} lg={12}>
                    <Paper elevation={2} sx={{ p: { xs: 1, md: 3 }, borderRadius: 3 }}>
                        <Box sx={{ display: "flex", justifyContent: "flex-end", pb: 1 }}>
                            <Button
                                variant="contained"
                                startIcon={<CurrencyExchangeIcon />}
                                onClick={() => dispatch(setIsOpenDialog({ isOpen: true }))}
                                sx={{
                                    backgroundColor: "#0D4C8C",
                                    textTransform: "none",
                                    "&:hover": { backgroundColor: "#0A3D70" },
                                    whiteSpace: "nowrap",
                                    paddingX: "24px",
                                }}
                            >
                                โอนคืน
                            </Button>
                        </Box>
                        <ClaimFundStandardDataTable
                            name="refund"
                            columns={columns}
                            data={getRefundMonitorData?.data ?? []}
                            color="primary"
                            paginated={pagination}
                            setPaginated={setPaginated}
                            isLoading={isStatusSelected ? isGetRefundLoading : false}
                            delayNoMatch={false}
                            noMatchText={NOT_FOUND_MESSAGE}
                            options={{ responsive: isMobile ? "simple" : "standard" }}
                        />
                    </Paper>
                </Grid>
            </Grid>
        </>
    );
};

export default RefundDataTable;