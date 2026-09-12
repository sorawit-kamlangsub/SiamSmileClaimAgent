import Box from "@mui/material/Box";
import { Backdrop, Button, CircularProgress, Grid } from "@mui/material";
import { useState } from "react";
import { useParams } from "react-router-dom";
import ClaimSummaryHeader from "../components/Adjust/DetailTab/ClaimSummaryHeader";
import ClaimDetailTabs from "../components/Adjust/DetailTab/ClaimDetailTabs";
import RefundItemsTable from "../components/Refund/DetailTab/RefundItemsTable";
import RefundRecordForm from "../components/Refund/DetailTab/RefundRecordForm";
import useManageRefundDetailHook from "../hooks/Refund/ManageRefundDetailHook";
import RefundTransactionDataTable from "../components/Refund/TransactionTab/RefundTransactionDataTable";
import RefundTransferHistory from "../components/Refund/HistoryTab/RefundTransferHistory";

const ManageRefundDetailPage = () => {
    const { id = "" } = useParams();
    const {
        formik,
        summary,
        isDetailLoading,
        reasonOptions,
        reasonOptionIsLoading,
        transferTypeOptions,
        transferTypeOptionIsLoading,
    } = useManageRefundDetailHook(id);
    const [activeTab, setActiveTab] = useState(0);

    if (isDetailLoading) {
        return (
            <Backdrop open={isDetailLoading || reasonOptionIsLoading} style={{ zIndex: 9999 }}>
                <CircularProgress color="inherit" />
            </Backdrop>
        );
    }

    return (
        <Box>
            <ClaimDetailTabs activeTab={activeTab} onChange={setActiveTab} />
            {activeTab === 0 && (
                <Box sx={{ marginTop: "16px" }}>
                    <Grid container direction="column" spacing={2}>
                        <Grid item>
                            <ClaimSummaryHeader
                                claimDetails={summary}
                                onClNoClick={() => console.log("navigate to CL detail")}
                            />
                        </Grid>

                        <Grid item>
                            <RefundItemsTable formik={formik} />
                        </Grid>

                        <Grid item>
                            <RefundRecordForm
                                formik={formik}
                                reasonOptions={reasonOptions}
                                isLoadingDropdown={reasonOptionIsLoading}
                                transferTypeOptions={transferTypeOptions}
                                isTransferTypeLoading={transferTypeOptionIsLoading}
                            />
                        </Grid>

                        <Grid item sx={{ display: "flex", justifyContent: "flex-end", mr: 6 }}>
                            <Button
                                variant="contained"
                                onClick={() => formik.handleSubmit()}
                                sx={{
                                    backgroundColor: "#66BB6A",
                                    textTransform: "none",
                                    paddingX: "32px",
                                    "&:hover": { backgroundColor: "#4CAF50" },
                                }}
                            >
                                แจ้งคืนเงิน
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            )}
            {activeTab === 1 && (
                <Box sx={{ marginTop: "16px" }}>
                    <RefundTransactionDataTable caseId={id} />
                </Box>
            )}
            {activeTab === 2 && (
                <Box sx={{ marginTop: "16px" }}>
                    <RefundTransferHistory caseId={id} />
                </Box>
            )}
        </Box>
    );
};

export default ManageRefundDetailPage;