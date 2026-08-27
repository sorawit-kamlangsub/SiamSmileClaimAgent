import { Grid } from "@mui/material";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import SearchByBranchAndStatus from "../_common/SearchByBranchAndStatus";
import RefundDataTable from "../components/RefundDataTable";

const RefundPage = () => {
    const handleSearch = () => {};
    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={12} lg={12}>
                    <SearchByBranchAndStatus
                        buttonIcon={<CurrencyExchangeIcon />}
                        buttonText="โอนคืน"
                        onButtonClick={handleSearch}
                    />
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12}>
                    <RefundDataTable />
                </Grid>
            </Grid>
        </>
    );
};

export default RefundPage;
