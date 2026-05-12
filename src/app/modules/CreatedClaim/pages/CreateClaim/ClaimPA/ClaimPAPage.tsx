import React, { useEffect } from "react";
import { Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../../../redux";
import { setInsured, setSchool, setBankAccounts, setContacts } from "../../../store/claimPASlice";
import InsuredInfoSection from "../../../components/CreateClaim/ClaimPA/InsuredInfoSection";
import { mockBankAccountsPA, mockContactsPA, mockInsuredPA, mockSchoolPA } from "../../../store/mockClaimPH";
import ClaimPAFormSection from "../../../components/CreateClaim/ClaimPA/ClaimPAFormSection";
import ClaimHistoryTable from "../../../components/Monitor/ClaimHistoryTable";
import CustomBox from "../../../../_common/components/CustomComponent/CustomBox";

interface Props {
    // onNext: () => void;
}

const ClaimPAPage: React.FC<Props> = ({}) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { insured } = useAppSelector((s) => s.claimpa);
    const onNext: () => void = () => {
        navigate("/claim/pa/summary");
    };

    // ── Load mock data ตอน mount ──────────────────────────────
    useEffect(() => {
        dispatch(setInsured(mockInsuredPA));
        dispatch(setSchool(mockSchoolPA));
        dispatch(setBankAccounts(mockBankAccountsPA));
        dispatch(setContacts(mockContactsPA));
    }, [dispatch]);
    // ─────────────────────────────────────────────────────────

    return (
        <Grid container spacing={1}>
            {/* ── ข้อมูลผู้เอาประกัน | ประวัติการเคลม ── */}
            <Grid item xs={12} md={5}>
                {insured && <InsuredInfoSection data={insured} onEdit={() => navigate("/monitor")} />}
            </Grid>

            <Grid item xs={12} md={7}>
                <CustomBox sx={{ minHeight: { lg: 360 }, overflowY: "auto" }}>
                    <ClaimHistoryTable tableId="ClaimHistoryPATable" onContinuousClaim={() => {}} />
                </CustomBox>
            </Grid>

            {/* ── บันทึกข้อมูลเคลม ── */}
            <Grid item xs={12}>
                <ClaimPAFormSection onNext={onNext} />
            </Grid>
        </Grid>
    );
};

export default ClaimPAPage;
