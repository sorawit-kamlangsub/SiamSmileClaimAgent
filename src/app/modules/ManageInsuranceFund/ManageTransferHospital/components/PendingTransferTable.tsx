import { Box, Button, Grid, Typography } from "@mui/material";
import PaymentsIcon from "@mui/icons-material/Payments";
import { StandardDataTable } from "../../../_common";
import { useEffect } from "react";
import usePendingTransferHook from "../hooks/PendingTransferHook";

type PendingTransferTableProps = {
    statusId: number | undefined;
    searchDetail: string;
};

const PendingTransferTable = ({ statusId, searchDetail }: PendingTransferTableProps) => {
    const {
        column,
        data,
        handleRowSelected,
        handleSentTransfer,
        isGetHospitalPendingTransferLoading,
        mutateGetHospitalPendingTransfer,
        onRowsSelected,
        paginate,
        setPaginate,
        fetchPendingTransfers,
    } = usePendingTransferHook();

    useEffect(() => {
        if (statusId !== undefined) {
            fetchPendingTransfers({ statusId, hospitalName: searchDetail, paginate });
        }
    }, [statusId, searchDetail, paginate, mutateGetHospitalPendingTransfer]);
    return (
        <Box
            sx={{
                border: "1px solid #E0E0E0",
                borderRadius: "12px",
                backgroundColor: "#FFFFFF",
                padding: "20px 24px",
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <Grid container spacing={2}>
                    <Grid item xs={6} sm={6} md={3} lg={3}>
                        <Typography sx={{ fontWeight: 700, color: "#1565C0" }}>รอโอน</Typography>
                    </Grid>

                    <Grid item xs={12} sm={12} md={12} lg={12}>
                        <StandardDataTable
                            name="generate"
                            columns={column}
                            data={data?.data ?? []}
                            isLoading={isGetHospitalPendingTransferLoading}
                            color="primary"
                            paginated={paginate}
                            setPaginated={setPaginate}
                            rowsSelected={onRowsSelected}
                            onRowSelectedIndex={handleRowSelected}
                            options={{ selectableRows: "multiple" }}
                        />
                    </Grid>
                    <Grid item xs={0} sm={0} md={3} lg={4}></Grid>
                    <Grid item xs={0} sm={0} md={4} lg={4}></Grid>
                    <Grid item xs={12} sm={12} md={4} lg={4} sx={{ textAlign: "end" }}>
                        <Button
                            variant="contained"
                            disabled={onRowsSelected?.length === 0}
                            onClick={handleSentTransfer}
                            sx={{
                                borderRadius: 2,
                                bgcolor: "#087FBD",
                                color: "#FFFFFF",
                                width: "50%",
                                "&:hover": {
                                    bgcolor: "#05476b",
                                },
                            }}
                            startIcon={<PaymentsIcon />}
                        >
                            โอนทันที
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default PendingTransferTable;
