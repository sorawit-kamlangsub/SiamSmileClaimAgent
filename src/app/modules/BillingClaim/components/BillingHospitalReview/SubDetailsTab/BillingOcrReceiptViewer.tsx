import { Box, Button, Tooltip, Typography } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ReceiptIcon from "@mui/icons-material/Receipt";

import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import { PENDING_BE_TOOLTIP } from "../../../store/billingPendingFields";

/**
 * Step 2 : "OCR ใบแจ้งค่ารักษา" (variant A/OPD Half เท่านั้น) — สเปคให้เป็น Read-only ล้วนในหน้าพิจารณาวางบิล
 * (ไม่อนุญาตอัปโหลดใหม่ ลบเอกสาร หรือประมวลผล OCR ซ้ำ) จึงไม่ reuse `OcrReceiptSection.tsx` (uploader ตัวเต็ม
 * ที่หน้าพิจารณาเคลมใช้จริง ไม่มี prop readOnly) — แสดงเป็น shell ปิดการใช้งานแทน
 *
 * PENDING-BE: PENDING_BE_FIELDS.ocrReceiptFiles — ยังไม่มีรายชื่อไฟล์/สถานะ OCR จริงจาก `BillingReviewDataDto`
 */
const BillingOcrReceiptViewer = () => {
    return (
        <CustomPaper>
            <HeadingWithColor icon={<ReceiptIcon sx={{ fontSize: 27 }} />} text="OCR ใบแจ้งค่ารักษา" color="blue" />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                อัปโหลดใบแจ้งค่ารักษาเพื่อให้ระบบ OCR อ่านรายการและกรอกยอดเงินลงในตารางค่าใช้จ่ายอัตโนมัติ
                (ในหน้าพิจารณาวางบิล ไม่อนุญาตให้อัปโหลดเอกสารใหม่ ลบเอกสาร หรือประมวลผล OCR ซ้ำ)
            </Typography>

            <Tooltip title={PENDING_BE_TOOLTIP} arrow>
                <span>
                    <Button variant="outlined" disabled startIcon={<UploadFileIcon />} sx={{ mb: 2 }}>
                        อัปโหลดใบแจ้งค่ารักษา
                    </Button>
                </span>
            </Tooltip>

            <Box
                sx={{
                    p: 2,
                    borderRadius: 2,
                    border: "1px dashed",
                    borderColor: "divider",
                    color: "text.secondary",
                    textAlign: "center",
                }}
            >
                ยังไม่มีเอกสารใบแจ้งค่ารักษาที่แนบไว้
            </Box>
        </CustomPaper>
    );
};

export default BillingOcrReceiptViewer;
