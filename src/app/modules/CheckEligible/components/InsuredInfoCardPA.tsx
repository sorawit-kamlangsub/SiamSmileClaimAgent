import React, { useMemo } from "react";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import BadgeIcon from "@mui/icons-material/Badge";
import { HeadingWithColor } from "../../_common/components/CustomComponent/HeadingWithColor";
import CustomBox from "../../_common/components/CustomComponent/CustomBox";
import { Box, Divider, Link, Typography, useMediaQuery, useTheme } from "@mui/material";
import { GetCustomerDetailByIdDtoResponse } from "../../../api/coreClaimApi.client";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const APPLICATION_DETAIL_URL = "";

const NATIONAL_ID_CARD_TYPE = 2;
const PASSPORT_CARD_TYPE = 3;

const ICON_COL_WIDTH = 28;

// ── Status color maps (by appStatusId) ────────────────────────────────────────
// 2: ปกติ, 3: มีกำหนดยกเลิก, 4: ยกเลิก, 5: ยกเลิกก่อน DCR

export const backgroundColorMapAppStatus: Record<number, "#D4EDBC" | "#FFF1CD" | "#FFCFC9"> = {
    2: "#D4EDBC", // ปกติ
    3: "#FFF1CD", // มีกำหนดยกเลิก
    4: "#FFCFC9", // ยกเลิก
    5: "#FFCFC9", // ยกเลิกก่อน DCR
};

export const colorMapAppStatus: Record<number, "#11734B" | "#a56e07" | "#B32615"> = {
    2: "#11734B", // ปกติ
    3: "#a56e07", // มีกำหนดยกเลิก
    4: "#B32615", // ยกเลิก
    5: "#B32615", // ยกเลิกก่อน DCR
};

const DEFAULT_BG_COLOR = "#FFCFC9";
const DEFAULT_TEXT_COLOR = "#B32615";

// ── InfoRow ───────────────────────────────────────────────────────────────────

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
            <Typography variant="body2" color="text.secondary" minWidth={160} flexShrink={0}>
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

// ── StatusBadge ───────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: string; appStatusId?: number }> = ({ status, appStatusId }) => {
    const bgColor =
        appStatusId !== undefined ? backgroundColorMapAppStatus[appStatusId] ?? DEFAULT_BG_COLOR : DEFAULT_BG_COLOR;
    const textColor =
        appStatusId !== undefined ? colorMapAppStatus[appStatusId] ?? DEFAULT_TEXT_COLOR : DEFAULT_TEXT_COLOR;

    return (
        <span
            style={{
                display: "inline-block",
                padding: "2px 10px",
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 600,
                whiteSpace: "nowrap",
                background: bgColor,
                color: textColor,
                border: `1px solid ${textColor}`,
            }}
        >
            {status}
        </span>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────

interface InsuredInfoCardProps {
    data?: GetCustomerDetailByIdDtoResponse;
}

const InsuredInfoCardPA: React.FC<InsuredInfoCardProps> = ({ data }) => {
    const vm = useMemo(() => {
        const idCardNo = data?.cardTypeId === NATIONAL_ID_CARD_TYPE ? data?.cardDetail : undefined;
        const passportNo = data?.cardTypeId === PASSPORT_CARD_TYPE ? data?.cardDetail : undefined;
        const insuredFullName = [data?.titleName, data?.firstName, data?.lastName].filter(Boolean).join(" ") || "-";

        const appStatus = data?.appStatus ?? "-";

        return {
            applicationId: data?.policyCode ?? "-",
            academicYear: data?.academicYear ?? "-",
            schoolName: data?.schoolName ?? "-",
            subDistrict: data?.subDistrictName ?? "-",
            district: data?.districtName ?? "-",
            province: data?.provinceName ?? "-",
            status: appStatus,
            appStatusId: data?.appStatusId,
            branch: data?.agentBranchName ?? "-",
            employeeFullName: data?.agentName ?? "-",
            contactFullName: data?.contactName ?? "-",
            contactPhone: data?.contactPhoneNo ?? "-",
            referenceId: data?.customerCode ?? "-",
            insuredFullName,
            nationalId: idCardNo ?? "-",
            passport: passportNo ?? "-",
            educationLevel: data?.levelRoomName ?? "-",
            insuredType: data?.customerTypeName ?? "-",
        };
    }, [data]);

    const applicationIdLink = (
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
    );

    const statusValue =
        vm.status !== "-" ? (
            <StatusBadge status={vm.status} appStatusId={vm.appStatusId} />
        ) : (
            <Typography variant="body2" color="text.primary">
                -
            </Typography>
        );

    return (
        <CustomBox>
            <HeadingWithColor
                text="ข้อมูลผู้เอาประกัน"
                color="blue"
                icon={<AccountCircleIcon sx={{ fontSize: 24 }} />}
            />

            <InfoRow label="Application ID" value={applicationIdLink} />
            <InfoRow label="ปีการศึกษา" value={vm.academicYear} />
            <InfoRow label="โรงเรียน" value={vm.schoolName} />
            <InfoRow label="ตำบล" value={vm.subDistrict} />
            <InfoRow label="อำเภอ" value={vm.district} />
            <InfoRow label="จังหวัด" value={vm.province} />
            <InfoRow label="สถานะ" value={statusValue} />

            <Divider sx={{ my: 1 }} />

            <InfoRow label="สาขา" value={vm.branch} />
            <InfoRow label="ผู้แทน" value={vm.employeeFullName} />

            <Divider sx={{ my: 1 }} />

            <InfoRow icon={<ContactPhoneIcon fontSize="small" />} label="ผู้ติดต่อประสาน" value={vm.contactFullName} />
            <InfoRow
                icon={<PhoneIphoneIcon fontSize="small" />}
                label="เบอร์โทรผู้ติดต่อประสาน"
                value={vm.contactPhone}
            />

            <Divider sx={{ my: 1 }} />

            <InfoRow icon={<AccountBoxIcon fontSize="small" />} label="เลขที่อ้างอิง" value={vm.referenceId} />
            <InfoRow icon={<PersonIcon fontSize="small" />} label="ชื่อผู้เอาประกัน" value={vm.insuredFullName} />
            <InfoRow icon={<CreditCardIcon fontSize="small" />} label="เลขบัตรประชาชน" value={vm.nationalId} />
            <InfoRow icon={<BadgeIcon fontSize="small" />} label="Passport" value={vm.passport} />
            <InfoRow icon={<SchoolIcon fontSize="small" />} label="ระดับชั้น" value={vm.educationLevel} />

            <Divider sx={{ my: 1 }} />

            <InfoRow
                label="ประเภทผู้เอาประกัน"
                value={
                    <Typography
                        variant="body2"
                        color="primary"
                        fontWeight={700}
                        sx={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
                    >
                        {vm.insuredType}
                    </Typography>
                }
            />
        </CustomBox>
    );
};

export default InsuredInfoCardPA;
