import React, { useEffect } from "react";
import { Grid, LinearProgress } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../../../redux";
import { setInsured, setSchool, setBankAccounts, setContacts } from "../../../store/claimPASlice";
import InsuredInfoSection from "../../../components/CreateClaim/ClaimPA/InsuredInfoSection";
import { mockBankAccountsPA, mockContactsPA, mockSchoolPA } from "../../../store/mockClaimPH";
import ClaimPAFormSection from "../../../components/CreateClaim/ClaimPA/ClaimPAFormSection";
import { useGetCustomerDetailById } from "../../../../../api/coreClaimApi";
import ClaimHistoryPASection from "../../../components/CreateClaim/ClaimPA/ClaimHistoryPASection";

const ClaimPAPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { refId } = useParams();
    const customerId = refId ? parseInt(atob(refId)) : undefined;
    const { data: claimInfo, isLoading: claimInfoLoading } = useGetCustomerDetailById(customerId as number);
    // ── Load mock data ตอน mount ──────────────────────────────
    useEffect(() => {
        if (!claimInfo?.data || claimInfoLoading) return;

        dispatch(setInsured(claimInfo.data));
        dispatch(setSchool(mockSchoolPA));
        dispatch(setBankAccounts(mockBankAccountsPA));
        dispatch(setContacts(mockContactsPA));
    }, [dispatch, claimInfo?.data]);
    // ─────────────────────────────────────────────────────────

    return (
        <Grid container spacing={1}>
            {/* ── ข้อมูลผู้เอาประกัน | ประวัติการเคลม ── */}
            {claimInfoLoading ? (
                <LinearProgress />
            ) : (
                <>
                    <Grid item xs={12} md={5}>
                        {<InsuredInfoSection data={claimInfo?.data} onEdit={() => navigate("/monitor-claim")} />}
                    </Grid>

                    <Grid item xs={12} md={7}>
                        <ClaimHistoryPASection />
                    </Grid>

                    {/* ── บันทึกข้อมูลเคลม ── */}
                    <Grid item xs={12}>
                        <ClaimPAFormSection onNext={() => navigate(`/claim/pa/${refId}/summary`)} />
                    </Grid>
                </>
            )}
        </Grid>
    );
};

export default ClaimPAPage;
