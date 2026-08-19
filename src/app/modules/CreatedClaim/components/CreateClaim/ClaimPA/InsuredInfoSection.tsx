import React from "react";
import { Box, Divider, IconButton, Link, Tooltip, Typography, Zoom } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import CustomBox from "../../../../_common/components/CustomComponent/CustomBox";
import { formatDateString } from "../../../../../functionHelpers";
import { GetCustomerDetailByIdDtoResponse } from "../../../../../api/coreClaimApi.client";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

interface Props {
    data: GetCustomerDetailByIdDtoResponse | undefined;
    onEdit: () => void;
}

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap={{ xs: 0.25, sm: 1 }}
        py={0.5}
    >
        <Typography variant="body2" color="text.secondary" minWidth={{ sm: 180 }}>
            {label} :
        </Typography>
        <Typography variant="body2" fontWeight={600} color={"primary.main"}>
            {value || "-"}
        </Typography>
    </Box>
);
const InsuredInfoSection: React.FC<Props> = ({ data, onEdit }) => (
    <CustomBox sx={{ minHeight: "98.5%" }}>
        <HeadingWithColor
            text="ข้อมูลผู้เอาประกัน"
            color="blue"
            icon={<AccountCircleIcon sx={{ fontSize: 27 }} />}
            button={
                <Tooltip title="แก้ไขผู้เอาประกัน" arrow placement="top" TransitionComponent={Zoom}>
                    <IconButton size="small" color="primary" onClick={onEdit}>
                        <EditIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            }
        />
        <Box px={2} pb={1}>
            <Row
                label="Application ID"
                value={
                    <Link href="" target="_blank" rel="noreferrer" fontWeight={700}>
                        {data?.policyCode}
                    </Link>
                }
            />
            <Row label="ชื่อผู้เอาประกัน" value={`${data?.customerName}`} />
            <Row label="เลขบัตรประชาชน" value={data?.cardTypeId === 2 ? `${data?.cardDetail}` : "-"} />
            <Row label="Passport" value={data?.cardTypeId !== 2 ? `${data?.cardDetail}` : "-"} />
            <Divider sx={{ mt: 1, mb: 1 }} />
            <Row label="แผนประกัน" value={data?.productCategoryName} />
            <Row label="วันที่เริ่มคุ้มครอง" value={formatDateString(data?.coverageFrom?.toString(), "DD/MM/BBBB")} />
            <Row label="วันที่มีผล" value={formatDateString(data?.coverageFrom?.toString(), "DD/MM/BBBB")} />
            <Row
                label="วันที่สิ้นสุดความคุ้มครอง"
                value={formatDateString(data?.coverageTo?.toString(), "DD/MM/BBBB")}
            />
            <Divider sx={{ mt: 1, mb: 1 }} />
            <Row label="ประเภทผู้เอาประกัน" value={data?.customerTypeName} />
            <Row label="สถานศึกษา" value={data?.schoolName} />
        </Box>
    </CustomBox>
);

export default InsuredInfoSection;
