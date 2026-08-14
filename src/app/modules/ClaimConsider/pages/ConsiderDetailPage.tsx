import { Grid } from "@mui/material";
import HeaderDetails from "../components/ConsiderDetails/HeaderDetails";

const ConsiderDetailPage = () => {
    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={12} lg={12}>
                    <HeaderDetails />
                </Grid>
            </Grid>
        </>
    );
};

export default ConsiderDetailPage;
