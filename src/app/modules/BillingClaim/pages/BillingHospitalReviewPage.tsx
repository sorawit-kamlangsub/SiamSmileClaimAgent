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
import HeaderCardSchoolDetails from "../../ClaimConsider/components/ConsiderDetails/HeaderDetailCards/HeaderCardSchoolDetails";
import ClaimDetail from "../../ClaimConsider/components/ConsiderDetails/HeaderDetailCards/ClaimDetail";
import BillingClaimDetailsTab from "../components/BillingHospitalReview/BillingClaimDetailsTab";
import BillingHistoryTab from "../components/BillingHospitalReview/BillingHistoryTab";
import useBillingProductVariant from "../hooks/BillingHospitalReview/BillingProductVariantHook";
import { useGetHospitalBillingDetail } from "../../../api/hospitalBillingApi";
import { billingStatusLabel } from "../store/billingStatusHelpers";
import { PENDING_BE } from "../store/billingPendingFields";
import { calculatePolicyAgeText, formatDateString } from "../../../functionHelpers";

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
    const variant = useBillingProductVariant(detail?.data?.claim?.medicalTypeId);

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
                        {/* "ข้อมูลสถานศึกษา" — เฉพาะ Product PA (วันนี้ isPA เป็น false เสมอ ไม่มี productTypeId
                            จาก BE — PENDING_BE_FIELDS.productTypeId — จึงยังไม่ขึ้นการ์ดนี้จนกว่า BE จะส่งมา) */}
                        {variant.isPA && (
                            <Grid item xs={12} sx={{ mb: 2 }}>
                                <HeaderCardSchoolDetails customerDetail={undefined} />
                            </Grid>
                        )}

                        <Grid item xs={12} sx={{ mb: 2 }}>
                            <HeaderCardCustomerDetails
                                name={detail?.insured?.name ?? "-"}
                                idCardNo={PENDING_BE}
                                applicationId={detail?.insured?.applicationId ?? "-"}
                                phoneNumber={PENDING_BE}
                                appStatus={PENDING_BE}
                                policyAgeText={calculatePolicyAgeText(detail?.insured?.coverageStart?.toString())}
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
                                createdDate={formatDateString(
                                    detail?.submittedDate?.toString() ?? "",
                                    "DD/MM/BBBB HH:mm:ss"
                                )}
                                transferDate={undefined}
                                employee={undefined}
                                branch={detail?.provinceName}
                                claimNo={detail?.claimCode}
                                caseNo={detail?.caseNo}
                                claimType={variant.claimListTypeLabel}
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

                        <Grid sx={{ ml: "auto", mr: 1, display: "flex", gap: 1 }}>
                            {detail?.billingNo && (
                                <Chip
                                    label={`เลขใบวางบิล รพ (PB) : ${detail.billingNo}`}
                                    color="default"
                                    variant="outlined"
                                    sx={{ fontWeight: 700 }}
                                />
                            )}
                            <Chip
                                label={`ประเภทรายการเคลม : ${variant.claimListTypeLabel}`}
                                color="primary"
                                variant="outlined"
                                sx={{ fontWeight: 700 }}
                            />
                        </Grid>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    {/* px: 0 — TabPanel เว้นขอบซ้าย/ขวา 24px โดย default ทำให้เนื้อหาแคบกว่าแถบแท็บด้านบน (เต็มความกว้าง) */}
                    <TabPanel value="1" sx={{ px: 0 }}>
                        <BillingClaimDetailsTab readOnly={readOnly} />
                    </TabPanel>
                    <TabPanel value="2" sx={{ px: 0 }}>
                        <BillingHistoryTab currentBillingDetailId={billingDetailId} />
                    </TabPanel>
                </Grid>
            </TabContext>
        </Grid>
    );
};

export default BillingHospitalReviewPage;
