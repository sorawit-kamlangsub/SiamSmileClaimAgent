import { Box, Grid } from "@mui/material";
import { useState } from "react";
import RefundApproveDataTable from "../components/RefundApproveDataTable";
import ApproveRefundDialog from "../components/ApproveRefundDialog";
import { RefundApproveMonitorRow } from "../hooks/RefundApproveDataTableHook";
import RefundSearchFilterForm, {
    RefundSearchFilterValues,
} from "../../Refund/_common/RefundSearchFilterForm";

const RefundApprovePage = () => {
    const [filter, setFilter] = useState<RefundSearchFilterValues | undefined>(undefined);
    const [hasSearched, setHasSearched] = useState(false);
    const [searchKey, setSearchKey] = useState(0);
    const [approveRow, setApproveRow] = useState<RefundApproveMonitorRow | null>(null);
    const [viewRow, setViewRow] = useState<RefundApproveMonitorRow | null>(null);

    const handleSearch = (values: RefundSearchFilterValues) => {
        setFilter(values);
        setHasSearched(true);
        setSearchKey((prevKey) => prevKey + 1);
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={12} lg={12}>
                <RefundSearchFilterForm onSubmit={handleSearch} />
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
                    <RefundApproveDataTable
                        filter={filter}
                        hasSearched={hasSearched}
                        searchKey={searchKey}
                        onEdit={setApproveRow}
                        onView={setViewRow}
                    />
                </Box>
            </Grid>
            <ApproveRefundDialog open={approveRow !== null} row={approveRow} onClose={() => setApproveRow(null)} />
            <ApproveRefundDialog
                mode="view"
                open={viewRow !== null}
                row={viewRow}
                onClose={() => setViewRow(null)}
            />
        </Grid>
    );
};

export default RefundApprovePage;