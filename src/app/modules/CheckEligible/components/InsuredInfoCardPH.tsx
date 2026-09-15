import React, { useMemo } from "react";
import { Box, Typography, Link, Divider, useMediaQuery, useTheme } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import CakeIcon from "@mui/icons-material/Cake";
import BadgeIcon from "@mui/icons-material/Badge";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import WorkIcon from "@mui/icons-material/Work";
import dayjs from "dayjs";
import { HeadingWithColor } from "../../_common/components/CustomComponent/HeadingWithColor";
import CustomBox from "../../_common/components/CustomComponent/CustomBox";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { GetCustomerDetailByIdDtoResponse } from "../../../api/coreClaimApi.client";

// TODO: ยืนยัน URL จริงของหน้า Application Detail (PH) กับทีม เดิมโค้ดอ้างตัวแปรนี้แต่ไม่เคย declare
const PH_DETAIL_URL = "";

const NATIONAL_ID_CARD_TYPE = 2;
const PASSPORT_CARD_TYPE = 3;

const ICON_COL_WIDTH = 28;

type Props = {
    data?: GetCustomerDetailByIdDtoResponse;
};

type InfoRowProps = {
    icon?: React.ReactNode;
    label: string;
    value?: React.ReactNode;
};

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    if (isMobile) {
        return (
            <Box py={0.6}>
                <Box display="flex" alignItems="center" gap={1}>
                    <Box
                        color="text.secondary"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        width={ICON_COL_WIDTH}
                        flexShrink={0}
                    >
                        {icon}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                        {label} :
                    </Typography>
                </Box>
                <Box pl={`${ICON_COL_WIDTH + 8}px`} sx={{ minWidth: 0 }}>
                    <Typography
                        variant="body2"
                        color="primary"
                        fontWeight={700}
                        component="div"
                        sx={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
                    >
                        {value ?? "-"}
                    </Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box display="flex" alignItems="flex-start" gap={1} py={0.6}>
            <Box
                color="text.secondary"
                display="flex"
                alignItems="center"
                justifyContent="center"
                width={ICON_COL_WIDTH}
                flexShrink={0}
                pt="2px"
            >
                {icon}
            </Box>
            <Typography variant="body2" color="text.secondary" minWidth={115} flexShrink={0}>
                {label} :
            </Typography>
            <Typography
                variant="body2"
                color="primary"
                fontWeight={700}
                component="div"
                sx={{ minWidth: 0, wordBreak: "break-word", overflowWrap: "anywhere" }}
            >
                {value ?? "-"}
            </Typography>
        </Box>
    );
};

const InsuredInfoCardPH: React.FC<Props> = ({ data }) => {
    // ชื่อ-นามสกุลผู้เอาประกัน
    const fullName = useMemo(() => {
        if (!data) return "-";
        const parts = [data.titleName, data.firstName, data.lastName].filter(Boolean);
        return parts.length ? parts.join(" ") : "-";
    }, [data]);

    // วันเกิด แปลงเป็น พ.ศ.
    const birthDateThai = useMemo(() => {
        const d = data?.birthDate ? dayjs(data.birthDate) : null;
        if (!d || !d.isValid()) return "-";
        return `${d.format("DD/MM")}/${d.year() + 543}`;
    }, [data]);

    // อายุปัจจุบัน คำนวณจากวันเกิด
    const currentAge = useMemo(() => {
        const d = data?.birthDate ? dayjs(data.birthDate) : null;
        if (!d || !d.isValid()) return "-";
        return `${dayjs().diff(d, "year")} ปี`;
    }, [data]);

    // อายุกรมธรรม์ คำนวณจาก coverageFrom ถึงปัจจุบัน
    const policyAge = useMemo(() => {
        const d = data?.coverageFrom ? dayjs(data.coverageFrom) : null;
        if (!d || !d.isValid()) return "-";
        const years = dayjs().diff(d, "year");
        const months = dayjs().diff(d.add(years, "year"), "month");
        return `${years} ปี ${months} เดือน`;
    }, [data]);

    const idCardNo = data?.cardTypeId === NATIONAL_ID_CARD_TYPE ? data?.cardDetail : undefined;
    const passportNo = data?.cardTypeId === PASSPORT_CARD_TYPE ? data?.cardDetail : undefined;

    const applicationId = data?.policyCode ?? "-";

    const applicationIdLink = (
        <Link
            href={PH_DETAIL_URL}
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            variant="body2"
            fontWeight={700}
            sx={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
        >
            {applicationId}
        </Link>
    );

    return (
        <CustomBox>
            <HeadingWithColor text="ข้อมูลผู้เอาประกันภัย" color="blue" />

            <InfoRow label="Application ID" value={applicationIdLink} />
            <InfoRow label="อายุกรมธรรม์" value={policyAge} />

            <Divider sx={{ my: 1 }} />

            <InfoRow icon={<PersonIcon fontSize="small" />} label="ชื่อผู้เอาประกัน" value={fullName} />
            <InfoRow
                icon={<FontAwesomeIcon icon={"id-card"} fontSize="medium" />}
                label="เลขบัตรประชาชน"
                value={idCardNo}
            />
            <InfoRow
                icon={<FontAwesomeIcon icon={"id-card"} fontSize="medium" />}
                label="Passport"
                value={passportNo}
            />
            <InfoRow icon={<CakeIcon fontSize="small" />} label="วันเกิด" value={birthDateThai} />
            <InfoRow icon={<BadgeIcon fontSize="small" />} label="อายุปัจจุบัน" value={currentAge} />
            <InfoRow icon={<PhoneIphoneIcon fontSize="small" />} label="เบอร์มือถือ" value={data?.mobilePhoneNumber} />
            <InfoRow icon={<WorkIcon fontSize="small" />} label="อาชีพ" value={data?.occupationName} />

            <Divider sx={{ my: 1 }} />

            <InfoRow label="ผู้แทน" value={data?.agentName} />
            <InfoRow label="สาขา" value={data?.agentBranchName} />
        </CustomBox>
    );
};

export default InsuredInfoCardPH;
