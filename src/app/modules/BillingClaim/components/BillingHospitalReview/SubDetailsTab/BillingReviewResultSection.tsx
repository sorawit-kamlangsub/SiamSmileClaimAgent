import { Box, Button, Grid, MenuItem, TextField, Typography } from "@mui/material";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import BlockIcon from "@mui/icons-material/Block";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import { useFormikContext } from "formik";
import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import DocumentScanTable from "../../../../CreatedClaim/components/CreateClaim/DocumentScanTable";
import { GetDecisionReasonDtoResponse } from "../../../../../api/coreClaimApi.client";
import {
    BILLING_DECISION_ID,
    BILLING_STATUS,
    BillingReviewFormValues,
    BillingStatusId,
} from "../../../store/billingClaim.types";

const RESULT_OPTIONS: {
    value: BillingStatusId;
    label: string;
    icon: React.ReactNode;
    color: string;
    softColor: string;
    reasonLabel: string;
    remarkLabel: string;
    /** สเปค : "รายละเอียดการรอแก้ไข*" บังคับกรอก ส่วน "รายละเอียดการปฏิเสธ" ไม่บังคับ */
    remarkRequired: boolean;
}[] = [
    {
        value: BILLING_STATUS.needsCorrection,
        label: "รอแก้ไข",
        icon: <FormatListBulletedIcon fontSize="small" />,
        color: "#806033",
        softColor: "#FAF7F2",
        reasonLabel: "สาเหตุรอแก้ไข",
        remarkLabel: "รายละเอียดการรอแก้ไข",
        remarkRequired: true,
    },
    {
        value: BILLING_STATUS.rejected,
        label: "ปฏิเสธ",
        icon: <BlockIcon fontSize="small" />,
        color: "#D76451",
        softColor: "#FFF4F1",
        reasonLabel: "สาเหตุการปฏิเสธ",
        remarkLabel: "รายละเอียดการปฏิเสธ",
        remarkRequired: false,
    },
    // สเปคตัดตัวเลือก "อนุมัติ" ออกจากบล็อกนี้ — Step 3 มีปุ่ม "อนุมัติ" แยกต่างหากใน "ปุ่มดำเนินการ"
    // CR Ver2 : ตัดตัวเลือก "ยกเลิก" ออกจากหน้าวางบิลเคลมโรงพยาบาล — ยังคงมีใน BILLING_STATUS/filter หน้า Monitor
];

type BillingReviewResultSectionProps = {
    readOnly?: boolean;
    /** ตัวเลือกสาเหตุตามสถานะที่เลือก — จาก useGetDecisionReason(undefined, decisionId) */
    reviewReason?: { data?: GetDecisionReasonDtoResponse[] };
    reviewReasonLoading?: boolean;
    /** ผูกกับ "เอกสารประกอบการปฏิเสธ" (DocumentScanTable) — ตามสเปคเดียวกับ ConsiderSection ฝั่งพิจารณาเคลม */
    productId?: number | undefined;
    aplicationCode?: string | undefined;
};

/**
 * "แจ้งผลการพิจารณาโรงพยาบาล" (Step 1 และ Step 2 — สเปคไม่มีบล็อกนี้ที่ Step 3)
 * bind `values.reviewStatusId` (2 รอแก้ไข / 4 ปฏิเสธ เท่านั้น) / `reviewReasonId` / `reviewRemark`
 */
const BillingReviewResultSection = ({
    readOnly = false,
    reviewReason,
    reviewReasonLoading = false,
    productId,
    aplicationCode,
}: BillingReviewResultSectionProps) => {
    const formik = useFormikContext<BillingReviewFormValues>();
    const selected = RESULT_OPTIONS.find((opt) => opt.value === formik.values.reviewStatusId);
    const needsReason = selected ? BILLING_DECISION_ID[selected.value] !== undefined : false;

    const selectStatus = (value: BillingStatusId) => {
        formik.setFieldValue("reviewStatusId", value);
        // เปลี่ยนสถานะ = สาเหตุของสถานะก่อนหน้าไม่เกี่ยวข้องแล้ว (คนละชุดตัวเลือก) ต้องล้างทุกครั้ง
        formik.setFieldValue("reviewReasonId", undefined);
    };

    return (
        <CustomPaper>
            <HeadingWithColor
                icon={<FactCheckIcon sx={{ fontSize: 27 }} />}
                text="แจ้งผลการพิจารณาโรงพยาบาล"
                color="blue"
            />

            <Box role="radiogroup" aria-label="เลือกผลการพิจารณาโรงพยาบาล" sx={{ mt: 2.5 }}>
                <Grid container spacing={{ xs: 1.25, sm: 2 }} justifyContent="center">
                    {RESULT_OPTIONS.map((option) => {
                        const isSelected = option.value === formik.values.reviewStatusId;
                        return (
                            <Grid item xs={6} sm={4} key={option.value}>
                                <Button
                                    fullWidth
                                    disabled={readOnly}
                                    aria-checked={isSelected}
                                    role="radio"
                                    startIcon={option.icon}
                                    variant={isSelected ? "contained" : "outlined"}
                                    onClick={() => selectStatus(option.value)}
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
                                    {`ปุ่ม${option.label}`}
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

                    {needsReason && (
                        <TextField
                            select
                            required
                            fullWidth
                            disabled={readOnly}
                            label={reviewReasonLoading ? "กำลังโหลด..." : `${selected.reasonLabel}`}
                            value={formik.values.reviewReasonId || ""}
                            onChange={(e) => formik.setFieldValue("reviewReasonId", Number(e.target.value))}
                            sx={{ bgcolor: "#fff", mb: 2 }}
                        >
                            {(reviewReason?.data ?? []).map((item) => (
                                <MenuItem key={item.decisionReasonId} value={item.decisionReasonId}>
                                    {item.decisionReasonName}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}

                    <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        disabled={readOnly}
                        required={selected.remarkRequired}
                        error={selected.remarkRequired && !formik.values.reviewRemark}
                        label={selected.remarkRequired ? `${selected.remarkLabel}` : selected.remarkLabel}
                        placeholder="ระบุรายละเอียดผลการพิจารณา"
                        value={formik.values.reviewRemark}
                        onChange={(e) => formik.setFieldValue("reviewRemark", e.target.value)}
                        inputProps={{ maxLength: 1000 }}
                        sx={{ bgcolor: "#fff" }}
                    />

                    {selected.value === BILLING_STATUS.rejected && (
                        <DocumentScanTable
                            productTypeId={productId ?? 0}
                            documentType="ใบแจ้งปฏิเสธสินไหม"
                            aplicationCode={aplicationCode ?? ""}
                            Header="เอกสารประกอบการปฏิเสธ"
                            // documentCode ที่ endpoint คืนผูกกับเคสนี้โดยเฉพาะ (ไม่ได้ส่ง caseId มา merge
                            // ทับ) ต้อง cache ตลอดไปไม่ได้ ไม่งั้นเคสอื่นที่ productTypeId เดียวกันจะเห็น
                            // เอกสารของเคสก่อนหน้าค้างอยู่ — ดู ConsiderSection.tsx จุดเดียวกัน
                            alwaysFreshMasterList
                        />
                    )}
                </Box>
            )}
        </CustomPaper>
    );
};

export default BillingReviewResultSection;
