import { Alert, Box } from "@mui/material";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import { useAppSelector } from "../../../../../../../redux";
import { claimConsiderSelector } from "../../../../store/claimConsiderSlice";
import { formatDateString } from "../../../../../../functionHelpers";

// แสดงทุก step ของ wizard (ไม่ใช่แค่ step "บันทึกข้อมูลเคลม") เพราะแบบร่างกระทบข้อมูลทั้งฟอร์มและ
// รายการค่าใช้จ่าย — ถ้าโชว์แค่ step แรก ผู้ใช้ที่ไปถึง step "รายละเอียดค่าใช้จ่าย" (ซึ่งยอดไหลต่อไปเป็น
// ยอดคำนวณ/อนุมัติจริง) จะไม่เห็นคำเตือนว่าข้อมูลที่เห็นมาจาก snapshot เก่า ทั้งที่ฟอร์มยังแก้ไขต่อได้
const DraftViewingBanner = () => {
    const { viewingDraft } = useAppSelector(claimConsiderSelector);
    if (!viewingDraft) return null;

    const savedAt = formatDateString(viewingDraft.createdDate, "DD/MM/BBBB [เวลา] HH:mm [น.]");
    const meta = [savedAt && `บันทึกเมื่อ ${savedAt}`, viewingDraft.employeeName, viewingDraft.transactionLogRemark]
        .filter(Boolean)
        .join(" · ");

    return (
        <Alert
            severity="warning"
            icon={<WarningAmberOutlinedIcon />}
            sx={{ mb: 2, borderRadius: 2, alignItems: "center", fontWeight: 700, border: "1px solid #E0E0E0" }}
        >
            <Box>กำลังดูข้อมูลจาก “บันทึกแบบร่าง”</Box>
            {meta && <Box sx={{ fontWeight: 400, fontSize: 14, mt: 0.25 }}>{meta}</Box>}
        </Alert>
    );
};

export default DraftViewingBanner;
