import CustomPaper from "../../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../../_common/components/CustomComponent/HeadingWithColor";
import DocumentScannerIcon from "@mui/icons-material/DocumentScanner";
import OcrReceiptSection from "./OcrReceiptSection";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import useConsiderDetailHook from "../../../../hooks/ClaimConsiderDetail/ConsiderDetailHook";

import AddCardIcon from "@mui/icons-material/AddCard";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { PaymentSummaryCard } from "./PaymentSummaryCard";
import { Grid } from "@mui/material";
import { NPL_URL } from "../../../../../../../Const";
import ExpenseRecords from "./ExpenseRecords";
import { useNavigate } from "react-router-dom";
const ExpenseDetails = () => {
    const navigate = useNavigate();
    const { formik, customerDetailData } = useConsiderDetailHook();
    const nplAmount = 100;
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
                    icon={<ReceiptLongIcon sx={{ fontSize: 27 }} />}
                />
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                        <PaymentSummaryCard
                            icon={<VerifiedUserIcon />}
                            iconBgColor="#E8F0FE"
                            iconColor="#1967D2"
                            title="สิทธิ์เบิก"
                            subtitle="ค่ารักษา"
                            amount={5000}
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
                            badgeColor="#F5A623"
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
                            amount={5000}
                            unit="บาท"
                            accentColor="#0FA789"
                        />
                    </Grid>
                </Grid>
            </CustomPaper>
            <CustomPaper>
                <HeadingWithColor text="รายการค่าใช้จ่าย" color="blue" icon={<NoteAddIcon sx={{ fontSize: 27 }} />} />
                <ExpenseRecords />
            </CustomPaper>
        </>
    );
};

export default ExpenseDetails;
