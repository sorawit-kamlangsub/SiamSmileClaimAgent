import { Grid } from "@mui/material";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import SearchByBranchAndStatus from "../_common/SearchByBranchAndStatus";
import RefundDataTable from "../components/RefundDataTable";
import DialogSearchClaim from "../../DialogSearchByClaimOrCase/components/DialogSearchClaim";
import { useAppDispatch } from "../../../../redux";
import { setIsOpenDialog } from "../store/refundSlice";

const RefundPage = () => {
    const dispatch = useAppDispatch();
    const handleSearch = () => {
        dispatch(setIsOpenDialog({ isOpen: true }));
    };
    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={12} lg={12}>
                    <SearchByBranchAndStatus
                        buttonIcon={<CurrencyExchangeIcon />}
                        buttonText="โอนคืน"
                        statusSource="refund"
                        onButtonClick={handleSearch}
                        floatingButton
                    />
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12}>
                    <RefundDataTable />
                </Grid>
            </Grid>
            <DialogSearchClaim buttonText="โอนคืน" showRefundStatusHint searchLabel="กรุณากรอกเลขที่ CL / CC*" />
        </>
    );
};

export default RefundPage;
