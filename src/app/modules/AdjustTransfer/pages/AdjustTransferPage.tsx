import { Grid } from "@mui/material";
import AddCardIcon from "@mui/icons-material/AddCard";
import SearchByBranchAndStatus from "../../Refund/_common/SearchByBranchAndStatus";
import AdjustTransferDataTable from "../components/AdjustTransferDataTable";

const AdjustTransferPage = () => {
    const handleSearch = () => {};
    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={12} lg={12}>
                    <SearchByBranchAndStatus
                        buttonIcon={<AddCardIcon />}
                        buttonText="โอนเพิ่ม"
                        onButtonClick={handleSearch}
                    />
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12}>
                    <AdjustTransferDataTable />
                </Grid>
            </Grid>
        </>
    );
};

export default AdjustTransferPage;
