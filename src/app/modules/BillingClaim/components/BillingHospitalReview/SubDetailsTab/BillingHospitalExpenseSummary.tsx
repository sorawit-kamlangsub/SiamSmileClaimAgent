import { Grid } from "@mui/material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";

import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import { CustomDisplayText } from "../../../../_common/components/CustomComponent/CustomDisplayText";
import { numberWithCommas } from "../../../../../functionHelpers";
import { BillingTotalsDto } from "../../../../../api/coreClaimApi.client";
import { PENDING_BE } from "../../../store/billingPendingFields";

type BillingHospitalExpenseSummaryProps = {
    /** `detail.totals` — ยอดของ BillingDetail (สถานะ 1 = คำนวณจาก source snapshot, hospital-billing-fe.md ข้อ 5/6) */
    totals: BillingTotalsDto | undefined;
};

const displayAmount = (value: number | undefined) => (value !== undefined ? numberWithCommas(value, 2) : PENDING_BE);

/**
 * Step 2 : "รายการค่ารักษา(จากโรงพยาบาล)" (variant A/OPD Half เท่านั้น) — ข้อมูลก่อนพิจารณา อ้างอิงตาม
 * SmileConnect ล้วน ใช้ `detail.totals` (BE/SmileConnect คำนวณให้แล้ว ห้ามคำนวณเองฝั่ง FE, hospital-billing-fe.md
 * ข้อ 6) : ยอดเบิกทั้งหมด = `totalClaimedAmount`, ส่วนลดทั้งหมด = `totalDiscountAmount` (รายบรรทัด),
 * ส่วนลดบริษัทประกัน/ลูกค้า = `insuranceDiscountAmount`/`customerDiscountAmount`, ยอดเบิกสุทธิ =
 * `netBillableAmount` — ทั้งสามค่าหลังนี้เป็นค่าจาก SmileConnect ตรง ๆ ไม่ใช่ยอดที่คำนวณทับใน Step 2
 */
const BillingHospitalExpenseSummary = ({ totals }: BillingHospitalExpenseSummaryProps) => (
    <CustomPaper>
        <HeadingWithColor
            icon={<LocalHospitalIcon sx={{ fontSize: 27 }} />}
            text="รายการค่ารักษา(จากโรงพยาบาล)"
            color="blue"
        />
        <Grid container spacing={2}>
            <CustomDisplayText label="ยอดเบิกทั้งหมด" value={displayAmount(totals?.totalClaimedAmount)} />
            <CustomDisplayText label="ส่วนลดทั้งหมด" value={displayAmount(totals?.totalDiscountAmount)} />
            <CustomDisplayText label="ส่วนลดบริษัทประกัน" value={displayAmount(totals?.insuranceDiscountAmount)} />
            <CustomDisplayText label="ส่วนลดลูกค้า" value={displayAmount(totals?.customerDiscountAmount)} />
            <CustomDisplayText label="ยอดเบิกสุทธิ" value={displayAmount(totals?.netBillableAmount)} />
        </Grid>
    </CustomPaper>
);

export default BillingHospitalExpenseSummary;
