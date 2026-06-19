import React, { useEffect } from "react";
import { Grid } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../../../redux";
import {
    claimPHSelector,
    setBankAccounts,
    setContacts,
    setInsured,
    setOldClaim,
    toggleOldClaimHidden,
} from "../../../store/claimPHSlice";
import { mockBankAccounts, mockContacts, mockOldClaim } from "../../../store/mockClaimPH";
import InsuredInfoCardPH from "../../../components/CreateClaim/ClaimPH/InsuredInfoCardPH";
import OldClaimSection from "../../../components/CreateClaim/ClaimPH/OldClaimSection";
import ClaimFormSection from "../../../components/CreateClaim/ClaimPH/ClaimFormSection";
import ClaimHistoryCardPH from "../../../components/CreateClaim/ClaimPH/ClaimHistoryCardPH";
import { useGetCustomerDetailById } from "../../../../../api/claimAgentApi";
import LinearLoading from "../../../../_common/components/CustomComponent/LinearLoading";

const ClaimPHPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { refId } = useParams();

    const customerId = refId ? parseInt(atob(refId)) : undefined;

    const { isContinuous, oldClaim, insured } = useAppSelector(claimPHSelector);

    const { data: claimInfo, isLoading: claimInfoLoading } = useGetCustomerDetailById(customerId as number);

    useEffect(() => {
        if (!claimInfo?.data || claimInfoLoading) return;

        const continuous = true;

        dispatch(setInsured(claimInfo.data));

        dispatch(setOldClaim(continuous ? mockOldClaim : undefined));
        dispatch(setBankAccounts(mockBankAccounts));
        dispatch(setContacts(mockContacts));
    }, [claimInfo?.data, claimInfoLoading]);

    if (claimInfoLoading) return <LinearLoading isLoading={claimInfoLoading} />;

    return (
        <Grid container spacing={2}>
            {/* ข้อมูลผู้เอาประกัน | ประวัติการเคลม */}
            <Grid item xs={12} md={4}>
                <InsuredInfoCardPH data={insured} onEdit={() => navigate("/monitor")} />
            </Grid>
            <Grid item xs={12} md={8}>
                <ClaimHistoryCardPH />
            </Grid>

            {/* ข้อมูลเคลมเดิม เฉพาะ continuous */}
            {isContinuous && oldClaim && (
                <Grid item xs={12}>
                    <OldClaimSection data={oldClaim} onToggleHidden={() => dispatch(toggleOldClaimHidden())} />
                </Grid>
            )}
            <Grid item xs={12}>
                <ClaimFormSection onNext={() => navigate(`/claim/ph/${refId}/summary`)} />
            </Grid>
        </Grid>
    );
};

export default ClaimPHPage;
