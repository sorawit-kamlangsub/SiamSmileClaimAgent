import { Box, Button, Grid, TextField, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import BlockIcon from "@mui/icons-material/Block";
import CancelIcon from "@mui/icons-material/Cancel";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import { useFormikContext } from "formik";
import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import { BILLING_STATUS, BillingReviewFormValues, BillingStatusId } from "../../../store/billingClaim.types";

const RESULT_OPTIONS: {
    value: BillingStatusId;
    label: string;
    icon: React.ReactNode;
    color: string;
    softColor: string;
}[] = [
    {
        value: BILLING_STATUS.passed,
        label: "ผ่าน",
        icon: <CheckCircleIcon fontSize="small" />,
        color: "#178236",
        softColor: "#F0FDF4",
    },
    {
        value: BILLING_STATUS.needsCorrection,
        label: "รอแก้ไข",
        icon: <FormatListBulletedIcon fontSize="small" />,
        color: "#806033",
        softColor: "#FAF7F2",
    },
    {
        value: BILLING_STATUS.rejected,
        label: "ไม่ผ่าน",
        icon: <BlockIcon fontSize="small" />,
        color: "#D76451",
        softColor: "#FFF4F1",
    },
    {
        value: BILLING_STATUS.cancelled,
        label: "ยกเลิก",
        icon: <CancelIcon fontSize="small" />,
        color: "#D92D2D",
        softColor: "#FFF4F4",
    },
];

/** Step 3 "ผลการตรวจสอบ" — bind `values.reviewStatusId` / `values.reviewRemark` (≤1000 ตัวอักษร) */
const BillingReviewResultSection = ({ readOnly = false }: { readOnly?: boolean }) => {
    const formik = useFormikContext<BillingReviewFormValues>();
    const selected = RESULT_OPTIONS.find((opt) => opt.value === formik.values.reviewStatusId);

    return (
        <CustomPaper>
            <HeadingWithColor icon={<FactCheckIcon sx={{ fontSize: 27 }} />} text="ผลการตรวจสอบ" color="blue" />

            <Box role="radiogroup" aria-label="เลือกผลการตรวจสอบ" sx={{ mt: 2.5 }}>
                <Grid container spacing={{ xs: 1.25, sm: 2 }}>
                    {RESULT_OPTIONS.map((option) => {
                        const isSelected = option.value === formik.values.reviewStatusId;
                        return (
                            <Grid item xs={6} lg={3} key={option.value}>
                                <Button
                                    fullWidth
                                    disabled={readOnly}
                                    aria-checked={isSelected}
                                    role="radio"
                                    startIcon={option.icon}
                                    variant={isSelected ? "contained" : "outlined"}
                                    onClick={() => formik.setFieldValue("reviewStatusId", option.value)}
                                    sx={{
                                        minHeight: { xs: 48, sm: 54 },
                                        borderColor: option.color,
                                        borderRadius: 3,
                                        color: isSelected ? "#fff" : option.color,
                                        bgcolor: isSelected ? option.color : "#fff",
                                        fontWeight: 600,
                                        "&:hover": {
                                            borderColor: option.color,
                                            bgcolor: isSelected ? option.color : option.softColor,
                                        },
                                    }}
                                >
                                    {option.label}
                                </Button>
                            </Grid>
                        );
                    })}
                </Grid>
            </Box>

            {selected && (
                <Box
                    sx={{
                        mt: { xs: 2, md: 3 },
                        p: { xs: 2, sm: 3 },
                        border: `1px solid ${selected.color}33`,
                        borderRadius: 2,
                        bgcolor: selected.softColor,
                    }}
                >
                    <Typography fontWeight={600} sx={{ color: selected.color, mb: 1.5 }}>
                        {selected.label}
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        disabled={readOnly}
                        label="หมายเหตุผลการตรวจสอบ"
                        placeholder="ระบุรายละเอียดผลการตรวจสอบ"
                        value={formik.values.reviewRemark}
                        onChange={(e) => formik.setFieldValue("reviewRemark", e.target.value)}
                        inputProps={{ maxLength: 1000 }}
                        sx={{ bgcolor: "#fff" }}
                    />
                </Box>
            )}
        </CustomPaper>
    );
};

export default BillingReviewResultSection;
