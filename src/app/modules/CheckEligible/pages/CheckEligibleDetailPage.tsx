import React, { useEffect } from "react";
import { Grid } from "@mui/material";
import { useParams } from "react-router-dom";
import PersonalExclusionCard from "../components/CheckEligibleDetail/PersonalExclusionCard";
import PolicyConditionCard from "../components/CheckEligibleDetail/PolicyConditionCard";
import { PAInsuredInfo, PersonalExclusionNote } from "../hooks/CheckEligibleDetail/useCheckEligibleDetail";
import {
    checkeligibleSelector,
    resetSearchCheckeLigibleDetails,
    toggleContinuousClaimSelection,
} from "../store/checkeligibleSlice";
import { useDispatch, useSelector } from "react-redux";
import SearchToolbar from "../components/CheckEligibleDetail/SearchToolbar";
import CoverageSummaryPanel from "../components/CheckEligibleDetail/CoverageSummaryPanel";
import InsuredInfoCardPA from "../components/CheckEligibleDetail/InsuredInfoCardPA";
import { useGetCustomerBenefitDetailSearch } from "../../../api/coreClaimApi";
// import InsuredInfoCardPH from "../components/CheckEligibleDetail/InsuredInfoCardPH";

export const mockPAInsuredInfo: PAInsuredInfo = {
    applicationId: "69240003",
    academicYear: 2569,
    schoolName: "โรงเรียนแม่พิทยาภูมิ",
    subDistrict: "คลองหลวงแพ่ง",
    district: "เมืองฉะเชิงเทรา",
    province: "ฉะเชิงเทรา",
    status: "สถานะเพิ่มลูกค้าเพื่อเคลม",
    branch: "ฉะเชิงเทรา",
    contactTitle: "นางสาว",
    contactFirstName: "พรพินิต",
    contactLastName: "แสงสว่าง",
    contactPhone: "081-2345678",
    referenceId: "CD69240003000001",
    insuredTitle: "ด.ช.",
    insuredFirstName: "ภิตติชัย",
    insuredLastName: "ศิริเดน",
    nationalId: "9217505830122",
    passport: null,
    educationLevel: "อบ.1",
    insuredType: "นักเรียน",
};

const mockNotes: PersonalExclusionNote[] = [{ id: 1, message: "ติดเงื่อนไข โรคกระเพาะอาหาร" }];

const CheckEligibleDetailPage: React.FC = () => {
    const { appId } = useParams<{ appId: string; refId: string }>();
    const dispatch = useDispatch();

    const decodedAppId = appId ? atob(appId) : undefined;

    const { CheckeLigibleDetails, selectedContinuousClaims } = useSelector(checkeligibleSelector);

    const { data: benefitData, isLoading: isBenefitLoading } = useGetCustomerBenefitDetailSearch(
        decodedAppId,
        CheckeLigibleDetails.claimType,
        CheckeLigibleDetails.incidentDate ?? undefined,
        CheckeLigibleDetails.isContinuous
    );

    useEffect(() => {
        return () => {
            dispatch(resetSearchCheckeLigibleDetails());
        };
    }, [dispatch]);

    const handleOpenExclusion = () => {
        console.log("Open exclusion page");
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} md={5} lg={4}>
                {/* <InsuredInfoCardPH insured={mockInsured} /> */}
                <InsuredInfoCardPA data={mockPAInsuredInfo} />
                <PersonalExclusionCard notes={mockNotes} />
                <PolicyConditionCard onOpenExclusion={handleOpenExclusion} />
            </Grid>

            <Grid item xs={12} md={7} lg={8}>
                <SearchToolbar />
                {!CheckeLigibleDetails.claimType ? null : (
                    <CoverageSummaryPanel
                        benefitData={benefitData?.data}
                        isLoading={isBenefitLoading}
                        continuousRows={[]}
                        isContinuous={CheckeLigibleDetails.isContinuous as boolean}
                        selectedClaims={selectedContinuousClaims}
                        onToggleClaim={(code) => dispatch(toggleContinuousClaimSelection(code))}
                    />
                )}
            </Grid>
        </Grid>
    );
};

export default CheckEligibleDetailPage;
