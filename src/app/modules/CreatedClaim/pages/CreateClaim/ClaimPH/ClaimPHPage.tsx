import React, { useEffect } from "react";
import { Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../../../redux";
import {
    claimPHSelector,
    setBankAccounts,
    setContacts,
    setInsured,
    setIsContinuous,
    setOldClaim,
    toggleOldClaimHidden,
} from "../../../store/claimPHSlice";
import { mockBankAccounts, mockContacts, mockInsuredPH, mockOldClaim } from "../../../store/mockClaimPH";
import InsuredInfoCardPH from "../../../components/CreateClaim/ClaimPH/InsuredInfoCardPH";
import OldClaimSection from "../../../components/CreateClaim/ClaimPH/OldClaimSection";
import ClaimFormSection from "../../../components/CreateClaim/ClaimPH/ClaimFormSection";
import CustomBox from "../../../../_common/components/CustomComponent/CustomBox";
import ClaimHistoryTable from "../../../components/Monitor/ClaimHistoryTable";
import { useMonitorClaimHistory } from "../../../hooks/Monitor/useMonitorClaimHistory";

const ClaimPHPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { isContinuous, oldClaim, insured } = useAppSelector(claimPHSelector);
    const { handleContinuousClaim } = useMonitorClaimHistory();

    useEffect(() => {
        const continuous = true;
        dispatch(setIsContinuous(continuous));
        dispatch(setOldClaim(continuous ? mockOldClaim : null));
        dispatch(setInsured(mockInsuredPH));
        dispatch(setBankAccounts(mockBankAccounts));
        dispatch(setContacts(mockContacts));
    }, []);

    if (!insured) return null;

    return (
        <Grid container spacing={2}>
            {/* ข้อมูลผู้เอาประกัน | ประวัติการเคลม */}
            <Grid item xs={12} md={4}>
                <InsuredInfoCardPH data={insured} onEdit={() => navigate("/monitor")} />
            </Grid>
            <Grid item xs={12} md={8}>
                <CustomBox sx={{ minHeight: 284 }}>
                    <ClaimHistoryTable tableId="ClaimHistoryPHTable" onContinuousClaim={handleContinuousClaim} />
                </CustomBox>
            </Grid>

            {/* ข้อมูลเคลมเดิม เฉพาะ continuous */}
            {isContinuous && oldClaim && (
                <Grid item xs={12}>
                    <OldClaimSection data={oldClaim} onToggleHidden={() => dispatch(toggleOldClaimHidden())} />
                </Grid>
            )}
            <Grid item xs={12}>
                <ClaimFormSection onNext={() => navigate("/claim/ph/summary")} />
            </Grid>
        </Grid>
    );
};

export default ClaimPHPage;
