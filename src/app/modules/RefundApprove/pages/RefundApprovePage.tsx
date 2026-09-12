import { Box, Grid } from "@mui/material";
import { useState } from "react";
import RefundApproveDataTable from "../components/RefundApproveDataTable";
import RefundSearchFilterForm, {
    RefundSearchFilterValues,
} from "../../Refund/_common/RefundSearchFilterForm";

const RefundApprovePage = () => {
    const [filter, setFilter] = useState<RefundSearchFilterValues | undefined>(undefined);
    const [hasSearched, setHasSearched] = useState(false);
    const [searchKey, setSearchKey] = useState(0);

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
                    <RefundApproveDataTable filter={filter} hasSearched={hasSearched} searchKey={searchKey} />
                </Box>
            </Grid>
        </Grid>
    );
};

export default RefundApprovePage;