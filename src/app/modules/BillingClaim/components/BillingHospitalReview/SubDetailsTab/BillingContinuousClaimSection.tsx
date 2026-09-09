import { useState } from "react";
import { Box, Button, Checkbox, FormControlLabel, Grid, Typography } from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import { useFormikContext } from "formik";

import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import { CustomDisplayText } from "../../../../_common/components/CustomComponent/CustomDisplayText";
import ContinuousClaimDialog from "../../../../CheckEligible/components/ContinuousClaimDialog";
import { formatDateString, numberWithCommas } from "../../../../../functionHelpers";
import { BillingReviewFormValues } from "../../../store/billingClaim.types";

type BillingContinuousClaimSectionProps = {
    applicationId: string | undefined;
    readOnly?: boolean;
};

/**
 * "เคลมต่อเนื่อง" (Step 1) — checkbox + Modal เลือกเคลมต่อเนื่อง (reuse `ContinuousClaimDialog` ของ CheckEligible
 * ตรง ๆ เพราะ props เป็น `{open, applicationId, onClose, onConfirm}` ล้วน ไม่ผูก Formik context ของโมดูลอื่น)
 *
 * สเปค : "*Default ข้อมูลจาก SmileConnect ถ้าเกิดเลือกเคลมต่อเนื่องมาตั้งแต่ SmileConnect" — ค่า default
 * ยังไม่มีใน `BillingReviewDataDto` (PENDING_BE_FIELDS.continuousClaimDefault) การเลือกเองผ่าน Modal
 * ยังทำงานได้ตามปกติ เพียงแต่ไม่มีค่าเริ่มต้นให้ตอนโหลดหน้า
 */
const BillingContinuousClaimSection = ({ applicationId, readOnly = false }: BillingContinuousClaimSectionProps) => {
    const formik = useFormikContext<BillingReviewFormValues>();
    const [dialogOpen, setDialogOpen] = useState(false);
    const selected = formik.values.continuousClaim;

    const handleToggle = (checked: boolean) => {
        formik.setFieldValue("isContinuousClaim", checked);
        if (checked) {
            setDialogOpen(true);
        } else {
            formik.setFieldValue("continuousClaim", undefined);
        }
    };

    return (
        <CustomPaper>
            <HeadingWithColor icon={<LinkIcon sx={{ fontSize: 27 }} />} text="เคลมต่อเนื่อง" color="blue" />

            <FormControlLabel
                sx={{ mt: 1 }}
                control={
                    <Checkbox
                        checked={formik.values.isContinuousClaim}
                        disabled={readOnly}
                        onChange={(e) => handleToggle(e.target.checked)}
                    />
                }
                label="เคลมต่อเนื่อง"
            />

            {selected && (
                <Box sx={{ mt: 1.5, p: 2, borderRadius: 2, bgcolor: "#F4F7FA" }}>
                    <Grid container spacing={2}>
                        <CustomDisplayText label="เลขที่ CL" value={selected.claimNo} />
                        <CustomDisplayText
                            label="วันที่เข้า รพ."
                            value={formatDateString(selected.admissionDate, "DD/MM/BBBB")}
                        />
                        <CustomDisplayText label="การวินิจฉัย 1" value={selected.icD10Detail} />
                        <CustomDisplayText label="วงเงินคงเหลือ" value={numberWithCommas(selected.remainAmount ?? 0)} />
                    </Grid>
                    {!readOnly && (
                        <Button size="small" sx={{ mt: 1 }} onClick={() => setDialogOpen(true)}>
                            แก้ไขการเลือก
                        </Button>
                    )}
                </Box>
            )}

            {!selected && formik.values.isContinuousClaim && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    ยังไม่ได้เลือกรายการเคลมต่อเนื่อง
                </Typography>
            )}

            <ContinuousClaimDialog
                open={dialogOpen}
                applicationId={applicationId}
                onClose={() => setDialogOpen(false)}
                onConfirm={(claim) => {
                    formik.setFieldValue("continuousClaim", claim);
                    setDialogOpen(false);
                }}
            />
        </CustomPaper>
    );
};

export default BillingContinuousClaimSection;
