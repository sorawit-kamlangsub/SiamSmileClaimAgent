import { Divider, Grid } from "@mui/material";
import SummarizeIcon from "@mui/icons-material/Summarize";
import PaidIcon from "@mui/icons-material/Paid";
import { useFormikContext } from "formik";
import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import { CustomDisplayText } from "../../../../_common/components/CustomComponent/CustomDisplayText";
import { numberWithCommas } from "../../../../../functionHelpers";
import { BillingReviewFormValues } from "../../../store/billingClaim.types";

type BillingSummaryStep3Props = {
    claimCode?: string;
    hospitalName?: string;
    claimType?: string;
    billingAmount: number;
    totalClaimedAmount: number;
    totalDiscountAmount: number;
    totalNonCoveredAmount: number;
    netBillableAmount: number;
};

/** Step 3 "สรุปรายการเคลม" — read-only ทั้งหมด */
const BillingSummaryStep3 = ({
    claimCode,
    hospitalName,
    claimType,
    billingAmount,
    totalClaimedAmount,
    totalDiscountAmount,
    totalNonCoveredAmount,
    netBillableAmount,
}: BillingSummaryStep3Props) => {
    const { values } = useFormikContext<BillingReviewFormValues>();
    const reviewedDocumentCount = values.documents.filter((d) => d.reviewStatusId !== undefined).length;
    const diagnosisIds = [values.diagnosis1Id, values.diagnosis2Id, values.diagnosis3Id].filter(Boolean);

    return (
        <CustomPaper>
            <HeadingWithColor icon={<SummarizeIcon sx={{ fontSize: 27 }} />} text="สรุปข้อมูลเคลม" color="blue" />
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <CustomDisplayText label="เลขที่ CL" value={claimCode} />
                <CustomDisplayText label="สถานพยาบาล" value={hospitalName} />
                <CustomDisplayText label="ประเภทรายการเคลม" value={claimType} />
                <CustomDisplayText label="จำนวน Diagnosis" value={`${diagnosisIds.length} รายการ`} />
                <CustomDisplayText
                    label="จำนวนเอกสารที่ตรวจแล้ว"
                    value={`${reviewedDocumentCount} / ${values.documents.length} รายการ`}
                />
            </Grid>

            <Divider sx={{ mb: 2 }} />

            <HeadingWithColor icon={<PaidIcon sx={{ fontSize: 27 }} />} text="สรุปยอด" color="green" />
            <Grid container spacing={2}>
                <CustomDisplayText label="ยอดวางบิล" value={`${numberWithCommas(billingAmount)} บาท`} />
                <CustomDisplayText label="ยอดเบิกทั้งหมด" value={`${numberWithCommas(totalClaimedAmount)} บาท`} />
                <CustomDisplayText label="ส่วนลด" value={`${numberWithCommas(totalDiscountAmount)} บาท`} />
                <CustomDisplayText label="ยอดไม่คุ้มครอง" value={`${numberWithCommas(totalNonCoveredAmount)} บาท`} />
                <CustomDisplayText
                    label="ยอดตั้งเบิกสุทธิ"
                    value={`${numberWithCommas(netBillableAmount)} บาท`}
                    md={4}
                />
            </Grid>
        </CustomPaper>
    );
};

export default BillingSummaryStep3;
