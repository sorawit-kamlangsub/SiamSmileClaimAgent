import React from "react";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import BadgeIcon from "@mui/icons-material/Badge";
import { PAInsuredInfo, usePAInsuredInfo } from "../../hooks/CheckEligibleDetail/useCheckEligibleDetail";
import { HeadingWithColor } from "../../../_common/components/CustomComponent/HeadingWithColor";
import CustomBox from "../../../_common/components/CustomComponent/CustomBox";
import { Box, Link, Typography, useMediaQuery, useTheme } from "@mui/material";

const APPLICATION_DETAIL_URL = "https://ssspa.siamsmile.co.th/Modules/PA/frmApplicationDetail";

// ── InfoRow ───────────────────────────────────────────────────────────────────

interface InfoRowProps {
    label: string;
    icon?: React.ElementType;
    borderBottom?: boolean;
    children: React.ReactNode;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, icon: Icon, borderBottom = false, children }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    if (isMobile) {
        return (
            <Box py="4px" borderBottom={borderBottom ? "1px solid #f0f4f8" : "none"}>
                {/* บรรทัดที่ 1: icon + label */}
                <Box display="flex" alignItems="center" gap="6px">
                    <Box display="flex" alignItems="center" width={20} flexShrink={0}>
                        {Icon && <Icon style={{ fontSize: 15, color: "#546e7a" }} />}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                        {label} :
                    </Typography>
                </Box>
                {/* บรรทัดที่ 2: value indent ตาม icon — wrap ได้ */}
                <Box pl="26px" sx={{ minWidth: 0 }}>
                    <Typography
                        variant="body2"
                        color="primary"
                        fontWeight={700}
                        sx={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
                    >
                        {children}
                    </Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box
            display="grid"
            gridTemplateColumns="24px 160px 1fr"
            alignItems="center"
            gap="6px"
            py="4px"
            borderBottom={borderBottom ? "1px solid #f0f4f8" : "none"}
        >
            <Box display="flex" alignItems="center">
                {Icon && <Icon style={{ fontSize: 17, color: "#546e7a" }} />}
            </Box>
            <Typography variant="body2" color="text.secondary">
                {label} :
            </Typography>
            <Typography
                variant="body2"
                color="primary"
                fontWeight={700}
                sx={{ minWidth: 0, wordBreak: "break-word", overflowWrap: "anywhere" }}
            >
                {children}
            </Typography>
        </Box>
    );
};

// ── StatusBadge ───────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: string; isActive: boolean }> = ({ status, isActive }) => (
    <span
        style={{
            display: "inline-block",
            padding: "2px 10px",
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 600,
            whiteSpace: "nowrap",
            background: isActive ? "#e8f5e9" : "#fff3e0",
            color: isActive ? "#2e7d32" : "#e65100",
            border: `1px solid ${isActive ? "#a5d6a7" : "#ffcc80"}`,
        }}
    >
        {status}
    </span>
);

// ── Main Component ────────────────────────────────────────────────────────────

interface InsuredInfoCardProps {
    data: PAInsuredInfo;
}

const InsuredInfoCardPA: React.FC<InsuredInfoCardProps> = ({ data }) => {
    const vm = usePAInsuredInfo(data);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const CustomRow: React.FC<{
        label: string;
        borderBottom?: boolean;
        children: React.ReactNode;
    }> = ({ label, borderBottom = false, children }) =>
        isMobile ? (
            <Box py="4px" borderBottom={borderBottom ? "1px solid #f0f4f8" : "none"}>
                <Box pl="26px">
                    <Typography variant="caption" color="text.secondary">
                        {label} :
                    </Typography>
                </Box>
                <Box pl="26px" sx={{ minWidth: 0, wordBreak: "break-word", overflowWrap: "anywhere" }}>
                    {children}
                </Box>
            </Box>
        ) : (
            <Box
                display="grid"
                gridTemplateColumns="24px 160px 1fr"
                alignItems="center"
                gap="6px"
                py="4px"
                borderBottom={borderBottom ? "1px solid #f0f4f8" : "none"}
            >
                <Box width={24} flexShrink={0} />
                <Typography variant="body2" color="text.secondary" flexShrink={0}>
                    {label} :
                </Typography>
                <Box sx={{ minWidth: 0, wordBreak: "break-word", overflowWrap: "anywhere" }}>{children}</Box>
            </Box>
        );

    return (
        <CustomBox>
            <HeadingWithColor text="ข้อมูลผู้เอาประกัน" color="blue" />

            <CustomRow label="Application ID">
                <Link
                    href={APPLICATION_DETAIL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="hover"
                    variant="body2"
                    fontWeight={700}
                    sx={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
                >
                    {vm.applicationId}
                </Link>
            </CustomRow>

            <InfoRow label="ปีการศึกษา">{vm.academicYear}</InfoRow>
            <InfoRow label="โรงเรียน">{vm.schoolName}</InfoRow>
            <InfoRow label="ตำบล">{vm.subDistrict}</InfoRow>
            <InfoRow label="อำเภอ">{vm.district}</InfoRow>
            <InfoRow label="จังหวัด">{vm.province}</InfoRow>

            <CustomRow label="สถานะ">
                {vm.status !== "-" ? (
                    <StatusBadge status={vm.status} isActive={vm.isActiveStatus} />
                ) : (
                    <Typography variant="body2" color="text.primary">
                        -
                    </Typography>
                )}
            </CustomRow>

            <InfoRow label="สาขา" borderBottom>
                {vm.branch}
            </InfoRow>

            <InfoRow icon={ContactPhoneIcon} label="ผู้ติดต่อประสาน">
                {vm.contactFullName}
            </InfoRow>
            <InfoRow icon={PhoneIphoneIcon} label="เบอร์โทรผู้ติดต่อประสาน" borderBottom>
                {vm.contactPhone}
            </InfoRow>

            <InfoRow icon={AccountBoxIcon} label="เลขที่อ้างอิง">
                {vm.referenceId}
            </InfoRow>
            <InfoRow icon={PersonIcon} label="ชื่อผู้เอาประกัน">
                {vm.insuredFullName}
            </InfoRow>
            <InfoRow icon={CreditCardIcon} label="เลขบัตรประชาชน">
                {vm.nationalId}
            </InfoRow>
            <InfoRow icon={BadgeIcon} label="Passport">
                {vm.passport}
            </InfoRow>
            <InfoRow icon={SchoolIcon} label="ระดับชั้น" borderBottom>
                {vm.educationLevel}
            </InfoRow>

            <CustomRow label="ประเภทผู้เอาประกัน">
                <Typography
                    variant="body2"
                    color="primary"
                    fontWeight={700}
                    sx={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
                >
                    {vm.insuredType ?? "-"}
                </Typography>
            </CustomRow>
        </CustomBox>
    );
};

export default InsuredInfoCardPA;
