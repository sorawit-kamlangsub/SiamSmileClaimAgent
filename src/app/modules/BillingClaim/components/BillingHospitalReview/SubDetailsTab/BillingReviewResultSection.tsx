import { Box, ButtonBase, Grid, MenuItem, TextField, Typography } from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import BlockIcon from "@mui/icons-material/Block";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useFormikContext } from "formik";
import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import DocumentScanTable from "../../../../CreatedClaim/components/CreateClaim/DocumentScanTable";
import {
    BILLING_DECISION_ID,
    BILLING_STATUS,
    BillingReviewFormValues,
    BillingStatusId,
} from "../../../store/billingClaim.types";

const RESULT_OPTIONS: {
    value: BillingStatusId;
    label: string;
    /** คำอธิบายสั้นใต้ชื่อตัวเลือก ให้ผู้ใช้รู้ผลของการเลือกก่อนกด */
    description: string;
    icon: React.ReactNode;
    /** สีหลัก (ขอบ/ไอคอน/ตัวอักษร) + สีพื้นอ่อน — ชุดสีเดียวกับสถานะ App ของโปรเจค (เหลือง/แดง) */
    color: string;
    softColor: string;
    reasonLabel: string;
    remarkLabel: string;
    /** สเปค : "รายละเอียดการรอแก้ไข*" บังคับกรอก ส่วน "รายละเอียดการปฏิเสธ" ไม่บังคับ */
    remarkRequired: boolean;
}[] = [
    {
        value: BILLING_STATUS.needsCorrection,
        label: "แจ้งแก้ไข",
        description: "ส่งกลับให้โรงพยาบาลแก้ไขข้อมูลหรือเอกสาร",
        icon: <EditNoteIcon />,
        color: "#a56e07",
        softColor: "#FFF8E6",
        reasonLabel: "สาเหตุแจ้งแก้ไข",
        remarkLabel: "รายละเอียดการแจ้งแก้ไข",
        remarkRequired: true,
    },
    {
        value: BILLING_STATUS.rejected,
        label: "ปฏิเสธ",
        description: "ปฏิเสธรายการวางบิลนี้ พร้อมระบุสาเหตุ",
        icon: <BlockIcon />,
        color: "#B32615",
        softColor: "#FFF1EF",
        reasonLabel: "สาเหตุการปฏิเสธ",
        remarkLabel: "รายละเอียดการปฏิเสธ",
        remarkRequired: false,
    },
    // สเปคตัดตัวเลือก "อนุมัติ" ออกจากบล็อกนี้ — Step 3 มีปุ่ม "อนุมัติ" แยกต่างหากใน "ปุ่มดำเนินการ"
    // CR Ver2 : ตัดตัวเลือก "ยกเลิก" ออกจากหน้าวางบิลเคลมโรงพยาบาล — ยังคงมีใน BILLING_STATUS/filter หน้า Monitor
];

export type ReviewReasonOption = { id?: number; name?: string };

type BillingReviewResultSectionProps = {
    readOnly?: boolean;
    /** ตัวเลือกสาเหตุตามสถานะที่เลือก — แจ้งแก้ไขจาก useGetDecisionReason, ปฏิเสธจาก useGetRejectReason */
    reviewReason?: ReviewReasonOption[];
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
        const isAlreadySelected = value === formik.values.reviewStatusId;

        // กดปุ่มที่เลือกอยู่แล้วซ้ำ = ยกเลิกเลือก (หุบฟอร์ม) — pattern เดียวกับ ConsiderSection ฝั่งพิจารณาเคลม
        // ล้างค่าทั้งบล็อกและไม่สั่ง validate (shouldValidate: false) เพื่อไม่ให้ค่าค้างของบล็อกนี้ไปผูกกับปุ่ม "ถัดไป"
        formik.setFieldValue("reviewStatusId", isAlreadySelected ? undefined : value, false);
        // เปลี่ยนสถานะ = สาเหตุของสถานะก่อนหน้าไม่เกี่ยวข้องแล้ว (คนละชุดตัวเลือก) ต้องล้างทุกครั้ง
        formik.setFieldValue("reviewReasonId", undefined, false);
        if (isAlreadySelected) formik.setFieldValue("reviewRemark", "", false);
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
                            <Grid item xs={12} sm={6} md={4} key={option.value}>
                                <ButtonBase
                                    disabled={readOnly}
                                    aria-checked={isSelected}
                                    role="radio"
                                    onClick={() => selectStatus(option.value)}
                                    sx={{
                                        position: "relative",
                                        width: "100%",
                                        height: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "flex-start",
                                        gap: 1.5,
                                        p: "14px 16px",
                                        textAlign: "left",
                                        borderRadius: 3,
                                        border: "1px solid",
                                        borderColor: isSelected ? option.color : "divider",
                                        boxShadow: isSelected ? `0 0 0 1px ${option.color}` : "none",
                                        bgcolor: isSelected ? option.softColor : "background.paper",
                                        transition: "border-color .15s, background-color .15s, box-shadow .15s",
                                        "&:hover": { borderColor: option.color, bgcolor: option.softColor },
                                        "&.Mui-focusVisible": { boxShadow: `0 0 0 3px ${option.color}40` },
                                        "&.Mui-disabled": { opacity: isSelected ? 1 : 0.55 },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            flexShrink: 0,
                                            width: 40,
                                            height: 40,
                                            borderRadius: "50%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: isSelected ? "#fff" : option.color,
                                            bgcolor: isSelected ? option.color : option.softColor,
                                            transition: "background-color .15s, color .15s",
                                        }}
                                    >
                                        {option.icon}
                                    </Box>
                                    <Box sx={{ minWidth: 0, pr: 3 }}>
                                        <Typography sx={{ fontWeight: 700, color: option.color, lineHeight: 1.4 }}>
                                            {option.label}
                                        </Typography>
                                        <Typography sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
                                            {option.description}
                                        </Typography>
                                    </Box>
                                    {isSelected && (
                                        <CheckCircleIcon
                                            sx={{
                                                position: "absolute",
                                                top: 10,
                                                right: 10,
                                                fontSize: 20,
                                                color: option.color,
                                            }}
                                        />
                                    )}
                                </ButtonBase>
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
                        borderLeft: `4px solid ${selected.color}`,
                        borderRadius: 2,
                        bgcolor: selected.softColor,
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 2,
                            color: selected.color,
                            "& .MuiSvgIcon-root": { fontSize: 20 },
                        }}
                    >
                        {selected.icon}
                        <Typography fontWeight={700}>รายละเอียด{selected.label}</Typography>
                    </Box>

                    {needsReason && (
                        <TextField
                            select
                            required
                            fullWidth
                            disabled={readOnly}
                            label={reviewReasonLoading ? "กำลังโหลด..." : selected.reasonLabel}
                            value={formik.values.reviewReasonId || ""}
                            onChange={(e) => formik.setFieldValue("reviewReasonId", Number(e.target.value))}
                            sx={{ bgcolor: "#fff", mb: 2 }}
                        >
                            {(reviewReason ?? []).map((item) => (
                                <MenuItem key={item.id} value={item.id}>
                                    {item.name}
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
                        label={selected.remarkLabel}
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
