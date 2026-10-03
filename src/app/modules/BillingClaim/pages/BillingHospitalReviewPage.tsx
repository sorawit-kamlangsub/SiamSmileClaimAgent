import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Chip, Grid, Paper, Skeleton, Tab, Tabs } from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import ManageHistoryIcon from "@mui/icons-material/ManageHistory";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PaymentsIcon from "@mui/icons-material/Payments";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { TabContext, TabPanel } from "@mui/lab";

import HeaderCardCustomerDetails from "../../ClaimConsider/components/ConsiderDetails/HeaderDetailCards/HeaderCardCustomerDetails";
import HeaderCardSchoolDetails from "../../ClaimConsider/components/ConsiderDetails/HeaderDetailCards/HeaderCardSchoolDetails";
import ClaimDetail from "../../ClaimConsider/components/ConsiderDetails/HeaderDetailCards/ClaimDetail";
import BillingClaimDetailsTab from "../components/BillingHospitalReview/BillingClaimDetailsTab";
import BillingHistoryTab from "../components/BillingHospitalReview/BillingHistoryTab";
import PolicyBenefitTab from "../../ClaimConsider/components/ConsiderDetails/TabDetails/PolicyBenefitTab";
import ClaimHistoryTab from "../../ClaimConsider/components/ConsiderDetails/TabDetails/ClaimHistoryTab";
import PaymentHistoryTab from "../../ClaimConsider/components/ConsiderDetails/TabDetails/PaymentHistoryTab";
import { GetCustomerDetailByIdDtoResponse } from "../../../api/coreClaimApi.client";
import useBillingProductVariant from "../hooks/BillingHospitalReview/BillingProductVariantHook";
import { useGetHospitalBillingDetail } from "../../../api/hospitalBillingApi";
import { appStatusLabelMap, calculatePolicyAgeText, formatDateString, safeAtob } from "../../../functionHelpers";
import useClearDocumentScanOnUnmount from "../../CreatedClaim/hooks/ClearDocumentScanHook";

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
    useClearDocumentScanOnUnmount();
    const { id } = useParams();
    const billingDetailId = safeAtob(id) ?? "";

    const { data: detailData, isLoading } = useGetHospitalBillingDetail(billingDetailId);
    const detail = detailData?.data;
    const variant = useBillingProductVariant(
        detail?.data?.claim?.medicalTypeId,
        detail?.productTypeId,
        detail?.medicalSubTypeCode
    );
    /** Chip แสดงค่าดิบจาก BE (medicalSubTypeCode) เหมือนหน้าพิจารณาเคลม รพ — fallback เป็น label ที่คำนวณไว้ */
    const claimTypeDisplayLabel = detail?.medicalSubTypeCode ?? variant.claimListTypeLabel;
    const policyCode = detail?.insured?.policyCode;

    /**
     * แท็บ "ความคุ้มครอง" ใช้ PolicyBenefitTab ร่วมกับหน้าพิจารณาเคลม รพ ซึ่งรับ customerDetail
     * (GetCustomerDetailByIdDtoResponse) — billing map เท่าที่มี : `insured.policyCode` + `productTypeId` +
     * `productId` (PH ส่ง productId — usePolicyBenefitHook เลือกส่งเองตาม productTypeId)
     * TODO(PENDING-BE): PENDING_BE_FIELDS.policyBenefitProduct — ยังขาด `customerTypeCode` (PA ต้องส่ง)
     * BE ส่งมาเมื่อไหร่ค่อย map เพิ่มตรงนี้
     */
    const productTypeId = detail?.productTypeId;
    const productId = detail?.productId;
    const policyBenefitCustomer = useMemo<GetCustomerDetailByIdDtoResponse | undefined>(
        () => (policyCode ? { policyCode, productTypeId, productId } : undefined),
        [policyCode, productTypeId, productId]
    );

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
                        {/* "ข้อมูลสถานศึกษา" — เฉพาะ Product PA (`detail.productTypeId`) — ยังไม่มีข้อมูลสถานศึกษา
                            จาก BE (PENDING_BE_FIELDS.schoolDetail) การ์ดจึงขึ้นเป็นค่าว่างไปก่อน */}
                        {variant.isPA && (
                            <Grid item xs={12} sx={{ mb: 2 }}>
                                <HeaderCardSchoolDetails customerDetail={undefined} />
                            </Grid>
                        )}

                        <Grid item xs={12} sx={{ mb: 2 }}>
                            <HeaderCardCustomerDetails
                                name={detail?.insured?.name ?? "-"}
                                idCardNo={detail?.insured?.idCard ?? "-"}
                                applicationId={detail?.insured?.policyCode ?? "-"}
                                phoneNumber={detail?.insured?.phone ?? "-"}
                                appStatus={
                                    detail?.appStatusName ||
                                    (detail?.appStatusId ? appStatusLabelMap[detail.appStatusId] : undefined) ||
                                    "-"
                                }
                                appStatusId={detail?.appStatusId}
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
                                employee={detail?.createdByUserName}
                                branch={detail?.createdCaseByBranchName}
                                claimNo={detail?.claimCode}
                                caseNo={detail?.caseNo}
                                // DFUAT-072 : "ประเภทการเคลม" คือ เคลมโรงพยาบาล / เคลมลูกค้า — หน้านี้มีแต่เคลมโรงพยาบาล
                                // (ประเภทการรักษา เช่น OPD/IPD แสดงที่ Chip ข้างแท็บอยู่แล้ว)
                                claimType="เคลมโรงพยาบาล"
                                statusClaim={detail?.claimStatusName}
                                claimStatusId={detail?.claimStatusId}
                            />
                        </Grid>
                    </>
                )}

                <Grid item xs={12}>
                    {/* แถวเดียวเสมอ : กลุ่ม Chip ยึดขวาคงขนาด (flexShrink 0) ส่วนแท็บหดตามพื้นที่ที่เหลือแล้วเลื่อนดู
                        แนวนอน (scrollable + ปุ่ม ‹ ›) — รองรับจำนวนแท็บที่เพิ่มขึ้นในอนาคตโดยไม่ทับ Chip */}
                    <Paper elevation={2} sx={{ p: 1, borderRadius: 4, display: "flex", alignItems: "center", gap: 1 }}>
                        <Tabs
                            value={tabValue}
                            onChange={handleChangeTab}
                            aria-label="billing review tabs"
                            variant="scrollable"
                            scrollButtons="auto"
                            allowScrollButtonsMobile
                            sx={{ flex: "1 1 auto", minWidth: 0 }}
                        >
                            <Tab icon={<DescriptionIcon />} iconPosition="start" label="ข้อมูลเคลม" value="1" />
                            <Tab icon={<ManageHistoryIcon />} iconPosition="start" label="ประวัติทำรายการ" value="2" />
                            <Tab icon={<VerifiedUserIcon />} iconPosition="start" label="ความคุ้มครอง" value="3" />
                            <Tab icon={<AssignmentIcon />} iconPosition="start" label="ประวัติเคลม" value="4" />
                            <Tab icon={<PaymentsIcon />} iconPosition="start" label="ประวัติการชำระเงิน" value="5" />
                            <Tab
                                icon={<StickyNote2Icon />}
                                iconPosition="start"
                                label="บันทึกข้อความ"
                                value="6"
                                disabled
                            />
                        </Tabs>

                        <Grid
                            sx={{
                                ml: "auto",
                                mr: 1,
                                display: "flex",
                                flexShrink: 0,
                                gap: 1,
                            }}
                        >
                            {detail?.billingRequestCode && (
                                // โทนน้ำเงินเข้มบนพื้นฟ้าอ่อน (สีเดียวกับ header ผู้เอาประกัน) — แยกจาก Chip ประเภทรายการเคลม
                                // ที่เป็น outlined primary ให้อ่านออกว่าเป็น "เลขเอกสาร" คนละกลุ่มกับ "ประเภท"
                                <Chip
                                    icon={<ReceiptLongIcon />}
                                    label={`เลขใบวางบิล รพ (PB) : ${detail.billingRequestCode}`}
                                    sx={{
                                        fontWeight: 700,
                                        bgcolor: "#E3F2FD",
                                        color: "#0D3D6B",
                                        "& .MuiChip-icon": { color: "#0D3D6B", fontSize: 18 },
                                    }}
                                />
                            )}
                            <Chip
                                label={`ประเภทการรักษา : ${claimTypeDisplayLabel}`}
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
                    {/* แท็บ 3-5 reuse ของหน้าพิจารณาเคลม รพ (ConsiderHospitalDetailPage) — ยิงด้วย policyCode ของผู้เอาประกัน */}
                    <TabPanel value="3" sx={{ px: 0 }}>
                        <PolicyBenefitTab customerDetail={policyBenefitCustomer} />
                    </TabPanel>
                    <TabPanel value="4" sx={{ px: 0 }}>
                        <ClaimHistoryTab applicationId={policyCode} />
                    </TabPanel>
                    <TabPanel value="5" sx={{ px: 0 }}>
                        <PaymentHistoryTab applicationCode={policyCode} />
                    </TabPanel>
                </Grid>
            </TabContext>
        </Grid>
    );
};

export default BillingHospitalReviewPage;
