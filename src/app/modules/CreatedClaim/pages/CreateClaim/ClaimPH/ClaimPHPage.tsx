import React, { useEffect } from "react";
import { Box, Grid } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../../../redux";
import { claimPHSelector, setOldClaim } from "../../../store/claimPHSlice";
import InsuredInfoCardPH from "../../../components/CreateClaim/ClaimPH/InsuredInfoCardPH";
import OldClaimSection from "../../../components/CreateClaim/ClaimPH/OldClaimSection";
import ClaimFormSection from "../../../components/CreateClaim/ClaimPH/ClaimFormSection";
import LinearLoading from "../../../../_common/components/CustomComponent/LinearLoading";
import ClaimHistoryCard from "../../../components/CreateClaim/ClaimHistoryCard";
import { useClaimPH } from "../../../hooks/CreateClaim/ClaimPH/useClaimPH";
import ClaimStickyHeader from "../../../components/CreateClaim/ClaimStickyHeader";
import { useGetPreviousClaim } from "../../../../../api/coreClaimApi";

const ClaimPHPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { isContinuous: isContinuousParam, oldClaimId: oldClaimIdEncode } = useParams();
    const isContinuous = isContinuousParam ? atob(isContinuousParam) === "true" : false;
    const realOldClaimId = isContinuous && oldClaimIdEncode ? atob(oldClaimIdEncode) : undefined;

    const { oldClaim } = useAppSelector(claimPHSelector);
    const { appId, refId, applicationId, claimInfo, isLoading } = useClaimPH();

    const { data: previousClaimData } = useGetPreviousClaim(realOldClaimId ?? "");
    const previousClaim = previousClaimData?.data;

    useEffect(() => {
        if (previousClaim) {
            dispatch(setOldClaim(previousClaim));
        }
    }, [previousClaim, dispatch]);

    if (isLoading) return <LinearLoading isLoading={isLoading} />;

    return (
        <>
            <Box>
                <ClaimStickyHeader data={claimInfo} />
                <Grid container spacing={2} mt={1.5}>
                    {/* ข้อมูลผู้เอาประกัน | ประวัติการเคลม */}
                    <Grid item xs={12} md={4}>
                        <InsuredInfoCardPH data={claimInfo} />
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <ClaimHistoryCard appId={applicationId} />
                    </Grid>

                    {/* ข้อมูลเคลมเดิม เฉพาะ continuous */}
                    {isContinuous && oldClaim && (
                        <Grid item xs={12}>
                            <OldClaimSection data={previousClaim} />
                        </Grid>
                    )}
                    <Grid item xs={12}>
                        <ClaimFormSection
                            onNext={() =>
                                navigate(
                                    `/claim/ph/${appId}/${refId}/${isContinuousParam ?? ""}/${
                                        oldClaimIdEncode ?? ""
                                    }/summary`
                                )
                            }
                        />
                    </Grid>
                </Grid>
            </Box>
        </>
    );
};

export default ClaimPHPage;
