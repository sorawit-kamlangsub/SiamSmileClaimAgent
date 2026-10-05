import { Box, Button, Grid, Typography } from "@mui/material";
import { useEffect } from "react";
import { StandardDataTable } from "../../../_common";
import useTransferSuccessTableHook from "../hooks/TransferSuccessTableHook";

type TransferSuccessTableProps = {
    statusId: number | undefined;
    searchDetail: string;
};

const TransferSuccessTable = ({ statusId, searchDetail }: TransferSuccessTableProps) => {
    const {
        column,
        data,
        isGetHospitalPendingTransferLoading,
        mutateGetHospitalPendingTransfer,
        paginate,
        setPaginate,
        fetchPendingTransfers,
    } = useTransferSuccessTableHook({ statusId: statusId });

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
                        <Typography sx={{ fontWeight: 700, color: "#1565C0" }}>โอนสำเร็จ</Typography>
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
                        />
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default TransferSuccessTable;
