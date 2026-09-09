import { Paper, Skeleton } from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import EditNoteIcon from "@mui/icons-material/EditNote";
import BlockIcon from "@mui/icons-material/Block";
import CancelIcon from "@mui/icons-material/Cancel";
import SummaryHeaderCard from "../../../ClaimConsider/components/_common/SummaryHeaderCard";
import { BILLING_STATUS, BILLING_STATUS_LABEL } from "../../store/billingClaim.types";

const BLUE = "#1565C0";
const BLUE_LIGHT_BG = "#E3F2FD";

type BillingHospitalHeaderProps = {
    /** `data.data.counts` จาก GET /billing/hospital/filter — key เป็น string เช่น `counts["1"]` */
    counts: { [key: string]: number } | undefined;
    isLoading?: boolean;
};

/**
 * Dashboard สรุปจำนวนรายการวางบิลโรงพยาบาลตาม 4 สถานะ
 *
 * `counts` มาจาก BE ตรง ๆ (นับตามคำค้นก่อนกรอง status และก่อนแบ่งหน้า — hospital-billing-fe.md ข้อ 4)
 * ไม่มีการนับเองฝั่ง FE
 */
const BillingHospitalHeader = ({ counts, isLoading = false }: BillingHospitalHeaderProps) => {
    const countOf = (statusId: number) => counts?.[String(statusId)] ?? 0;
    const total =
        countOf(BILLING_STATUS.pendingReview) +
        countOf(BILLING_STATUS.needsCorrection) +
        countOf(BILLING_STATUS.rejected) +
        countOf(BILLING_STATUS.cancelled);

    return (
        <Paper elevation={3} sx={{ border: "1px solid #E0E0E0", borderRadius: "16px", padding: "16px 20px" }}>
            {isLoading ? (
                <Skeleton variant="rounded" height={120} />
            ) : (
                <SummaryHeaderCard
                    color={BLUE}
                    lightBackground={BLUE_LIGHT_BG}
                    icon={<ReceiptLongIcon sx={{ fontSize: 30 }} />}
                    title="รายการวางบิลเคลมโรงพยาบาลทั้งหมด"
                    totalValue={total}
                    totalUnitLabel="รายการ"
                    stats={[
                        {
                            icon: <PendingActionsIcon sx={{ color: BLUE, fontSize: 26 }} />,
                            label: BILLING_STATUS_LABEL[BILLING_STATUS.pendingReview],
                            value: countOf(BILLING_STATUS.pendingReview),
                        },
                        {
                            icon: <EditNoteIcon sx={{ color: BLUE, fontSize: 26 }} />,
                            label: BILLING_STATUS_LABEL[BILLING_STATUS.needsCorrection],
                            value: countOf(BILLING_STATUS.needsCorrection),
                        },
                        {
                            icon: <BlockIcon sx={{ color: BLUE, fontSize: 26 }} />,
                            label: BILLING_STATUS_LABEL[BILLING_STATUS.rejected],
                            value: countOf(BILLING_STATUS.rejected),
                        },
                        {
                            icon: <CancelIcon sx={{ color: BLUE, fontSize: 26 }} />,
                            label: BILLING_STATUS_LABEL[BILLING_STATUS.cancelled],
                            value: countOf(BILLING_STATUS.cancelled),
                        },
                    ]}
                />
            )}
        </Paper>
    );
};

export default BillingHospitalHeader;
