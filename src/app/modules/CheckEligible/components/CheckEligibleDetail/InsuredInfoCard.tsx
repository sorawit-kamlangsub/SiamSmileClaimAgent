import React from "react";
import { Box, Typography, Link, Divider } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import CakeIcon from "@mui/icons-material/Cake";
import BadgeIcon from "@mui/icons-material/Badge";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import PinDropIcon from "@mui/icons-material/PinDrop";
import WorkIcon from "@mui/icons-material/Work";
import useCheckEligibleDetail, { InsuredInfo } from "../../hooks/CheckEligibleDetail/useCheckEligibleDetail";

const PH_DETAIL_URL = "https://sssph.siamsmile.co.th/Modules/PH/frmPHDetail";

type Props = {
    insured: InsuredInfo;
};

type InfoRowProps = {
    icon: React.ReactNode;
    label: string;
    value?: string | null;
};

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value }) => (
    <Box display="flex" alignItems="center" gap={1} py={0.6}>
        <Box color="text.secondary" display="flex" alignItems="center">
            {icon}
        </Box>
        <Typography variant="body2" color="text.secondary" minWidth={160}>
            {label} :
        </Typography>
        <Typography variant="body2" color="primary" fontWeight={700}>
            {value || "-"}
        </Typography>
    </Box>
);

const InsuredInfoCard: React.FC<Props> = ({ insured }) => {
    const { policyAge, currentAge, birthDateThai, fullName } = useCheckEligibleDetail(insured);

    return (
        <Box
            sx={{
                border: "1px solid #e0e0e0",
                borderRadius: 2,
                p: 2.5,
                bgcolor: "#fff",
                mb: 2,
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    bgcolor: "#e8f0fb",
                    borderLeft: "4px solid #1a5da8",
                    px: 2,
                    py: 1,
                    mb: 2,
                    borderRadius: "0 4px 4px 0",
                }}
            >
                <Typography variant="subtitle1" fontWeight={700} color="#1a5da8">
                    ข้อมูลผู้เอาประกัน
                </Typography>
            </Box>

            {/* Application ID */}
            <Box display="flex" alignItems="center" gap={1} py={0.6} pl={0.5}>
                <Typography variant="body2" color="text.secondary" minWidth={160}>
                    Application ID :
                </Typography>
                <Link
                    href={PH_DETAIL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="hover"
                    variant="body2"
                    fontWeight={700}
                >
                    {insured.applicationId}
                </Link>
            </Box>

            {/* อายุกรมธรรม์ */}
            <Box display="flex" alignItems="center" gap={1} py={0.6} pl={0.5} mb={1}>
                <Typography variant="body2" color="text.secondary" minWidth={160}>
                    อายุกรมธรรม์ :
                </Typography>
                <Typography variant="body2" color="primary" fontWeight={700}>
                    {policyAge}
                </Typography>
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* Rows */}
            <InfoRow icon={<PersonIcon fontSize="small" />} label="ชื่อผู้เอาประกัน" value={fullName} />
            <InfoRow icon={<PersonIcon fontSize="small" />} label="เลขบัตรประชาชน" value={insured.idCardNo} />
            <InfoRow icon={<PersonIcon fontSize="small" />} label="Passport" value={insured.passport} />
            <InfoRow icon={<CakeIcon fontSize="small" />} label="วันเกิด" value={birthDateThai} />
            <InfoRow icon={<BadgeIcon fontSize="small" />} label="อายุปัจจุบัน" value={currentAge} />
            <InfoRow icon={<PhoneIphoneIcon fontSize="small" />} label="เบอร์มือถือ" value={insured.mobilePhone} />
            <InfoRow icon={<PinDropIcon fontSize="small" />} label="จังหวัด" value={insured.province} />
            <InfoRow icon={<WorkIcon fontSize="small" />} label="อาชีพ" value={insured.occupation} />
        </Box>
    );
};

export default InsuredInfoCard;
