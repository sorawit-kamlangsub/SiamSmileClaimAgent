import React, { useEffect } from "react";
import { Grid } from "@mui/material";
import { useParams } from "react-router-dom";
import { checkeligibleSelector, resetSearchCheckeLigibleDetails } from "../store/checkeligibleSlice";
import { useDispatch, useSelector } from "react-redux";
import SearchToolbar from "../components/SearchToolbar";
import CoverageSummaryPanel from "../components/CoverageSummaryPanel";
import InsuredInfoCardPA from "../components/InsuredInfoCardPA";
import { useGetCustomerBenefitDetailSearch, useGetCustomerDetailById } from "../../../api/coreClaimApi";
import LinearLoading from "../../_common/components/CustomComponent/LinearLoading";
import InsuredInfoCardPH from "../components/InsuredInfoCardPH";
import { isProductType, PRODUCT_TYPE_GROUP } from "../../../functionHelpers";
import PolicyBenefitSharedPanel from "../components/PolicyBenefitSharedPanel";

const CheckEligibleDetailPage: React.FC = () => {
    const { cusId } = useParams<{ cusId: string }>();
    const dispatch = useDispatch();

    const decodedCusId = cusId ? atob(cusId) : undefined;

    const customerId = decodedCusId ? parseInt(decodedCusId) : 0;

    const { CheckeLigibleDetails, isSearchCheckeLigibleDetails } = useSelector(checkeligibleSelector);

    const { data: customerDetail, isLoading: customerDetailLoading } = useGetCustomerDetailById(customerId);

    const { data: benefitData, isLoading: isBenefitLoading } = useGetCustomerBenefitDetailSearch(
        customerDetail?.data?.policyCode,
        CheckeLigibleDetails.incidentDate ?? undefined,
        CheckeLigibleDetails.isContinuous ?? undefined,
        CheckeLigibleDetails.claimCause,
        CheckeLigibleDetails.coverageType,
        CheckeLigibleDetails.medicalType,
        CheckeLigibleDetails.continuousClaim?.claimNo ?? undefined,
        customerDetail?.data?.productTypeId === 26 ? customerDetail?.data?.customerTypeCode : undefined
    );

    const productId = customerDetail?.data?.productTypeId ?? 0;
    const productCategoryCode = customerDetail?.data?.productCategoryCode;
    const applicationId = customerDetail?.data?.policyCode;

    useEffect(() => {
        return () => {
            dispatch(resetSearchCheckeLigibleDetails());
        };
    }, [dispatch]);

    return (
        <LinearLoading isLoading={customerDetailLoading} sx={{ mb: "1.5rem" }}>
            <Grid container spacing={2}>
                <Grid item xs={12} md={5} lg={4}>
                    {!!customerDetail?.data ? (
                        isProductType(productId, PRODUCT_TYPE_GROUP.PH) ? (
                            <InsuredInfoCardPH data={customerDetail?.data} />
                        ) : isProductType(productId, PRODUCT_TYPE_GROUP.PA) ? (
                            <InsuredInfoCardPA data={customerDetail?.data} />
                        ) : isProductType(productId, PRODUCT_TYPE_GROUP.CLAIM_MISC) ? null : null // TODO: ยังไม่มีการ์ดสำหรับกลุ่ม CLAIM_MISC (มอเตอร์/บ้าน/ไฟ ฯลฯ) — ใส่ component ที่ถูกต้องตรงนี้เมื่อพร้อม
                    ) : null}
                </Grid>

                <Grid item xs={12} md={7} lg={8}>
                    <SearchToolbar
                        productTypeId={productId}
                        productCategoryCode={productCategoryCode}
                        applicationId={applicationId}
                        customerId={customerDetail?.data?.customerId}
                        coverageFrom={customerDetail?.data?.coverageFrom}
                        coverageTo={customerDetail?.data?.coverageTo}
                    />
                    {!isSearchCheckeLigibleDetails ? null : (
                        <CoverageSummaryPanel
                            benefitData={benefitData?.data}
                            isLoading={isBenefitLoading}
                            applicationId={applicationId}
                        />
                    )}
                    {isProductType(productId, PRODUCT_TYPE_GROUP.PA) && (
                        <PolicyBenefitSharedPanel
                            applicationId={applicationId}
                            customerTypeCode={customerDetail?.data?.customerTypeCode}
                        />
                    )}
                </Grid>
            </Grid>
        </LinearLoading>
    );
};

export default CheckEligibleDetailPage;
