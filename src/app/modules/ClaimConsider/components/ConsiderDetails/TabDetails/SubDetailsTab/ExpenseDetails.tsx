import CustomPaper from "../../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../../_common/components/CustomComponent/HeadingWithColor";
import DocumentScannerIcon from "@mui/icons-material/DocumentScanner";
import OcrReceiptSection from "./OcrReceiptSection";

import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import NoteAddIcon from "@mui/icons-material/NoteAdd";

import AddCardIcon from "@mui/icons-material/AddCard";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { PaymentSummaryCard } from "./PaymentSummaryCard";
import { Grid } from "@mui/material";
import { NPL_URL } from "../../../../../../../Const";
import ExpenseRecords from "./ExpenseRecords";
import { FormikProps } from "formik";
import { ClaimConsiderValues } from "../../../../store/claimConsiderSlice";
import { useGetClaimDetailConsider, useGetCustomerDetailById } from "../../../../../../api/coreClaimApi";
import useClaimExpenseDetailHook from "../../../../hooks/ClaimConsiderDetail/ClaimExpenseDetailHook";

type ExpenseDetailsProps = {
    formik: FormikProps<ClaimConsiderValues>;
    detailData: ReturnType<typeof useGetClaimDetailConsider>["data"];
    customerDetailData: ReturnType<typeof useGetCustomerDetailById>["data"];
};

// รับ formik/detailData/customerDetailData เป็น props จาก ClaimDetailsTab แทนการเรียก useConsiderDetailHook()
// เอง (เดิมเรียกซ้ำกับ ClaimDetailsTab และ ClaimExpenseDetailHook รวม 3 จุด ทำให้ query/formik/effect
// ทำงานซ้ำ 3 เท่าทุกครั้งที่หน้านี้ mount — ดูรายละเอียดใน ClaimExpenseDetailHook.tsx)
// เรียก useClaimExpenseDetailHook ที่นี่จุดเดียว (ก่อนหน้านี้ ExpenseRecords เรียกเอง) เพราะการ์ด "สิทธิ์เบิก"
// ด้านล่างต้องใช้ benefitName จาก hook นี้ ก่อนถึง ExpenseRecords — ส่งผลลัพธ์ทั้งก้อนต่อลงไปแทนเรียกซ้ำ
const ExpenseDetails = ({ formik, detailData, customerDetailData }: ExpenseDetailsProps) => {
    const nplAmount = detailData?.data?.nplAmount || 0;
    const expenseDetail = useClaimExpenseDetailHook({ detailData, customerDetailData });
    return (
        <>
            <CustomPaper>
                <HeadingWithColor
                    icon={<DocumentScannerIcon sx={{ fontSize: 27 }} />}
                    text="OCR ใบแจ้งค่ารักษา"
                    color="blue"
                />
                <OcrReceiptSection formik={formik} applicationCode={customerDetailData?.data?.policyCode} />
            </CustomPaper>
            <CustomPaper>
                <HeadingWithColor
                    text="สรุปรายการแจ้งโอน"
                    color="blue"
                    icon={<AccountBalanceWalletIcon sx={{ fontSize: 27 }} />}
                />
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                        <PaymentSummaryCard
                            icon={<VerifiedUserIcon />}
                            iconBgColor="#E8F0FE"
                            iconColor="#1967D2"
                            title="สิทธิ์เบิก"
                            subtitle={expenseDetail.benefitName ?? "ค่ารักษา"}
                            amount={detailData?.data?.caseAmount || 0}
                            unit="บาท"
                            accentColor="#1967D2"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <PaymentSummaryCard
                            icon={<AddCardIcon />}
                            iconBgColor="#FFF1DC"
                            iconColor="#F5A623"
                            title="จ่ายเงินเกินสิทธิ์เบิก (NPL)"
                            subtitle="ยอดที่เกินสิทธิ์เบิกและบันทึกแยก"
                            amount={nplAmount}
                            unit="บาท"
                            accentColor="#F5A623"
                            badge={nplAmount > 0 ? "บันทึก NPL" : "ไม่มียอดจ่ายเกินสิทธิ์เบิก"}
                            badgeColor={nplAmount > 0 ? "#1967D2" : "#F5A623"}
                            badgeSize="medium"
                            onBadgeClick={() => window.open(`${NPL_URL}/npl/create`, "_blank")}
                            badgeClickable={nplAmount > 0}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <PaymentSummaryCard
                            icon={<AttachMoneyIcon />}
                            iconBgColor="#E3F6F2"
                            iconColor="#0FA789"
                            title="จำนวนเงินโอนรวม"
                            subtitle="ยอดเงินโอน"
                            amount={detailData?.data?.paymentAmount || 0}
                            unit="บาท"
                            accentColor="#0FA789"
                        />
                    </Grid>
                </Grid>
            </CustomPaper>
            <CustomPaper>
                <HeadingWithColor text="รายการค่าใช้จ่าย" color="blue" icon={<NoteAddIcon sx={{ fontSize: 27 }} />} />
                <ExpenseRecords expenseDetail={expenseDetail} />
            </CustomPaper>
        </>
    );
};

export default ExpenseDetails;
