import React from "react";
import { Box, IconButton, Link, Tooltip, Typography, Zoom } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import PersonIcon from "@mui/icons-material/Person";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import { formatDateString } from "../../../../../functionHelpers";
import { InsuredInfoPH } from "../../../store/claimPHSlice";
import CustomBox from "../../../../_common/components/CustomComponent/CustomBox";

interface Props {
    data: InsuredInfoPH;
    onEdit: () => void;
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
    <Box display="flex" alignItems="center" gap={1} py={0.3}>
        {icon && (
            <Box color="primary.main" display="flex">
                {icon}
            </Box>
        )}
        <Typography variant="body2" color="text.secondary" minWidth={labelWidth}>
            {label} :
        </Typography>
        <Typography variant="body2" fontWeight={600} color="primary.main">
            {value || "-"}
        </Typography>
    </Box>
);

const InsuredInfoCardPH: React.FC<Props> = ({ data, onEdit }) => (
    <CustomBox>
        <HeadingWithColor
            text="ข้อมูลผู้เอาประกัน"
            color="blue"
            button={
                <Tooltip
                    title="แก้ไขผู้เอาประกัน"
                    arrow
                    placement="top"
                    TransitionComponent={Zoom}
                    enterDelay={100}
                    leaveDelay={50}
                >
                    <IconButton size="small" onClick={onEdit} color="primary">
                        <EditIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            }
        />
        <Box px={2} pb={1}>
            <Row
                label="Application ID"
                value={
                    <Link href={PH_DETAIL_URL} target="_blank" underline="hover" fontWeight={700}>
                        {data.appId}
                    </Link>
                }
            />
            <Row
                label="ชื่อผู้เอาประกัน"
                icon={<PersonIcon fontSize="small" />}
                value={data.customerName}
                labelWidth={155}
            />
            <Row
                label="เลขบัตรประชาชน"
                icon={<CreditCardIcon fontSize="small" />}
                value={data.nationalId}
                labelWidth={155}
            />
            <Row label="แผนประกัน" value={data.plan} />
            <Row label="วันที่เริ่มคุ้มครอง" value={formatDateString(data.startCoverDate, "DD/MM/BBBB")} />
            <Row label="วันที่ยกเลิก" value={data.cancelDate ? formatDateString(data.cancelDate, "DD/MM/BBBB") : "-"} />
        </Box>
    </CustomBox>
);

export default InsuredInfoCardPH;
