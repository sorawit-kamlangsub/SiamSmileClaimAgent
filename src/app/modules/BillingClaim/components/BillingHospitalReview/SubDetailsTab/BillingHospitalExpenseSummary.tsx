import { Grid } from "@mui/material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";

import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import { CustomDisplayText } from "../../../../_common/components/CustomComponent/CustomDisplayText";
import { numberWithCommas } from "../../../../../functionHelpers";
import { PENDING_BE } from "../../../store/billingPendingFields";

type BillingHospitalExpenseSummaryProps = {
    /** `detail.originalBilledAmount` — ยอดรวมที่โรงพยาบาลส่งมาจาก SmileConnect */
    originalBilledAmount: number | undefined;
};

/**
 * Step 2 : "รายการค่ารักษา(จากโรงพยาบาล)" (variant A/OPD Half เท่านั้น) — ข้อมูลก่อนพิจารณา อ้างอิงตาม
 * SmileConnect ล้วน `BillingDetailDto` มีแค่ `originalBilledAmount` (ยอดรวม) — ยังไม่มีฟิลด์ "ส่วนลดทั้งหมด"
 * แยกจากยอดรวม จึง derive "ยอดเบิกสุทธิ" ไม่ได้ (PENDING_BE_FIELDS.hospitalExpenseSummary)
 */
const BillingHospitalExpenseSummary = ({ originalBilledAmount }: BillingHospitalExpenseSummaryProps) => (
    <CustomPaper>
        <HeadingWithColor
            icon={<LocalHospitalIcon sx={{ fontSize: 27 }} />}
            text="รายการค่ารักษา(จากโรงพยาบาล)"
            color="blue"
        />
        <Grid container spacing={2}>
            <CustomDisplayText
                label="ยอดเบิกทั้งหมด"
                value={originalBilledAmount !== undefined ? numberWithCommas(originalBilledAmount, 2) : PENDING_BE}
            />
            <CustomDisplayText label="ส่วนลดทั้งหมด" value={PENDING_BE} />
            <CustomDisplayText label="ยอดเบิกสุทธิ" value={PENDING_BE} />
        </Grid>
    </CustomPaper>
);

export default BillingHospitalExpenseSummary;
