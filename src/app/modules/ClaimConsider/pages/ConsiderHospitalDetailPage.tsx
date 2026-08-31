import { Chip, Grid, Paper, Tab, Tabs } from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import ManageHistoryIcon from "@mui/icons-material/ManageHistory";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PaymentsIcon from "@mui/icons-material/Payments";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import { TabContext, TabPanel } from "@mui/lab";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import HeaderCardCustomerDetails from "../components/ConsiderDetails/HeaderDetailCards/HeaderCardCustomerDetails";
import ClaimDetail from "../components/ConsiderDetails/HeaderDetailCards/ClaimDetail";
import HospitalClaimDetailsTab from "../components/ConsiderHospitalDetails/HospitalClaimDetailsTab";
import {
    CLAIM_LIST_TYPE_CONFIG,
    MOCK_HOSPITAL_CLAIM,
    parseClaimListType,
} from "../components/ConsiderHospitalDetails/mock/hospitalConsiderMock";

/**
 * หน้า "บันทึกข้อมูลเคลม - เคลมโรงพยาบาล (OPD Half)"
 *
 * เป็น Mock UI ตาม Spec ทำเฉพาะ Step 1 : บันทึกข้อมูลเคลม
 * ใช้ Component ร่วมกับหน้าพิจารณาเคลมลูกค้า (/consider/monitor/customers)
 */
type ConsiderHospitalDetailPageProps = {
    /**
     * โหมดดูอย่างเดียว : แสดงข้อมูลชุดเดียวกับหน้าพิจารณา แต่แก้ไขอะไรไม่ได้
     * ใช้ตอนเปิดจากปุ่มรูปดวงตาในหน้า Monitor
     */
    readOnly?: boolean;
};

const ConsiderHospitalDetailPage = ({ readOnly = false }: ConsiderHospitalDetailPageProps) => {
    const [tabValue, setTabValue] = useState("1");
    const [searchParams] = useSearchParams();

    /** ประเภทรายการเคลม อ่านจาก Query String เช่น ?type=opd-full (Default : OPD Half) */
    const claimListTypeConfig = CLAIM_LIST_TYPE_CONFIG[parseClaimListType(searchParams.get("type"))];

    const handleChangeTab = (_event: React.SyntheticEvent, newValue: string) => {
        setTabValue(newValue);
    };

    return (
        <Grid container spacing={2}>
            <TabContext value={tabValue}>
                <Grid item xs={12} sx={{ mb: 2 }}>
                    <HeaderCardCustomerDetails
                        name={MOCK_HOSPITAL_CLAIM.customerName}
                        idCardNo={MOCK_HOSPITAL_CLAIM.idCardNo}
                        applicationId={MOCK_HOSPITAL_CLAIM.applicationId}
                        phoneNumber={MOCK_HOSPITAL_CLAIM.phoneNumber}
                        appStatus={MOCK_HOSPITAL_CLAIM.appStatus}
                        appStatusId={MOCK_HOSPITAL_CLAIM.appStatusId}
                        policyAgeText={MOCK_HOSPITAL_CLAIM.policyAgeText}
                        coverageStartDate={MOCK_HOSPITAL_CLAIM.coverageStartDate}
                        coverageEndDate={MOCK_HOSPITAL_CLAIM.coverageEndDate}
                        productDetail={MOCK_HOSPITAL_CLAIM.productDetail}
                    />
                </Grid>

                <Grid item xs={12} sx={{ mb: 2 }}>
                    <ClaimDetail
                        notificationDate={MOCK_HOSPITAL_CLAIM.notificationDate}
                        transferDate="-"
                        employee={MOCK_HOSPITAL_CLAIM.createByUserName}
                        branch={MOCK_HOSPITAL_CLAIM.branchName}
                        claimNo={MOCK_HOSPITAL_CLAIM.claimNo}
                        caseNo={MOCK_HOSPITAL_CLAIM.caseNo}
                        claimType={MOCK_HOSPITAL_CLAIM.claimType}
                        statusClaim={MOCK_HOSPITAL_CLAIM.claimStatus}
                        claimStatusId={MOCK_HOSPITAL_CLAIM.claimStatusId}
                    />
                </Grid>

                <Grid item xs={12}>
                    <Paper elevation={2} sx={{ p: 1, borderRadius: 4, display: "flex", alignItems: "center", gap: 1 }}>
                        <Tabs value={tabValue} onChange={handleChangeTab} aria-label="icon position tabs">
                            <Tab icon={<DescriptionIcon />} iconPosition="start" label="ข้อมูลการเคลม" value={"1"} />
                            <Tab
                                icon={<ManageHistoryIcon />}
                                iconPosition="start"
                                label="ประวัติการทำรายการ"
                                value={"2"}
                                disabled
                            />
                            <Tab
                                icon={<VerifiedUserIcon />}
                                iconPosition="start"
                                label="ความคุ้มครอง"
                                value={"3"}
                                disabled
                            />
                            <Tab
                                icon={<AssignmentIcon />}
                                iconPosition="start"
                                label="ประวัติการเคลม"
                                value={"4"}
                                disabled
                            />
                            <Tab
                                icon={<PaymentsIcon />}
                                iconPosition="start"
                                label="การชำระเงิน"
                                value={"5"}
                                disabled
                            />
                            <Tab
                                icon={<StickyNote2Icon />}
                                iconPosition="start"
                                label="บันทึกข้อความ"
                                value={"6"}
                                disabled
                            />
                        </Tabs>

                        <Chip
                            label={`ประเภทรายการเคลม : ${claimListTypeConfig.label}`}
                            color="primary"
                            variant="outlined"
                            sx={{ ml: "auto", mr: 1, fontWeight: 700 }}
                        />
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <TabPanel value="1">
                        <HospitalClaimDetailsTab readOnly={readOnly} />
                    </TabPanel>
                </Grid>
            </TabContext>
        </Grid>
    );
};

export default ConsiderHospitalDetailPage;
