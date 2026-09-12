import Box from "@mui/material/Box";
import { Backdrop, Button, CircularProgress, Grid } from "@mui/material";
import { useState } from "react";
import ClaimSummaryHeader from "../components/Adjust/DetailTab/ClaimSummaryHeader";
import ClaimDetailTabs from "../components/Adjust/DetailTab/ClaimDetailTabs";
import TransferItemsTable from "../components/Adjust/DetailTab/TransferItemTable";
import useManageAdjustDetailHook from "../hooks/Adjust/ManageAdjustDetailHook";
import TransferRecordForm from "../components/Adjust/DetailTab/TransferRecordForm";
import { useParams } from "react-router-dom";
import ClamTransactionDataTable from "../components/Adjust/TransactionTab/ClamTransactionDataTable";
import TransferHistory from "../components/HistoryTransferTab/TransferHistory";

const ManageAdjustDetailPage = () => {
    const { id = "" } = useParams();
    const { formik, summary, account, isDetailLoading, reasonOptions, reasonOptionIsLoading, isAdjustLoading } =
        useManageAdjustDetailHook(id);
    const [activeTab, setActiveTab] = useState(0);

    if (isDetailLoading) {
        return (
            <Backdrop open={isDetailLoading || reasonOptionIsLoading || isAdjustLoading} style={{ zIndex: 9999 }}>
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
                            <TransferItemsTable formik={formik} />
                        </Grid>

                        <Grid item>
                            <TransferRecordForm
                                formik={formik}
                                account={account}
                                reasonOptions={reasonOptions}
                                isLoadingDropdown={reasonOptionIsLoading}
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
                                แจ้งโอนเงิน
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            )}
            {activeTab === 1 && (
                <Box sx={{ marginTop: "16px" }}>
                    <ClamTransactionDataTable caseId={id} />
                </Box>
            )}
            {activeTab === 2 && (
                <Box sx={{ marginTop: "16px" }}>
                    <TransferHistory />
                </Box>
            )}
        </Box>
    );
};

export default ManageAdjustDetailPage;
