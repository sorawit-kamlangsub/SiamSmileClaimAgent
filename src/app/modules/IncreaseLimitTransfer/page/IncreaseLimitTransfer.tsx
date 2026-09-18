import { Box, Grid } from "@mui/material";
import { useState } from "react";
import ClaimSearchFilterForm, { ClaimSearchFilterValues } from "../_common/ClaimSearchFilterForm";
import ClaimDetailsDataTable from "../components/ClaimDetailsDataTable";
import IncreaseLimitDetailDialog from "../components/IncreaseLimitDetailDialog";
import { IncreaseTransferMonitorRow } from "../hooks/ClaimDetailsDataTableHook";

const IncreaseLimitTransfer = () => {
    const [filter, setFilter] = useState<ClaimSearchFilterValues | undefined>(undefined);
    const [hasSearched, setHasSearched] = useState(false);
    const [searchKey, setSearchKey] = useState(0);
    const [detailRow, setDetailRow] = useState<IncreaseTransferMonitorRow | null>(null);

    const handleSearch = (values: ClaimSearchFilterValues) => {
        setFilter(values);
        setHasSearched(true);
        setSearchKey((prevKey) => prevKey + 1);
    };

    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={12} lg={12}>
                    <ClaimSearchFilterForm onSubmit={handleSearch} />
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12}>
                    <Box
                        sx={{
                            border: "1px solid #E0E0E0",
                            borderRadius: "12px",
                            padding: "20px",
                            backgroundColor: "#FFFFFF",
                        }}
                    >
                        <ClaimDetailsDataTable
                            filter={filter}
                            hasSearched={hasSearched}
                            searchKey={searchKey}
                            onEdit={setDetailRow}
                        />
                    </Box>
                </Grid>
            </Grid>
            <IncreaseLimitDetailDialog open={detailRow !== null} row={detailRow} onClose={() => setDetailRow(null)} />
        </>
    );
};

export default IncreaseLimitTransfer;
