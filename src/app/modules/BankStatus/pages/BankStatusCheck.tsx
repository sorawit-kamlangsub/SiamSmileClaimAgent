import { Grid } from "@mui/material";
import SearchFilterClaimForBank from "../components/SearchFilterClaimForBank";
import BankStatusCheckDataTable from "../components/BankStatusCheckDataTable";

const BankStatusCheck = () => {
    return (
        <div>
            <>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={12} md={12} lg={12}>
                        <SearchFilterClaimForBank />
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={12}>
                        <BankStatusCheckDataTable />
                    </Grid>
                </Grid>
            </>
        </div>
    );
};

export default BankStatusCheck;
