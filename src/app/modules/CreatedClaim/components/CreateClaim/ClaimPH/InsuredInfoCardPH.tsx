import React from "react";
import { Box, Link, Typography } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import { formatDateString } from "../../../../../functionHelpers";
import CustomBox from "../../../../_common/components/CustomComponent/CustomBox";
import { GetCustomerDetailByIdDtoResponse } from "../../../../../api/coreClaimApi.client";

interface Props {
    data?: GetCustomerDetailByIdDtoResponse;
}

const PH_DETAIL_URL = "https://sssph.siamsmile.co.th/Modules/PH/frmPHDetail";

const Row = ({
    label,
    value,
    icon,
    labelWidth = 180,
}: {
    label: string;
    value: React.ReactNode;
    icon?: React.ReactNode;
    labelWidth?: number;
}) => (
    <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row", md: "column", lg: "row" }}
        alignItems={{ xs: "flex-start", sm: "center", md: "flex-start", lg: "center" }}
        gap={{ xs: 0, sm: 1, md: 0, lg: 1 }}
        py={0.3}
    >
        <Box display="flex" alignItems="center" gap={1}>
            {icon && (
                <Box color="primary.main" display="flex">
                    {icon}
                </Box>
            )}
            <Typography
                variant="body2"
                color="text.secondary"
                sx={{ minWidth: { xs: "auto", sm: labelWidth, md: "auto", lg: labelWidth }, whiteSpace: "nowrap" }}
            >
                {label} :
            </Typography>
        </Box>
        <Typography
            variant="body2"
            fontWeight={600}
            color="primary.main"
            sx={{ wordBreak: "break-word", pl: { xs: icon ? 3.5 : 0, sm: 0, md: icon ? 3.5 : 0, lg: 0 } }}
        >
            {value || "-"}
        </Typography>
    </Box>
);

const InsuredInfoCardPH: React.FC<Props> = ({ data }) => (
    <CustomBox sx={{ minHeight: "98.5%" }}>
        <HeadingWithColor text="ข้อมูลผู้เอาประกัน" color="blue" icon={<AccountCircleIcon sx={{ fontSize: 27 }} />} />
        <Box px={2} pb={1}>
            <Row
                label="Application ID"
                value={
                    <Link href={PH_DETAIL_URL} target="_blank" underline="hover" fontWeight={700}>
                        {data?.policyCode || "-"}
                    </Link>
                }
            />
            <Row label="ชื่อผู้เอาประกัน" value={data?.customerName} />
            <Row label="เลขบัตรประชาชน" value={data?.cardDetail} />
            <Row label="แผนประกัน" value={data?.productName} />
            <Row label="วันที่เริ่มคุ้มครอง" value={formatDateString(data?.coverageFrom?.toString(), "DD/MM/BBBB")} />
            <Row
                label="วันที่ยกเลิก"
                value={data?.coverageTo ? formatDateString(data?.coverageTo?.toString(), "DD/MM/BBBB") : "-"}
            />
        </Box>
    </CustomBox>
);

export default InsuredInfoCardPH;
