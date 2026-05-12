import React from "react";
import { Box, IconButton, Link, Tooltip, Typography, Zoom } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import EditIcon from "@mui/icons-material/Edit";
import { InsuredInfoPA } from "../../../store/claimPASlice";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import CustomBox from "../../../../_common/components/CustomComponent/CustomBox";
import { formatDateString } from "../../../../../functionHelpers";

interface Props {
    data: InsuredInfoPA;
    onEdit: () => void;
}

const Row = ({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) => (
    <Box display="flex" alignItems="center" gap={1} py={0.3}>
        {icon && (
            <Box color="primary.main" display="flex">
                {icon}
            </Box>
        )}
        <Typography variant="body2" color="text.secondary" minWidth={180}>
            {label} :
        </Typography>
        <Typography variant="body2" fontWeight={600} color={"primary.main"}>
            {value || "-"}
        </Typography>
    </Box>
);

const InsuredInfoSection: React.FC<Props> = ({ data, onEdit }) => (
    <CustomBox>
        <HeadingWithColor
            text="ข้อมูลผู้เอาประกัน"
            color="blue"
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
                    <Link
                        href="https://ssspa.siamsmile.co.th/Modules/PA/frmApplicationDetail"
                        target="_blank"
                        rel="noreferrer"
                        fontWeight={700}
                    >
                        {data.appId}
                    </Link>
                }
            />
            <Row
                label="ชื่อผู้เอาประกัน"
                icon={<PersonIcon fontSize="small" />}
                value={`${data.prefix}${data.firstName} ${data.lastName}`}
            />
            <Row label="เลขบัตรประชาชน" icon={<CreditCardIcon fontSize="small" />} value={data.nationalId} />
            <Row label="Passport" icon={<CreditCardIcon fontSize="small" />} value={data.passport} />
            <Row label="แผนประกัน" value={data.plan} />
            <Row label="วันที่เริ่มคุ้มครอง" value={formatDateString(data.startCoverDate, "DD/MM/BBBB")} />
            <Row label="วันที่มีผล" value={formatDateString(data.effectiveDate, "DD/MM/BBBB")} />
            <Row label="วันที่สิ้นสุดความคุ้มครอง" value={formatDateString(data.endCoverDate, "DD/MM/BBBB")} />
            <Row label="ประเภทผู้เอาประกัน" value={data.insuredType} />
            <Row label="สถานศึกษา" value={data.schoolName} />
        </Box>
    </CustomBox>
);

export default InsuredInfoSection;
