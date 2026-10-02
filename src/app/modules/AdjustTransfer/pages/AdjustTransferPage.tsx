import { Grid } from "@mui/material";
import AddCardIcon from "@mui/icons-material/AddCard";
import SearchByBranchAndStatus from "../../Refund/_common/SearchByBranchAndStatus";
import AdjustTransferDataTable from "../components/AdjustTransferDataTable";
import DialogSearchClaim from "../../DialogSearchByClaimOrCase/components/DialogSearchClaim";
import { useAppDispatch } from "../../../../redux";
import { setIsOpenDialog } from "../../Refund/store/refundSlice";
import BankEditDetailDialog from "../components/BankEditDetailDialog";

const AdjustTransferPage = () => {
    const dispatch = useAppDispatch();
    const handleSearch = () => {
        dispatch(setIsOpenDialog({ isOpen: true }));
    };
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

            <DialogSearchClaim buttonText="โอนเพิ่ม" />
            <BankEditDetailDialog />
        </>
    );
};

export default AdjustTransferPage;
