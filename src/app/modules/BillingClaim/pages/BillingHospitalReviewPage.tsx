import { useState } from "react";
import { useParams } from "react-router-dom";
import { Chip, Grid, Paper, Skeleton, Tab, Tabs } from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import ManageHistoryIcon from "@mui/icons-material/ManageHistory";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PaymentsIcon from "@mui/icons-material/Payments";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import { TabContext, TabPanel } from "@mui/lab";

import HeaderCardCustomerDetails from "../../ClaimConsider/components/ConsiderDetails/HeaderDetailCards/HeaderCardCustomerDetails";
import ClaimDetail from "../../ClaimConsider/components/ConsiderDetails/HeaderDetailCards/ClaimDetail";
import BillingClaimDetailsTab from "../components/BillingHospitalReview/BillingClaimDetailsTab";
import BillingHistoryTab from "../components/BillingHospitalReview/BillingHistoryTab";
import { useGetHospitalBillingDetail } from "../../../api/hospitalBillingApi";
import { billingStatusLabel } from "../store/billingStatusHelpers";
import { formatDateString } from "../../../functionHelpers";

type BillingHospitalReviewPageProps = {
    /** โหมดดูอย่างเดียว : ใช้ตอนเปิดจากปุ่ม "ดูรายละเอียด" ในหน้า Monitor */
    readOnly?: boolean;
};

/**
 * หน้า "ตรวจสอบรายการวางบิล - เคลมโรงพยาบาล" (billingHospitalReviewPage)
 *
 * โหลด Detail แยกที่หน้านี้ (สำหรับ header) กับที่ `BillingClaimDetailsTab` (สำหรับฟอร์ม) — เหมือน
 * pattern ของ ConsiderHospitalDetailPage/HospitalClaimDetailsTab เดิม, react-query dedupe คำขอเครือข่าย
 * ให้อยู่แล้วจาก query key เดียวกัน
 */
const BillingHospitalReviewPage = ({ readOnly = false }: BillingHospitalReviewPageProps) => {
    const [tabValue, setTabValue] = useState("1");
    const { id } = useParams();
    const billingDetailId = id ? atob(id) : "";

    const { data: detailData, isLoading } = useGetHospitalBillingDetail(billingDetailId);
    const detail = detailData?.data;

    const handleChangeTab = (_event: React.SyntheticEvent, newValue: string) => setTabValue(newValue);

    return (
        <Grid container spacing={2}>
            <TabContext value={tabValue}>
                {isLoading ? (
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
                                name={detail?.insured?.name ?? "-"}
                                idCardNo="-"
                                applicationId={detail?.insured?.applicationId ?? "-"}
                                phoneNumber="-"
                                appStatus="-"
                                policyAgeText="-"
                                coverageStartDate={
                                    formatDateString(detail?.insured?.coverageStart?.toString() ?? "", "DD/MM/BBBB") ??
                                    "-"
                                }
                                coverageEndDate={
                                    formatDateString(detail?.insured?.coverageEnd?.toString() ?? "", "DD/MM/BBBB") ??
                                    "-"
                                }
                                productDetail={detail?.insured?.plan ?? "-"}
                            />
                        </Grid>

                        <Grid item xs={12} sx={{ mb: 2 }}>
                            <ClaimDetail
                                notificationDate={formatDateString(
                                    detail?.submittedDate?.toString() ?? "",
                                    "DD/MM/BBBB HH:mm:ss"
                                )}
                                transferDate={undefined}
                                employee={undefined}
                                branch={detail?.provinceName}
                                claimNo={detail?.claimCode}
                                caseNo={detail?.caseNo}
                                claimType={detail?.claimType}
                                statusClaim={detail ? billingStatusLabel(detail.statusId) : undefined}
                                claimStatusId={undefined}
                            />
                        </Grid>
                    </>
                )}

                <Grid item xs={12}>
                    <Paper elevation={2} sx={{ p: 1, borderRadius: 4, display: "flex", alignItems: "center", gap: 1 }}>
                        <Tabs value={tabValue} onChange={handleChangeTab} aria-label="billing review tabs">
                            <Tab icon={<DescriptionIcon />} iconPosition="start" label="ข้อมูลเคลม" value="1" />
                            <Tab icon={<ManageHistoryIcon />} iconPosition="start" label="ประวัติทำรายการ" value="2" />
                            <Tab
                                icon={<VerifiedUserIcon />}
                                iconPosition="start"
                                label="ความคุ้มครอง"
                                value="3"
                                disabled
                            />
                            <Tab
                                icon={<AssignmentIcon />}
                                iconPosition="start"
                                label="ประวัติเคลม"
                                value="4"
                                disabled
                            />
                            <Tab
                                icon={<PaymentsIcon />}
                                iconPosition="start"
                                label="ประวัติการชำระเงิน"
                                value="5"
                                disabled
                            />
                            <Tab
                                icon={<StickyNote2Icon />}
                                iconPosition="start"
                                label="บันทึกข้อความ"
                                value="6"
                                disabled
                            />
                        </Tabs>

                        <Chip
                            label={`ประเภทรายการเคลม : ${detail?.claimType ?? "-"}`}
                            color="primary"
                            variant="outlined"
                            sx={{ ml: "auto", mr: 1, fontWeight: 700 }}
                        />
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <TabPanel value="1">
                        <BillingClaimDetailsTab readOnly={readOnly} />
                    </TabPanel>
                    <TabPanel value="2">
                        <BillingHistoryTab currentBillingDetailId={billingDetailId} />
                    </TabPanel>
                </Grid>
            </TabContext>
        </Grid>
    );
};

export default BillingHospitalReviewPage;
