import React, { useEffect } from "react";
import { Grid } from "@mui/material";
import PersonalExclusionCard from "../components/CheckEligibleDetail/PersonalExclusionCard";
import PolicyConditionCard from "../components/CheckEligibleDetail/PolicyConditionCard";
import { InsuredInfo, PAInsuredInfo, PersonalExclusionNote } from "../hooks/CheckEligibleDetail/useCheckEligibleDetail";
import {
    checkeligibleSelector,
    PolicyPlan,
    resetSearchCheckeLigibleDetails,
    toggleContinuousClaimSelection,
} from "../store/checkeligibleSlice";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import { useDispatch, useSelector } from "react-redux";
import SearchToolbar from "../components/CheckEligibleDetail/SearchToolbar";
import CoverageSummaryPanel from "../components/CheckEligibleDetail/CoverageSummaryPanel";
import InsuredInfoCardPA from "../components/CheckEligibleDetail/InsuredInfoCardPA";
import InsuredInfoCardPH from "../components/CheckEligibleDetail/InsuredInfoCardPH";

const mockInsured: InsuredInfo = {
    applicationId: "0003067",
    policyStartDate: "2015-03-08",
    titleName: "นาย",
    firstName: "กรภัทร",
    lastName: "วรวงศ์คุณากร",
    idCardNo: "8220465383177",
    passport: undefined,
    birthDate: "1998-08-21",
    mobilePhone: "091-2345678",
    province: "กรุงเทพมหานคร",
    occupation: "พนักงานบริษัท",
};

const mockPlan: PolicyPlan = {
    planCode: "662",
    effectiveDate: "2015-03-08",
    benefits: [
        {
            id: 2,
            icon: <LocalHospitalIcon sx={{ color: "#1a5da8" }} />,
            title: "ค่าดูแลโดยแพทย์",
            ratePerUnit: "700/วัน",
            maxAmount: 31500,
            usedAmount: 0,
            maxDays: 45,
            usedDays: 0,
            dayUnit: "วัน",
        },
        {
            id: 3,
            icon: <LocalHospitalIcon sx={{ color: "#1a5da8" }} />,
            title: "ค่าดูแลโดยแพทย์",
            ratePerUnit: "700/วัน",
            maxAmount: 31500,
            usedAmount: 0,
            maxDays: 45,
            usedDays: 0,
            dayUnit: "วัน",
        },
        {
            id: 4,
            icon: <LocalHospitalIcon sx={{ color: "#1a5da8" }} />,
            title: "ค่าดูแลโดยแพทย์",
            ratePerUnit: "700/วัน",
            maxAmount: 31500,
            usedAmount: 0,
            maxDays: 45,
            usedDays: 0,
            dayUnit: "วัน",
        },
        {
            id: 5,
            icon: <LocalHospitalIcon sx={{ color: "#1a5da8" }} />,
            title: "ค่าดูแลโดยแพทย์",
            ratePerUnit: "700/วัน",
            maxAmount: 31500,
            usedAmount: 0,
            maxDays: 45,
            usedDays: 0,
            dayUnit: "วัน",
        },
        {
            id: 6,
            icon: <LocalHospitalIcon sx={{ color: "#1a5da8" }} />,
            title: "ค่าดูแลโดยแพทย์",
            ratePerUnit: "700/วัน",
            maxAmount: 31500,
            usedAmount: 0,
            maxDays: 45,
            usedDays: 0,
            dayUnit: "วัน",
        },
    ],
};

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
    const { CheckeLigibleDetails, selectedContinuousClaims } = useSelector(checkeligibleSelector);
    const dispatch = useDispatch();

    useEffect(() => {
        return () => {
            resetSearchCheckeLigibleDetails();
        };
    }, []);

    const handleOpenExclusion = () => {
        // TODO: เปิด dialog หรือ navigate ไปหน้าโรคยกเว้น
        console.log("Open exclusion page");
    };
    return (
        // <Box sx={{ bgcolor: "#f5f6fa", minHeight: "100vh" }}>
        <Grid container spacing={2}>
            <Grid item xs={12} lg={4}>
                {/* <InsuredInfoCardPH insured={mockInsured} /> */}
                <InsuredInfoCardPA data={mockPAInsuredInfo} />
                <PersonalExclusionCard notes={mockNotes} />
                <PolicyConditionCard onOpenExclusion={handleOpenExclusion} />
            </Grid>

            <Grid item xs={12} lg={8}>
                <SearchToolbar />
                <CoverageSummaryPanel
                    plan={mockPlan}
                    continuousRows={[]}
                    isContinuous={CheckeLigibleDetails.isContinuous}
                    selectedClaims={selectedContinuousClaims}
                    onToggleClaim={(code) => dispatch(toggleContinuousClaimSelection(code))}
                />
            </Grid>
        </Grid>
        // </Box>
    );
};

export default CheckEligibleDetailPage;
