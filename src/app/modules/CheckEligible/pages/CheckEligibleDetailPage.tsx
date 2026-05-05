import React from "react";
import { Box, Grid } from "@mui/material";
import InsuredInfoCard from "../components/CheckEligibleDetail/InsuredInfoCard";
import PersonalExclusionCard from "../components/CheckEligibleDetail/PersonalExclusionCard";
import PolicyConditionCard from "../components/CheckEligibleDetail/PolicyConditionCard";
import { InsuredInfo, PersonalExclusionNote } from "../hooks/CheckEligibleDetail/useCheckEligibleDetail";
import { checkeligibleSelector, PolicyPlan, toggleContinuousClaimSelection } from "../store/checkeligibleSlice";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import { useDispatch, useSelector } from "react-redux";
import SearchToolbar from "../components/CheckEligibleDetail/SearchToolbar";
import CoverageSummaryPanel from "../components/CheckEligibleDetail/CoverageSummaryPanel";

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

// Mock Plan
const mockPlan: PolicyPlan = {
    planCode: "662",
    effectiveDate: "2015-03-08",
    benefits: [
        {
            id: "b1",
            icon: <LocalHospitalIcon sx={{ color: "#1a5da8" }} />,
            title: "ค่าดูแลโดยแพทย์",
            ratePerUnit: "700/วัน",
            maxAmount: 31500,
            usedAmount: 0,
            maxDays: 45,
            usedDays: 0,
        },
        // ... เพิ่ม benefit อื่นๆ
    ],
};

const mockNotes: PersonalExclusionNote[] = [{ id: 1, message: "ติดเงื่อนไข โรคกระเพาะอาหาร" }];

const CheckEligibleDetailPage: React.FC = () => {
    const handleOpenExclusion = () => {
        // TODO: เปิด dialog หรือ navigate ไปหน้าโรคยกเว้น
        console.log("Open exclusion page");
    };

    const { isContinuousClaim, selectedContinuousClaims } = useSelector(checkeligibleSelector);
    const dispatch = useDispatch();
    return (
        // <Box sx={{ bgcolor: "#f5f6fa", minHeight: "100vh" }}>
        <Grid container spacing={2}>
            {/* Left column */}
            <Grid item xs={12} md={5} lg={4}>
                <InsuredInfoCard insured={mockInsured} />
                <PersonalExclusionCard notes={mockNotes} />
                <PolicyConditionCard onOpenExclusion={handleOpenExclusion} />
            </Grid>

            {/* Right column — สำหรับ Search Panel (toolbar จากหน้าก่อนหน้า) */}
            <Grid item xs={12} md={7} lg={8}>
                <SearchToolbar />
                <CoverageSummaryPanel
                    plan={mockPlan}
                    continuousRows={[]}
                    isContinuous={isContinuousClaim}
                    selectedClaims={selectedContinuousClaims}
                    onToggleClaim={(code) => dispatch(toggleContinuousClaimSelection(code))}
                />
            </Grid>
        </Grid>
        // </Box>
    );
};

export default CheckEligibleDetailPage;
