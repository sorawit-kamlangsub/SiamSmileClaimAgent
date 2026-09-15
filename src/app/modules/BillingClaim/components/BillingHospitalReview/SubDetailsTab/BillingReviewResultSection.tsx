import { Box, Button, Grid, MenuItem, TextField, Tooltip, Typography } from "@mui/material";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import BlockIcon from "@mui/icons-material/Block";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { MUIDataTableColumn } from "mui-datatables";
import { useFormikContext } from "formik";
import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import { StandardDataTable } from "../../../../_common";
import { cellAlignOptions, defaultOptionStandardDataTable } from "../../../../../functionHelpers";
import { GetDecisionReasonDtoResponse } from "../../../../../api/coreClaimApi.client";
import { PENDING_BE_TOOLTIP } from "../../../store/billingPendingFields";
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
};

/**
 * "แจ้งผลการพิจารณาโรงพยาบาล" (Step 1 และ Step 2 — สเปคไม่มีบล็อกนี้ที่ Step 3)
 * bind `values.reviewStatusId` (2 รอแก้ไข / 4 ปฏิเสธ เท่านั้น) / `reviewReasonId` / `reviewRemark`
 */
const BillingReviewResultSection = ({
    readOnly = false,
    reviewReason,
    reviewReasonLoading = false,
}: BillingReviewResultSectionProps) => {
    const formik = useFormikContext<BillingReviewFormValues>();
    const selected = RESULT_OPTIONS.find((opt) => opt.value === formik.values.reviewStatusId);
    const needsReason = selected ? BILLING_DECISION_ID[selected.value] !== undefined : false;
    const rejectionDocuments = formik.values.rejectionDocuments;

    const selectStatus = (value: BillingStatusId) => {
        formik.setFieldValue("reviewStatusId", value);
        // เปลี่ยนสถานะ = สาเหตุของสถานะก่อนหน้าไม่เกี่ยวข้องแล้ว (คนละชุดตัวเลือก) ต้องล้างทุกครั้ง
        formik.setFieldValue("reviewReasonId", undefined);
    };

    const rejectionDocumentColumns: MUIDataTableColumn[] = [
        {
            name: "documentSubTypeName",
            label: "ประเภทเอกสาร",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "left" }) },
        },
        {
            name: "_scan",
            label: "สแกนเอกสาร",
            options: {
                filter: false,
                sort: false,
                ...cellAlignOptions({ align: "center" }),
                // PENDING-BE: PENDING_BE_FIELDS.rejectionDocumentType — ยังไม่มี master/endpoint ให้ยิงจริง
                customBodyRender: () => (
                    <Tooltip title={PENDING_BE_TOOLTIP} arrow>
                        <span>
                            <Button size="small" variant="contained" disabled sx={{ width: 140 }}>
                                สแกนเอกสาร
                            </Button>
                        </span>
                    </Tooltip>
                ),
            },
        },
        {
            name: "fileCount",
            label: "จำนวนเอกสาร",
            options: {
                filter: false,
                sort: false,
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: (value: number | undefined) => value ?? 0,
            },
        },
        {
            name: "_view",
            label: "รายละเอียด",
            options: {
                filter: false,
                sort: false,
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: (_value, tableMeta) => {
                    const hasFile = (rejectionDocuments[tableMeta.rowIndex]?.fileCount ?? 0) > 0;
                    return (
                        <Tooltip title={hasFile ? "ดูรายละเอียด" : "ยังไม่มีเอกสาร"} arrow>
                            <span>
                                <VisibilityIcon color={hasFile ? "primary" : "disabled"} fontSize="small" />
                            </span>
                        </Tooltip>
                    );
                },
            },
        },
    ];

    return (
        <CustomPaper>
            <HeadingWithColor
                icon={<FactCheckIcon sx={{ fontSize: 27 }} />}
                text="แจ้งผลการพิจารณาโรงพยาบาล"
                color="blue"
            />

            <Box role="radiogroup" aria-label="เลือกผลการพิจารณาโรงพยาบาล" sx={{ mt: 2.5 }}>
                <Grid container spacing={{ xs: 1.25, sm: 2 }}>
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
                            label={reviewReasonLoading ? "กำลังโหลด..." : `${selected.reasonLabel} *`}
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
                        label={selected.remarkRequired ? `${selected.remarkLabel} *` : selected.remarkLabel}
                        placeholder="ระบุรายละเอียดผลการพิจารณา"
                        value={formik.values.reviewRemark}
                        onChange={(e) => formik.setFieldValue("reviewRemark", e.target.value)}
                        inputProps={{ maxLength: 1000 }}
                        sx={{ bgcolor: "#fff" }}
                    />

                    {selected.value === BILLING_STATUS.rejected && (
                        <Box sx={{ mt: 2 }}>
                            <Typography fontWeight={600} sx={{ mb: 1 }}>
                                เอกสารประกอบการปฏิเสธ
                            </Typography>
                            <StandardDataTable
                                name="billingRejectionDocumentTable"
                                title=""
                                data={rejectionDocuments}
                                columns={rejectionDocumentColumns}
                                color="primary"
                                columnHeaderAlign="center"
                                displayToolbar={false}
                                displayFooter={false}
                                options={defaultOptionStandardDataTable}
                            />
                        </Box>
                    )}
                </Box>
            )}
        </CustomPaper>
    );
};

export default BillingReviewResultSection;
