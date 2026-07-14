import React, { useEffect } from "react";
import { Grid, LinearProgress } from "@mui/material";
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
import LinearLoading from "../../../../_common/components/CustomComponent/LinearLoading";
import {
    useGetContactPerson,
    useGetCustomerBankAccount,
    useGetCustomerDetailById,
} from "../../../../../api/coreClaimApi";
import ClaimHistoryCard from "../../../components/CreateClaim/ClaimHistoryCard";

const ClaimPHPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { appId, refId } = useParams();

    const customerId = refId ? parseInt(atob(refId)) : undefined;
    const applicationId = appId ? atob(appId) : undefined;

    const { isContinuous, oldClaim } = useAppSelector(claimPHSelector);

    const { data: claimInfo, isLoading: claimInfoLoading } = useGetCustomerDetailById(customerId as number);
    const { data: bankAccount, isLoading: bankAccountLoading } = useGetCustomerBankAccount(applicationId);
    const { data: contact, isLoading: contactLoading } = useGetContactPerson(applicationId || "", 6);
    const isLoading = claimInfoLoading || bankAccountLoading || contactLoading;
    useEffect(() => {
        if (!claimInfo?.data || isLoading) return;

        const continuous = true;

        dispatch(setInsured(claimInfo.data));

        dispatch(setOldClaim(continuous ? mockOldClaim : undefined));
        dispatch(setBankAccounts(bankAccount?.data || []));
        dispatch(setContacts(contact?.data || []));
    }, [claimInfo?.data, bankAccount?.data, contact?.data, isLoading, dispatch]);

    if (isLoading) return <LinearLoading isLoading={isLoading} />;

    return (
        <Grid container spacing={2}>
            {/* ข้อมูลผู้เอาประกัน | ประวัติการเคลม */}

            {isLoading ? (
                <LinearProgress />
            ) : (
                <>
                    <Grid item xs={12} md={4}>
                        <InsuredInfoCardPH data={claimInfo?.data} onEdit={() => navigate("/monitor-claim")} />
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
                </>
            )}
        </Grid>
    );
};

export default ClaimPHPage;
