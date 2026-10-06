import { Box, Grid } from "@mui/material";
import { useState } from "react";
import RefundApproveDataTable from "../components/RefundApproveDataTable";
import ApproveRefundDialog from "../components/ApproveRefundDialog";
import RefundSearchFilterForm, {
    RefundSearchFilterValues,
} from "../../Refund/_common/RefundSearchFilterForm";

const RefundApprovePage = () => {
    const [filter, setFilter] = useState<RefundSearchFilterValues | undefined>(undefined);
    const [hasSearched, setHasSearched] = useState(false);
    const [searchKey, setSearchKey] = useState(0);
    const [approveCaseRefundId, setApproveCaseRefundId] = useState<string | null>(null);
    const [viewCaseRefundId, setViewCaseRefundId] = useState<string | null>(null);

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
                        onEdit={(row) => setApproveCaseRefundId(row.caseRefundId ?? null)}
                        onView={(row) => setViewCaseRefundId(row.caseRefundId ?? null)}
                    />
                </Box>
            </Grid>
            <ApproveRefundDialog
                open={approveCaseRefundId !== null}
                caseRefundId={approveCaseRefundId}
                onClose={() => setApproveCaseRefundId(null)}
            />
            <ApproveRefundDialog
                mode="view"
                open={viewCaseRefundId !== null}
                caseRefundId={viewCaseRefundId}
                onClose={() => setViewCaseRefundId(null)}
            />
        </Grid>
    );
};

export default RefundApprovePage;
