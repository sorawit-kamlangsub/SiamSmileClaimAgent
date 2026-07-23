import React from "react";
import { Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../../../redux";
import { claimPHSelector, toggleOldClaimHidden } from "../../../store/claimPHSlice";
import InsuredInfoCardPH from "../../../components/CreateClaim/ClaimPH/InsuredInfoCardPH";
import OldClaimSection from "../../../components/CreateClaim/ClaimPH/OldClaimSection";
import ClaimFormSection from "../../../components/CreateClaim/ClaimPH/ClaimFormSection";
import LinearLoading from "../../../../_common/components/CustomComponent/LinearLoading";
import ClaimHistoryCard from "../../../components/CreateClaim/ClaimHistoryCard";
import { useClaimPH } from "../../../hooks/CreateClaim/ClaimPH/useClaimPH";

const ClaimPHPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { isContinuous, oldClaim } = useAppSelector(claimPHSelector);
    const { appId, refId, applicationId, claimInfo, isLoading } = useClaimPH();

    if (isLoading) return <LinearLoading isLoading={isLoading} />;

    return (
        <Grid container spacing={2}>
            {/* ข้อมูลผู้เอาประกัน | ประวัติการเคลม */}

            <Grid item xs={12} md={4}>
                <InsuredInfoCardPH data={claimInfo} onEdit={() => navigate("/monitor-claim")} />
            </Grid>
            <Grid item xs={12} md={8}>
                <ClaimHistoryCard appId={applicationId} />
            </Grid>

            {/* ข้อมูลเคลมเดิม เฉพาะ continuous */}
            {isContinuous && oldClaim && (
                <Grid item xs={12}>
                    <OldClaimSection data={oldClaim} onToggleHidden={() => dispatch(toggleOldClaimHidden())} />
                </Grid>
            )}
            <Grid item xs={12}>
                <ClaimFormSection onNext={() => navigate(`/claim/ph/${appId}/${refId}/summary`)} />
            </Grid>
        </Grid>
    );
};

export default ClaimPHPage;
