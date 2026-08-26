import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import ArticleIcon from "@mui/icons-material/Article";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import SummaryHeaderCard from "./SummaryHeaderCard";

const BLUE = "#1565C0";
const BLUE_LIGHT_BG = "#E3F2FD";

export type ConsiderHospitalHeaderCardProps = {
    totalHospitalClaimCount?: number;
    checkingRightsCount?: number;
    pendingConsiderationCount?: number;
    pendingBillingCount?: number;
};

const ConsiderHospitalHeaderCard = ({
    totalHospitalClaimCount = 0,
    checkingRightsCount = 0,
    pendingConsiderationCount = 0,
    pendingBillingCount = 0,
}: ConsiderHospitalHeaderCardProps) => {
    return (
        <SummaryHeaderCard
            color={BLUE}
            lightBackground={BLUE_LIGHT_BG}
            icon={<LocalHospitalIcon sx={{ fontSize: 30 }} />}
            title="เคลมโรงพยาบาลทั้งหมด"
            totalValue={totalHospitalClaimCount}
            totalUnitLabel="รายการ"
            stats={[
                {
                    icon: <PlaylistAddCheckIcon sx={{ color: BLUE, fontSize: 26 }} />,
                    label: "ตรวจสอบสิทธิ์",
                    value: checkingRightsCount,
                },
                {
                    icon: <ArticleIcon sx={{ color: BLUE, fontSize: 26 }} />,
                    label: "รอพิจารณา",
                    value: pendingConsiderationCount,
                },
                {
                    icon: <AccountBalanceIcon sx={{ color: BLUE, fontSize: 26 }} />,
                    label: "รอวางบิล",
                    value: pendingBillingCount,
                },
            ]}
        />
    );
};

export default ConsiderHospitalHeaderCard;
