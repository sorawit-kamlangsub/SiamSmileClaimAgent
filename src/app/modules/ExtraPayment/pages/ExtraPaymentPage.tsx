import { useEffect } from "react";
import { Grid, Box, CircularProgress } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import LinearLoading from "../../_common/components/CustomComponent/LinearLoading";
import { isProductType, PRODUCT_TYPE_GROUP } from "../../../functionHelpers";
import { ExtraPaymentPHpage } from "./ExtraPaymentPHpage";
import { ExtraPaymentPApage } from "./ExtraPaymentPApage";
import { useGetCpgExtraPaymentDetail } from "../hooks/useGetCpgExtraPaymentDetail";
import { setClaimItems } from "../store/extraPaymentSlice";
import { RootState } from "../../../../redux";

const ExtraPaymentPage: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const cpgNo = useSelector((state: RootState) => state.extraPayment.cpgNo);

    const { data, isLoading } = useGetCpgExtraPaymentDetail(cpgNo ?? undefined);

    useEffect(() => {
        if (!cpgNo) navigate("/payment-monitor", { replace: true });
    }, [cpgNo, navigate]);

    useEffect(() => {
        if (data) dispatch(setClaimItems(data.claimItems));
    }, [data, dispatch]);

    if (!cpgNo || isLoading || !data) {
        return (
            <Box display="flex" justifyContent="center" py={6}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <LinearLoading isLoading={false} sx={{ mb: "1.5rem" }}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    {
                        isProductType(data.productTypeId, PRODUCT_TYPE_GROUP.PH) ? (
                            <ExtraPaymentPHpage data={data} />
                        ) : isProductType(data.productTypeId, PRODUCT_TYPE_GROUP.PA) ? (
                            <ExtraPaymentPApage data={data} />
                        ) : isProductType(data.productTypeId, PRODUCT_TYPE_GROUP.CLAIM_MISC) ? null : null
                        // TODO: ยังไม่มีการ์ดสำหรับกลุ่ม CLAIM_MISC (มอเตอร์/บ้าน/ไฟ ฯลฯ)
                    }
                </Grid>
            </Grid>
        </LinearLoading>
    );
};

export default ExtraPaymentPage;
