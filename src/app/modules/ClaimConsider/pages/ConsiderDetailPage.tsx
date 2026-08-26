import { Grid } from "@mui/material";
import HeaderDetails from "../components/ConsiderDetails/HeaderDetails";
import useConsiderDetailHook from "../hooks/ClaimConsiderDetail/ConsiderDetailHook";

const ConsiderDetailPage = () => {
    const { detailData, detailDataLoading, customerDetailData, customerDetailLoading } = useConsiderDetailHook();
    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={12} lg={12}>
                    <HeaderDetails
                        detailData={detailData}
                        customerDetailData={customerDetailData}
                        customerDetailLoading={customerDetailLoading}
                        detailDataLoading={detailDataLoading}
                    />
                </Grid>
            </Grid>
        </>
    );
};

export default ConsiderDetailPage;
