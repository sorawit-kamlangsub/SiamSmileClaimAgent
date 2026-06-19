import React from "react";
import { Box, Typography, Link, Divider, useMediaQuery, useTheme } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import CakeIcon from "@mui/icons-material/Cake";
import BadgeIcon from "@mui/icons-material/Badge";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import PinDropIcon from "@mui/icons-material/PinDrop";
import WorkIcon from "@mui/icons-material/Work";
import useCheckEligibleDetail, { InsuredInfo } from "../../hooks/CheckEligibleDetail/useCheckEligibleDetail";
import { HeadingWithColor } from "../../../_common/components/CustomComponent/HeadingWithColor";
import CustomBox from "../../../_common/components/CustomComponent/CustomBox";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const PH_DETAIL_URL = "https://sssph.siamsmile.co.th/Modules/PH/frmPHDetail";

type Props = {
    insured: InsuredInfo;
};

type InfoRowProps = {
    icon: React.ReactNode;
    label: string;
    value?: string | null;
};

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    if (isMobile) {
        return (
            <Box py={0.6}>
                <Box display="flex" alignItems="center" gap={1}>
                    <Box color="text.secondary" display="flex" alignItems="center">
                        {icon}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                        {label} :
                    </Typography>
                </Box>
                <Box pl="28px" sx={{ minWidth: 0 }}>
                    <Typography
                        variant="body2"
                        color="primary"
                        fontWeight={700}
                        sx={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
                    >
                        {value || "-"}
                    </Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box display="flex" alignItems="flex-start" gap={1} py={0.6}>
            <Box color="text.secondary" display="flex" alignItems="center" pt="2px">
                {icon}
            </Box>
            <Typography variant="body2" color="text.secondary" minWidth={160} flexShrink={0}>
                {label} :
            </Typography>
            <Typography
                variant="body2"
                color="primary"
                fontWeight={700}
                sx={{ minWidth: 0, wordBreak: "break-word", overflowWrap: "anywhere" }}
            >
                {value || "-"}
            </Typography>
        </Box>
    );
};

const InsuredInfoCardPH: React.FC<Props> = ({ insured }) => {
    const { policyAge, currentAge, birthDateThai, fullName } = useCheckEligibleDetail(insured);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    return (
        <CustomBox>
            <HeadingWithColor text="ข้อมูลผู้เอาประกันภัย" color="blue" />

            {/* Application ID */}
            {isMobile ? (
                <Box py={0.6}>
                    <Typography variant="caption" color="text.secondary">
                        Application ID :
                    </Typography>
                    <Box sx={{ minWidth: 0, wordBreak: "break-word", overflowWrap: "anywhere" }}>
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
                </Box>
            ) : (
                <Box display="flex" alignItems="flex-start" gap={1} py={0.6} pl={0.5}>
                    <Typography variant="body2" color="text.secondary" minWidth={160} flexShrink={0}>
                        Application ID :
                    </Typography>
                    <Link
                        href={PH_DETAIL_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        underline="hover"
                        variant="body2"
                        fontWeight={700}
                        sx={{ minWidth: 0, wordBreak: "break-word", overflowWrap: "anywhere" }}
                    >
                        {insured.applicationId}
                    </Link>
                </Box>
            )}

            {/* อายุกรมธรรม์ */}
            {isMobile ? (
                <Box py={0.6} mb={1}>
                    <Typography variant="caption" color="text.secondary">
                        อายุกรมธรรม์ :
                    </Typography>
                    <Box sx={{ minWidth: 0, wordBreak: "break-word", overflowWrap: "anywhere" }}>
                        <Typography variant="body2" color="primary" fontWeight={700}>
                            {policyAge}
                        </Typography>
                    </Box>
                </Box>
            ) : (
                <Box display="flex" alignItems="flex-start" gap={1} py={0.6} pl={0.5} mb={1}>
                    <Typography variant="body2" color="text.secondary" minWidth={160} flexShrink={0}>
                        อายุกรมธรรม์ :
                    </Typography>
                    <Typography
                        variant="body2"
                        color="primary"
                        fontWeight={700}
                        sx={{ minWidth: 0, wordBreak: "break-word", overflowWrap: "anywhere" }}
                    >
                        {policyAge}
                    </Typography>
                </Box>
            )}

            <Divider sx={{ my: 1 }} />

            <InfoRow icon={<PersonIcon fontSize="small" />} label="ชื่อผู้เอาประกัน" value={fullName} />
            <InfoRow
                icon={<FontAwesomeIcon icon={"id-card"} fontSize="medium" />}
                label="เลขบัตรประชาชน"
                value={insured.idCardNo}
            />
            <InfoRow
                icon={<FontAwesomeIcon icon={"id-card"} fontSize="medium" />}
                label="Passport"
                value={insured.passport}
            />
            <InfoRow icon={<CakeIcon fontSize="small" />} label="วันเกิด" value={birthDateThai} />
            <InfoRow icon={<BadgeIcon fontSize="small" />} label="อายุปัจจุบัน" value={currentAge} />
            <InfoRow icon={<PhoneIphoneIcon fontSize="small" />} label="เบอร์มือถือ" value={insured.mobilePhone} />
            <InfoRow icon={<PinDropIcon fontSize="small" />} label="จังหวัด" value={insured.province} />
            <InfoRow icon={<WorkIcon fontSize="small" />} label="อาชีพ" value={insured.occupation} />
        </CustomBox>
    );
};

export default InsuredInfoCardPH;
