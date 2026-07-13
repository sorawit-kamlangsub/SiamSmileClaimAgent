import React, { useEffect } from "react";
import { Grid, LinearProgress } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch } from "../../../../../../redux";
import { setInsured, setSchool, setBankAccounts, setContacts, SchoolInfo } from "../../../store/claimPASlice";
import InsuredInfoSection from "../../../components/CreateClaim/ClaimPA/InsuredInfoSection";
import { mockSchoolPA } from "../../../store/mockClaimPH";
import ClaimPAFormSection from "../../../components/CreateClaim/ClaimPA/ClaimPAFormSection";
import {
    useGetContactPerson,
    useGetCustomerBankAccount,
    useGetCustomerDetailById,
} from "../../../../../api/coreClaimApi";
import ClaimHistoryCard from "../../../components/CreateClaim/ClaimHistoryCard";

const ClaimPAPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { appId, refId } = useParams();

    const customerId = refId ? parseInt(atob(refId)) : undefined;
    const applicationId = appId ? atob(appId) : undefined;
    const { data: claimInfo, isLoading: claimInfoLoading } = useGetCustomerDetailById(customerId as number);
    const { data: bankAccount, isLoading: bankAccountLoading } = useGetCustomerBankAccount(applicationId);
    const { data: contact, isLoading: contactLoading } = useGetContactPerson(applicationId || "", 26);
    const isLoading = claimInfoLoading || bankAccountLoading || contactLoading;
    // ── Load data ตอน mount ──────────────────────────────
    useEffect(() => {
        if (!claimInfo?.data || isLoading) return;

        const schoolInfo: SchoolInfo = {
            appId: claimInfo.data.policyCode ?? "",
            schoolName: claimInfo.data.schoolName ?? "",
            teacherName: claimInfo.data.contactName ?? "",
            teacherPhone: claimInfo.data.contactPhoneNo ?? "",
        };

        dispatch(setInsured(claimInfo.data));
        dispatch(setSchool(schoolInfo));
        dispatch(setBankAccounts(bankAccount?.data || []));
        dispatch(setContacts(contact?.data || []));
    }, [claimInfo?.data, bankAccount?.data, contact?.data, isLoading, dispatch]);
    // ─────────────────────────────────────────────────────────

    return (
        <Grid container spacing={1}>
            {/* ── ข้อมูลผู้เอาประกัน | ประวัติการเคลม ── */}
            {isLoading ? (
                <LinearProgress />
            ) : (
                <>
                    <Grid item xs={12} md={5}>
                        {<InsuredInfoSection data={claimInfo?.data} onEdit={() => navigate("/monitor-claim")} />}
                    </Grid>

                    <Grid item xs={12} md={7}>
                        <ClaimHistoryCard appId={applicationId} />
                    </Grid>

                    {/* ── บันทึกข้อมูลเคลม ── */}
                    <Grid item xs={12}>
                        <ClaimPAFormSection onNext={() => navigate(`/claim/pa/${appId}/${refId}/summary`)} />
                    </Grid>
                </>
            )}
        </Grid>
    );
};

export default ClaimPAPage;
