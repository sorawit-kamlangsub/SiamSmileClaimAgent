import React, { useCallback, useEffect } from "react";
import { Box, Grid } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import InsuredInfoSection from "../../../components/CreateClaim/ClaimPA/InsuredInfoSection";
import ClaimPAFormSection from "../../../components/CreateClaim/ClaimPA/ClaimPAFormSection";
import ClaimHistoryCard from "../../../components/CreateClaim/ClaimHistoryCard";
import { useClaimPA } from "../../../hooks/CreateClaim/ClaimPA/useClaimPA";
import LinearLoading from "../../../../_common/components/CustomComponent/LinearLoading";
import OldClaimSection from "../../../components/CreateClaim/ClaimPH/OldClaimSection";
import { claimPASelector, resetState, setOldClaim } from "../../../store/claimPASlice";
import { useAppDispatch, useAppSelector } from "../../../../../../redux";
import ClaimStickyHeader from "../../../components/CreateClaim/ClaimStickyHeader";
import { useGetPreviousClaim } from "../../../../../api/coreClaimApi";

const ClaimPAPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { isContinuous: isContinuousParam } = useParams();
    const isContinuous = isContinuousParam ? atob(isContinuousParam) === "true" : false;
    const { oldClaim, insured } = useAppSelector(claimPASelector);
    const {
        appId,
        refId,
        applicationId,
        claimInfo,
        isLoading,
        isContinuous: isContinuousEncode,
        oldClaimId: oldClaimIdEncode,
    } = useClaimPA();

    const realOldClaimId = isContinuous && oldClaimIdEncode ? atob(oldClaimIdEncode) : undefined;
    const { data: previousClaimData } = useGetPreviousClaim(realOldClaimId ?? "");
    const previousClaim = previousClaimData?.data;

    useEffect(() => {
        if (previousClaim) {
            dispatch(setOldClaim(previousClaim));
        }
    }, [previousClaim, dispatch]);

    useEffect(() => {
        if (insured?.policyCode && applicationId && insured.policyCode !== applicationId) {
            dispatch(resetState());
        }
    }, [applicationId]);

    const handleNext = useCallback(() => {
        navigate(`/claim/pa/${appId}/${refId}/${isContinuousEncode}/${oldClaimIdEncode}/summary`);
    }, [navigate, appId, refId, isContinuousEncode, oldClaimIdEncode]);

    if (isLoading) return <LinearLoading isLoading={isLoading} />;
    return (
        <Box>
            <ClaimStickyHeader data={claimInfo} />
            <Grid container spacing={1} mt={1.5}>
                <Grid item xs={12} md={4.5}>
                    {<InsuredInfoSection data={claimInfo} onEdit={() => navigate("/monitor-claim")} />}
                </Grid>
                <Grid item xs={12} md={7.5}>
                    <ClaimHistoryCard appId={applicationId} />
                </Grid>
                {isContinuous && oldClaim && (
                    <Grid item xs={12}>
                        <OldClaimSection data={oldClaim} />
                    </Grid>
                )}
                <Grid item xs={12}>
                    <ClaimPAFormSection onNext={handleNext} />
                </Grid>
            </Grid>
        </Box>
    );
};

export default ClaimPAPage;
