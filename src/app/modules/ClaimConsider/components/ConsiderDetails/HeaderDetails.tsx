import { Grid, Paper, Tab, Tabs, Skeleton } from "@mui/material";
import HeaderCardCustomerDetails from "./HeaderDetailCards/HeaderCardCustomerDetails";
import HeaderCardSchoolDetails from "./HeaderDetailCards/HeaderCardSchoolDetails";
import ClaimDetail from "./HeaderDetailCards/ClaimDetail";
import { useState } from "react";
import DescriptionIcon from "@mui/icons-material/Description";
import ManageHistoryIcon from "@mui/icons-material/ManageHistory";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PaymentsIcon from "@mui/icons-material/Payments";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import { TabContext, TabPanel } from "@mui/lab";
import ClaimDetailsTab from "./TabDetails/ClaimDetailsTab";
import { useGetClaimDetailConsider, useGetCustomerDetailById } from "../../../../api/coreClaimApi";
import {
    PRODUCT_TYPE_GROUP,
    calculatePolicyAgeText,
    formatDateString,
    isProductType,
} from "../../../../functionHelpers";
import ClaimTransationTab from "./TabDetails/ClaimTransationTab";
import PolicyBenefitTab from "./TabDetails/PolicyBenefitTab";
import ClaimHistoryTab from "./TabDetails/ClaimHistoryTab";
import PaymentHistoryTab from "./TabDetails/PaymentHistoryTab";

type HeaderDetailsProps = {
    detailData: ReturnType<typeof useGetClaimDetailConsider>["data"];
    customerDetailData: ReturnType<typeof useGetCustomerDetailById>["data"];
    detailDataLoading: boolean;
    customerDetailLoading: boolean;
};

const HeaderDetails = ({
    detailData,
    customerDetailData,
    detailDataLoading,
    customerDetailLoading,
}: HeaderDetailsProps) => {
    const [tabValue, setTabValue] = useState("1");

    const handleChangeTab = (_event: React.SyntheticEvent, newValue: string) => {
        setTabValue(newValue);
    };

    const detail = detailData?.data;
    const customerDetail = customerDetailData?.data;
    const isHeaderLoading = detailDataLoading || customerDetailLoading;
    return (
        <>
            <Grid container spacing={2}>
                <TabContext value={tabValue}>
                    {isHeaderLoading ? (
                        <>
                            <Grid item xs={12} sm={12} md={12} lg={12} sx={{ mb: 2 }}>
                                <Skeleton variant="rounded" height={140} />
                            </Grid>
                            <Grid item xs={12} sm={12} md={12} lg={12} sx={{ mb: 2 }}>
                                <Skeleton variant="rounded" height={100} />
                            </Grid>
                        </>
                    ) : (
                        <>
                            {isProductType(customerDetail?.productTypeId, PRODUCT_TYPE_GROUP.PA) && (
                                <Grid item xs={12} sm={12} md={12} lg={12} sx={{ mb: 2 }}>
                                    <HeaderCardSchoolDetails customerDetail={customerDetail} />
                                </Grid>
                            )}

                            <Grid item xs={12} sm={12} md={12} lg={12} sx={{ mb: 2 }}>
                                <HeaderCardCustomerDetails
                                    name={customerDetail?.customerName ?? "-"}
                                    idCardNo={
                                        customerDetail?.cardTypeId === 2 ? customerDetail?.cardDetail ?? "-" : "-"
                                    }
                                    applicationId={customerDetail?.policyCode ?? "-"}
                                    onApplicationIdClick={() => {}}
                                    phoneNumber={customerDetail?.mobilePhoneNumber ?? "-"}
                                    appStatus={customerDetail?.appStatus ?? "-"}
                                    appStatusId={customerDetail?.appStatusId ?? 0}
                                    policyAgeText={calculatePolicyAgeText(customerDetail?.coverageFrom?.toString())}
                                    coverageStartDate={
                                        formatDateString(
                                            customerDetail?.coverageFrom?.toString() ?? "",
                                            "DD/MM/BBBB"
                                        ) ?? "-"
                                    }
                                    coverageEndDate={
                                        formatDateString(customerDetail?.coverageTo?.toString() ?? "", "DD/MM/BBBB") ??
                                        "-"
                                    }
                                    productDetail={
                                        customerDetail?.productTypeId === 6
                                            ? customerDetail?.productName ?? "-"
                                            : customerDetail?.productCategoryName ?? "-"
                                    }
                                />
                            </Grid>

                            <Grid item xs={12} sm={12} md={12} lg={12} sx={{ mb: 2 }}>
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

                    <Grid item xs={12} sm={12} md={12} lg={12}>
                        <Paper elevation={2} sx={{ p: 1, borderRadius: 4 }}>
                            <Tabs value={tabValue} onChange={handleChangeTab} aria-label="icon position tabs">
                                <Tab
                                    icon={<DescriptionIcon />}
                                    iconPosition="start"
                                    label="ข้อมูลการเคลม"
                                    value={"1"}
                                />
                                <Tab
                                    icon={<ManageHistoryIcon />}
                                    iconPosition="start"
                                    label="ประวัติการทำรายการ"
                                    value={"2"}
                                />
                                <Tab
                                    icon={<VerifiedUserIcon />}
                                    iconPosition="start"
                                    label="ความคุ้มครอง"
                                    value={"3"}
                                />
                                <Tab
                                    icon={<AssignmentIcon />}
                                    iconPosition="start"
                                    label="ประวัติการเคลม"
                                    value={"4"}
                                />
                                <Tab icon={<PaymentsIcon />} iconPosition="start" label="การชำระเงิน" value={"5"} />
                                <Tab
                                    icon={<StickyNote2Icon />}
                                    iconPosition="start"
                                    label="บันทึกข้อความ"
                                    value={"6"}
                                />
                            </Tabs>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} sm={12} md={12} lg={12}>
                        <TabPanel value="1">
                            <ClaimDetailsTab customerDetail={customerDetail} detail={detail} />
                        </TabPanel>
                        <TabPanel value="2">
                            <ClaimTransationTab onViewDraft={() => setTabValue("1")} />
                        </TabPanel>
                        <TabPanel value="3">
                            <PolicyBenefitTab customerDetailData={customerDetailData} />
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
        </>
    );
};

export default HeaderDetails;
