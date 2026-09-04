import { Box, Grid, TextField, Typography } from "@mui/material";
import CalculateIcon from "@mui/icons-material/Calculate";
import { useFormikContext } from "formik";
import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import { handleFloatingInputChange, numberWithCommas } from "../../../../../functionHelpers";
import { BillingReviewFormValues } from "../../../store/billingClaim.types";

type SummaryBoxProps = { label: string; value: number; color?: string };

const SummaryBox = ({ label, value, color = "#1565C0" }: SummaryBoxProps) => (
    <Box
        sx={{
            border: "1px solid #E0E0E0",
            borderRadius: "12px",
            padding: "12px 16px",
            textAlign: "center",
            height: "100%",
        }}
    >
        <Typography sx={{ color: "text.secondary", fontSize: "0.85rem" }}>{label}</Typography>
        <Typography sx={{ fontWeight: 700, fontSize: "1.4rem", color }}>{numberWithCommas(value)}</Typography>
    </Box>
);

type BillTailDiscountCardProps = {
    /** totalClaimedAmount = Σ claimAmount (handoff ข้อ 6) */
    totalClaimedAmount: number;
    /** netBillableAmount = max(0, totalClaimedAmount − ssEndDiscountAmount) */
    netBillableAmount: number;
    readOnly?: boolean;
};

/** Step 2 : "สรุปยอดเงินตามการพิจารณา" + "ส่วนลดท้ายบิล" — bind `values.ssEndDiscountAmount` */
const BillTailDiscountCard = ({
    totalClaimedAmount,
    netBillableAmount,
    readOnly = false,
}: BillTailDiscountCardProps) => {
    const formik = useFormikContext<BillingReviewFormValues>();
    const discount = formik.values.ssEndDiscountAmount;
    const discountError = discount < 0 || discount > totalClaimedAmount;

    return (
        <CustomPaper>
            <HeadingWithColor
                icon={<CalculateIcon sx={{ fontSize: 27 }} />}
                text="สรุปยอดเงินตามการพิจารณา"
                color="blue"
            />

            <HeadingWithColor text="ส่วนลดท้ายบิล" color="orange" />
            <Grid container spacing={2} alignItems="flex-end">
                <Grid item xs={12} sm={4}>
                    <SummaryBox label="ยอดเบิกรวม (ก่อนหักส่วนลด SS)" value={totalClaimedAmount} />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Typography sx={{ color: "text.secondary", fontSize: "0.85rem", mb: 0.5 }}>
                        ส่วนลด SS ท้ายบิล
                    </Typography>
                    <TextField
                        fullWidth
                        size="small"
                        value={discount || ""}
                        disabled={readOnly}
                        error={discountError}
                        helperText={discountError ? "ต้องไม่ต่ำกว่า 0 และไม่เกินยอดเบิกรวม" : " "}
                        onInput={handleFloatingInputChange}
                        onChange={(e) => formik.setFieldValue("ssEndDiscountAmount", Number(e.target.value) || 0)}
                        inputProps={{ inputMode: "decimal", style: { textAlign: "right" } }}
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <SummaryBox label="ยอดเบิกสุทธิ (netBillableAmount)" value={netBillableAmount} color="#178236" />
                </Grid>
            </Grid>
        </CustomPaper>
    );
};

export default BillTailDiscountCard;
