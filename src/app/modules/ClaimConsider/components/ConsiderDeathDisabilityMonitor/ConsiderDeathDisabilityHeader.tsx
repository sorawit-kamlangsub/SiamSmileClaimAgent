import { Paper } from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import EditNoteIcon from "@mui/icons-material/EditNote";
import BlockIcon from "@mui/icons-material/Block";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SummaryHeaderCard from "../_common/SummaryHeaderCard";

/** จำนวนเคลมแยกตามสถานะ — TODO(death-disability-api): map จาก dashboard DTO จริงเมื่อ BE มี endpoint */
export type DeathDisabilitySummary = {
    totalCount?: number;
    waitConsiderCount?: number;
    inProgressCount?: number;
    waitEditCount?: number;
    rejectCount?: number;
    cancelCount?: number;
    approveCount?: number;
};

const ConsiderDeathDisabilityHeader = ({ summary }: { summary?: DeathDisabilitySummary }) => {
    // ยังไม่มีข้อมูลให้แสดง "-" แทน 0 เพื่อไม่ให้เข้าใจผิดว่าไม่มีเคส
    const show = (value?: number) => value ?? "-";
    return (
        <Paper
            elevation={3}
            sx={{
                border: "1px solid #E0E0E0",
                borderLeft: "4px solid #1a5da8",
                borderRadius: "16px",
                padding: { xs: "10px 12px", sm: "16px 20px" },
            }}
        >
            <SummaryHeaderCard
                color="#1a5da8"
                lightBackground="#eaf5ff"
                icon={<DescriptionIcon />}
                title="รายการเคลมทั้งหมด"
                totalValue={show(summary?.totalCount)}
                totalUnitLabel="รายการ"
                stats={[
                    { icon: <ReceiptLongIcon />, label: "รอพิจารณา", value: show(summary?.waitConsiderCount) },
                    {
                        icon: <HourglassBottomIcon />,
                        label: "อยู่ระหว่างทำรายการ",
                        value: show(summary?.inProgressCount),
                    },
                    { icon: <EditNoteIcon />, label: "รอแก้ไข", value: show(summary?.waitEditCount) },
                    { icon: <BlockIcon />, label: "ปฏิเสธ", value: show(summary?.rejectCount) },
                    { icon: <CancelIcon />, label: "ยกเลิก", value: show(summary?.cancelCount) },
                    { icon: <CheckCircleIcon />, label: "อนุมัติ", value: show(summary?.approveCount) },
                ]}
            />
        </Paper>
    );
};

export default ConsiderDeathDisabilityHeader;
