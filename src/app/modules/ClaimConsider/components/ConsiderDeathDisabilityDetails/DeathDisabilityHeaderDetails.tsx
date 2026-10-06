import { useState } from "react";
import { Grid, Paper, Skeleton, Tab, Tabs } from "@mui/material";
import { TabContext, TabPanel } from "@mui/lab";
import DescriptionIcon from "@mui/icons-material/Description";
import ManageHistoryIcon from "@mui/icons-material/ManageHistory";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PaymentsIcon from "@mui/icons-material/Payments";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import HeaderCardCustomerDetails from "../ConsiderDetails/HeaderDetailCards/HeaderCardCustomerDetails";
import HeaderCardSchoolDetails from "../ConsiderDetails/HeaderDetailCards/HeaderCardSchoolDetails";
import ClaimDetail from "../ConsiderDetails/HeaderDetailCards/ClaimDetail";
import DeathDisabilityClaimDetailsTab from "./TabDetails/DeathDisabilityClaimDetailsTab";
import ClaimTransationTab from "../ConsiderDetails/TabDetails/ClaimTransationTab";
import PolicyBenefitTab from "../ConsiderDetails/TabDetails/PolicyBenefitTab";
import ClaimHistoryTab from "../ConsiderDetails/TabDetails/ClaimHistoryTab";
import PaymentHistoryTab from "../ConsiderDetails/TabDetails/PaymentHistoryTab";
import { useGetCustomerDetailById, useGetDeathAndDisabilityClaimDetailConsider } from "../../../../api/coreClaimApi";
import {
    PRODUCT_TYPE_GROUP,
    calculatePolicyAgeText,
    formatDateString,
    isProductType,
} from "../../../../functionHelpers";

type DeathDisabilityHeaderDetailsProps = {
    detailData: ReturnType<typeof useGetDeathAndDisabilityClaimDetailConsider>["data"];
    customerDetailData: ReturnType<typeof useGetCustomerDetailById>["data"];
    detailDataLoading: boolean;
    customerDetailLoading: boolean;
};

const TABS = [
    { value: "1", label: "ข้อมูลการเคลม", icon: <DescriptionIcon /> },
    { value: "2", label: "ประวัติการทำรายการ", icon: <ManageHistoryIcon /> },
    { value: "3", label: "ความคุ้มครอง", icon: <VerifiedUserIcon /> },
    { value: "4", label: "ประวัติการเคลม", icon: <AssignmentIcon /> },
    { value: "5", label: "การชำระเงิน", icon: <PaymentsIcon /> },
    { value: "6", label: "บันทึกข้อความ", icon: <StickyNote2Icon /> },
];

/**
 * ส่วนหัวของหน้าบันทึกข้อมูลเคลม - Death & Disability: การ์ดผู้เอาประกัน + การ์ดข้อมูลเคลม + แถบ tab
 * ข้อมูลการ์ด map จาก API แบบเดียวกับ HeaderDetails (หน้าพิจารณาเคลมลูกค้า) — tab 2-5 ใช้ component ตัวเดียวกันด้วย
 */
const DeathDisabilityHeaderDetails = ({
    detailData,
    customerDetailData,
    detailDataLoading,
    customerDetailLoading,
}: DeathDisabilityHeaderDetailsProps) => {
    const [tabValue, setTabValue] = useState("1");
    const detail = detailData?.data;
    const customerDetail = customerDetailData?.data;
    const isHeaderLoading = detailDataLoading || customerDetailLoading;

    return (
        <Grid container spacing={2}>
            <TabContext value={tabValue}>
                {isHeaderLoading ? (
                    <>
                        <Grid item xs={12} sx={{ mb: 2 }}>
                            <Skeleton variant="rounded" height={140} />
                        </Grid>
                        <Grid item xs={12} sx={{ mb: 2 }}>
                            <Skeleton variant="rounded" height={100} />
                        </Grid>
                    </>
                ) : (
                    <>
                        {isProductType(customerDetail?.productTypeId, PRODUCT_TYPE_GROUP.PA) && (
                            <Grid item xs={12} sx={{ mb: 2 }}>
                                <HeaderCardSchoolDetails customerDetail={customerDetail} />
                            </Grid>
                        )}
                        <Grid item xs={12} sx={{ mb: 2 }}>
                            <HeaderCardCustomerDetails
                                name={customerDetail?.customerName ?? "-"}
                                idCardNo={customerDetail?.cardTypeId === 2 ? customerDetail?.cardDetail ?? "-" : "-"}
                                applicationId={customerDetail?.policyCode ?? "-"}
                                productTypeId={customerDetail?.productTypeId}
                                phoneNumber={customerDetail?.mobilePhoneNumber ?? "-"}
                                appStatus={customerDetail?.appStatus ?? "-"}
                                appStatusId={customerDetail?.appStatusId ?? 0}
                                policyAgeText={calculatePolicyAgeText(customerDetail?.coverageFrom?.toString())}
                                coverageStartDate={
                                    formatDateString(customerDetail?.coverageFrom?.toString() ?? "", "DD/MM/BBBB") ??
                                    "-"
                                }
                                coverageEndDate={
                                    formatDateString(customerDetail?.coverageTo?.toString() ?? "", "DD/MM/BBBB") ?? "-"
                                }
                                productDetail={
                                    customerDetail?.productTypeId === 6
                                        ? customerDetail?.productName ?? "-"
                                        : customerDetail?.productCategoryName ?? "-"
                                }
                            />
                        </Grid>
                        <Grid item xs={12} sx={{ mb: 2 }}>
                            <ClaimDetail
                                createdDate={formatDateString(
                                    detail?.createdDate?.toString() ?? "",
                                    "DD/MM/BBBB HH:mm:ss"
                                )}
                                transferDate={formatDateString(
                                    detail?.paymentDate?.toString() ?? "",
                                    "DD/MM/BBBB HH:mm:ss"
                                )}
                                employee={detail?.createByUserName}
                                branch={customerDetail?.agentBranchName ?? "-"}
                                claimNo={detail?.claimNo}
                                caseNo={detail?.caseNo}
                                claimType={detail?.claimType}
                                statusClaim={detail?.claimStatusName}
                                claimStatusId={detail?.claimStatusId}
                            />
                        </Grid>
                    </>
                )}
                <Grid item xs={12}>
                    <Paper elevation={2} sx={{ p: 1, borderRadius: 4 }}>
                        <Tabs
                            value={tabValue}
                            onChange={(_event, newValue: string) => setTabValue(newValue)}
                            // 6 tab ล้นจอเล็ก — ให้เลื่อนแนวนอนได้แทนการบีบ
                            variant="scrollable"
                            scrollButtons="auto"
                            allowScrollButtonsMobile
                        >
                            {TABS.map((tab) => (
                                <Tab
                                    key={tab.value}
                                    icon={tab.icon}
                                    iconPosition="start"
                                    label={tab.label}
                                    value={tab.value}
                                />
                            ))}
                        </Tabs>
                    </Paper>
                </Grid>
                {/* tab 2-5 ใช้ component ตัวเดียวกับหน้าพิจารณาเคลมลูกค้า (HeaderDetails) — tab 6 ยังไม่มีเนื้อหาเหมือนกัน */}
                <Grid item xs={12}>
                    <TabPanel value="1">
                        <DeathDisabilityClaimDetailsTab
                            detail={detail}
                            customerDetail={customerDetail}
                            detailLoading={detailDataLoading}
                        />
                    </TabPanel>
                    <TabPanel value="2">
                        <ClaimTransationTab onViewDraft={() => setTabValue("1")} />
                    </TabPanel>
                    <TabPanel value="3">
                        <PolicyBenefitTab customerDetail={customerDetail} />
                    </TabPanel>
                    <TabPanel value="4">
                        <ClaimHistoryTab applicationId={customerDetail?.policyCode} />
                    </TabPanel>
                    <TabPanel value="5">
                        <PaymentHistoryTab applicationCode={customerDetail?.policyCode} />
                    </TabPanel>
                </Grid>
            </TabContext>
        </Grid>
    );
};

export default DeathDisabilityHeaderDetails;
