import PersonIcon from "@mui/icons-material/Person";
import EditNoteIcon from "@mui/icons-material/EditNote";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import CancelIcon from "@mui/icons-material/Cancel";
import SummaryHeaderCard from "./SummaryHeaderCard";

const GREEN = "#2E7D32";
const GREEN_LIGHT_BG = "#E8F5E9";

export type ConsiderCustomerHeaderCardProps = {
    totalCustomerCount?: number;
    pendingRecordCount?: number;
    pendingPaymentCount?: number;
    cancelledCount?: number;
};

const ConsiderCustomerHeaderCard = ({
    totalCustomerCount = 0,
    pendingRecordCount = 0,
    pendingPaymentCount = 0,
    cancelledCount = 0,
}: ConsiderCustomerHeaderCardProps) => {
    return (
        <SummaryHeaderCard
            color={GREEN}
            lightBackground={GREEN_LIGHT_BG}
            icon={<PersonIcon sx={{ fontSize: 30 }} />}
            title="เคลมลูกค้าทั้งหมด"
            totalValue={totalCustomerCount}
            totalUnitLabel="รายการ"
            stats={[
                {
                    icon: <EditNoteIcon sx={{ color: GREEN, fontSize: 26 }} />,
                    label: "รอบันทึกข้อมูล",
                    value: pendingRecordCount,
                },
                {
                    icon: <FactCheckIcon sx={{ color: GREEN, fontSize: 26 }} />,
                    label: "รอจ่ายเงิน",
                    value: pendingPaymentCount,
                },
                {
                    icon: <CancelIcon sx={{ color: GREEN, fontSize: 26 }} />,
                    label: "ยกเลิก",
                    value: cancelledCount,
                },
            ]}
        />
    );
};

export default ConsiderCustomerHeaderCard;
