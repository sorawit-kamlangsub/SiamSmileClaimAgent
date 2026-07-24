import React from "react";
import { Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import InsuredInfoSection from "../../../components/CreateClaim/ClaimPA/InsuredInfoSection";
import ClaimPAFormSection from "../../../components/CreateClaim/ClaimPA/ClaimPAFormSection";
import ClaimHistoryCard from "../../../components/CreateClaim/ClaimHistoryCard";
import { useClaimPA } from "../../../hooks/CreateClaim/ClaimPA/useClaimPA";
import LinearLoading from "../../../../_common/components/CustomComponent/LinearLoading";
import OldClaimSection from "../../../components/CreateClaim/ClaimPH/OldClaimSection";
import { claimPASelector } from "../../../store/claimPASlice";
import { useAppSelector } from "../../../../../../redux";

const ClaimPAPage: React.FC = () => {
    const navigate = useNavigate();
    const { isContinuous, oldClaim } = useAppSelector(claimPASelector);
    const { appId, refId, applicationId, claimInfo, isLoading } = useClaimPA();  
    if (isLoading) return <LinearLoading isLoading={isLoading} />;
    // ─────────────────────────────────────────────────────────

    return (
        <Grid container spacing={1}>
            {/* ── ข้อมูลผู้เอาประกัน | ประวัติการเคลม ── */}
            <Grid item xs={12} md={5}>
                {<InsuredInfoSection data={claimInfo} onEdit={() => navigate("/monitor-claim")} />}
            </Grid>

            <Grid item xs={12} md={7}>
                <ClaimHistoryCard appId={applicationId} />
            </Grid>
            {/* ข้อมูลเคลมเดิม เฉพาะ continuous */}
            {isContinuous && oldClaim && (
                <Grid item xs={12}>
                    <OldClaimSection data={oldClaim} />
                </Grid>
            )}
            {/* ── บันทึกข้อมูลเคลม ── */}
            <Grid item xs={12}>
                <ClaimPAFormSection onNext={() => navigate(`/claim/pa/${appId}/${refId}/summary`)} />
            </Grid>
        </Grid>
    );
};

export default ClaimPAPage;
