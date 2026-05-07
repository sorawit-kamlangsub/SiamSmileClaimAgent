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

        <Box display="flex" alignItems="center" gap={1} py={0.5}>
            <Typography variant="body2" color="text.secondary" minWidth={130}>
                Application ID :
            </Typography>
            <Link href={PH_DETAIL_URL} target="_blank" underline="hover" variant="body2" fontWeight={700}>
                {data.appId}
            </Link>
        </Box>

        <Box display="flex" alignItems="center" gap={1} py={0.5}>
            <PersonIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary" minWidth={114}>
                ชื่อผู้เอาประกัน :
            </Typography>
            <Typography variant="body2" color="primary" fontWeight={700}>
                {data.customerName}
            </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={1} py={0.5}>
            <CreditCardIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary" minWidth={114}>
                เลขบัตรประชาชน :
            </Typography>
            <Typography variant="body2" color="primary" fontWeight={700}>
                {data.nationalId || "-"}
            </Typography>
        </Box>

        <Box py={0.5}>
            <Typography variant="body2" color="text.secondary" component="span">
                แผนประกัน :{" "}
            </Typography>
            <Typography variant="body2" color="primary" fontWeight={700} component="span">
                {data.plan}
            </Typography>
        </Box>
        <Box py={0.5}>
            <Typography variant="body2" color="text.secondary" component="span">
                วันที่เริ่มคุ้มครอง :{" "}
            </Typography>
            <Typography variant="body2" color="primary" fontWeight={700} component="span">
                {formatDateString(data.startCoverDate, "DD/MM/BBBB")}
            </Typography>
        </Box>
        <Box py={0.5}>
            <Typography variant="body2" color="text.secondary" component="span">
                วันที่ยกเลิก :{" "}
            </Typography>
            <Typography variant="body2" color="primary" fontWeight={700} component="span">
                {data.cancelDate ? formatDateString(data.cancelDate, "DD/MM/BBBB") : "-"}
            </Typography>
        </Box>
    </CustomBox>
);

export default InsuredInfoCardPH;
