import { Box, Button, Grid, Typography } from "@mui/material";
import useGenerateGroupTransferHook from "../hooks/GenerateGroupTransferHook";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import { StandardDataTable } from "../../../_common";

type GenerateGroupTableProps = {
    statusId: number | undefined;
    searchDetail: string;
};

const GenerateGroupTable = ({ statusId, searchDetail }: GenerateGroupTableProps) => {
    const {
        getHospitalTransferData,
        column,
        pagination,
        isGetHospitalTransferLoading,
        setPaginate,
        handleRowSelected,
        handleGenerateSuccess,
        onRowsSelected,
    } = useGenerateGroupTransferHook({ statusId: statusId, searchDetail: searchDetail });

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
                        <Typography sx={{ fontWeight: 700, color: "#1565C0" }}>รายการเคลมที่พร้อมสร้างกลุ่ม</Typography>
                    </Grid>
                    <Grid item xs={0} sm={0} md={3} lg={3}></Grid>
                    <Grid item xs={0} sm={0} md={3} lg={3}></Grid>
                    <Grid item xs={6} sm={6} md={3} lg={3} sx={{ textAlign: "end" }}>
                        <Button
                            variant="contained"
                            disabled={onRowsSelected?.length === 0}
                            onClick={handleGenerateSuccess}
                            sx={{
                                borderRadius: 2,
                                bgcolor: "#F9B91F",
                                color: "#000000",
                                width: "50%",
                                "&:hover": {
                                    bgcolor: "#bd8912",
                                },
                            }}
                            startIcon={<AutoAwesomeOutlinedIcon />}
                        >
                            Generate Group
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={12}>
                        <StandardDataTable
                            name="generate"
                            columns={column}
                            data={getHospitalTransferData?.data ?? []}
                            isLoading={isGetHospitalTransferLoading}
                            color="primary"
                            paginated={pagination}
                            setPaginated={setPaginate}
                            rowsSelected={onRowsSelected}
                            onRowSelectedIndex={handleRowSelected}
                            options={{ selectableRows: "multiple" }}
                        />
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default GenerateGroupTable;
