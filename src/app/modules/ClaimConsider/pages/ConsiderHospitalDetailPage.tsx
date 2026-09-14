import { Chip, Grid, Paper, Skeleton, Tab, Tabs } from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import ManageHistoryIcon from "@mui/icons-material/ManageHistory";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PaymentsIcon from "@mui/icons-material/Payments";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import { TabContext, TabPanel } from "@mui/lab";
import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import HeaderCardCustomerDetails from "../components/ConsiderDetails/HeaderDetailCards/HeaderCardCustomerDetails";
import ClaimDetail from "../components/ConsiderDetails/HeaderDetailCards/ClaimDetail";
import HospitalClaimDetailsTab from "../components/ConsiderHospitalDetails/HospitalClaimDetailsTab";
import ClaimTransationTab from "../components/ConsiderDetails/TabDetails/ClaimTransationTab";
import PolicyBenefitTab from "../components/ConsiderDetails/TabDetails/PolicyBenefitTab";
import ClaimHistoryTab from "../components/ConsiderDetails/TabDetails/ClaimHistoryTab";
import PaymentHistoryTab from "../components/ConsiderDetails/TabDetails/PaymentHistoryTab";
import {
    CLAIM_LIST_TYPE_CONFIG,
    parseClaimListType,
} from "../components/ConsiderHospitalDetails/mock/hospitalConsiderMock";
import { useGetClaimDetailConsider, useGetCustomerDetailById } from "../../../api/coreClaimApi";
import { calculatePolicyAgeText, formatDateString } from "../../../functionHelpers";

/**
 * หน้า "บันทึกข้อมูลเคลม - เคลมโรงพยาบาล (OPD Half / OPD Full)"
 *
 * ทำเฉพาะ Step 1 : บันทึกข้อมูลเคลม โดยดึงข้อมูลจริงจาก GetClaimDetailConsider
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
    const { id, caseId: caseIdEncoded } = useParams();
    const claimId = id ? atob(id) : "";
    // route hospital/:id/:caseId(/document) — :caseId ถูก encode ด้วย btoa จากหน้า monitor (คู่กับ :id)
    const caseId = caseIdEncoded ? atob(caseIdEncoded) : "";

    const { data: detailData, isLoading: detailDataLoading } = useGetClaimDetailConsider(claimId, caseId);
    const detail = detailData?.data;

    const { data: customerDetailData, isLoading: customerDetailLoading } = useGetCustomerDetailById(
        detail?.customerId ?? undefined
    );
    const customerDetail = customerDetailData?.data;

    const isHeaderLoading = detailDataLoading || customerDetailLoading;

    /** ประเภทรายการเคลม อ่านจาก Query String เช่น ?type=opd-full (Default : OPD Half) */
    const claimListTypeConfig = CLAIM_LIST_TYPE_CONFIG[parseClaimListType(searchParams.get("type"))];

    const handleChangeTab = (_event: React.SyntheticEvent, newValue: string) => {
        setTabValue(newValue);
    };

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
                        <Grid item xs={12} sx={{ mb: 2 }}>
                            <HeaderCardCustomerDetails
                                name={customerDetail?.customerName ?? "-"}
                                idCardNo={customerDetail?.cardTypeId === 2 ? customerDetail?.cardDetail ?? "-" : "-"}
                                applicationId={customerDetail?.policyCode ?? "-"}
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
                    <Paper elevation={2} sx={{ p: 1, borderRadius: 4, display: "flex", alignItems: "center", gap: 1 }}>
                        <Tabs value={tabValue} onChange={handleChangeTab} aria-label="icon position tabs">
                            <Tab icon={<DescriptionIcon />} iconPosition="start" label="ข้อมูลการเคลม" value={"1"} />
                            <Tab
                                icon={<ManageHistoryIcon />}
                                iconPosition="start"
                                label="ประวัติการทำรายการ"
                                value={"2"}
                            />
                            <Tab icon={<VerifiedUserIcon />} iconPosition="start" label="ความคุ้มครอง" value={"3"} />
                            <Tab icon={<AssignmentIcon />} iconPosition="start" label="ประวัติการเคลม" value={"4"} />
                            <Tab icon={<PaymentsIcon />} iconPosition="start" label="การชำระเงิน" value={"5"} />
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
    );
};

export default ConsiderHospitalDetailPage;
