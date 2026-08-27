import { Grid } from "@mui/material";
import SearchFilter from "../components/SearchFilter";
import ManageTransferRepayDataTable from "../components/ManageTransferRepayDataTable";

const RepayPage = () => {
    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={12} lg={12}>
                    <SearchFilter />
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12}>
                    <ManageTransferRepayDataTable />
                </Grid>
            </Grid>
        </>
    );
};

export default RepayPage;
