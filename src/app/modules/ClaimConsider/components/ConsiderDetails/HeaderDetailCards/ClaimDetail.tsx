import { Grid } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import WorkIcon from "@mui/icons-material/Work";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CardClaimInfo from "../../_common/CardClaimInfo";
import DescriptionIcon from "@mui/icons-material/Description";
import FlagIcon from "@mui/icons-material/Flag";
import SyncIcon from "@mui/icons-material/Sync";
import BadgeIcon from "@mui/icons-material/Badge";

type ClaimDetailProps = {
    notificationDate: string | undefined;
    transferDate: string | undefined;
    employee: string | undefined;
    branch: string | undefined;
    claimNo: string | undefined;
    caseNo: string | undefined;
    claimType: string | undefined;
    statusClaimId: number | undefined;
};

const ClaimDetail = ({
    notificationDate,
    transferDate,
    employee,
    branch,
    caseNo,
    claimNo,
    claimType,
    statusClaimId,
}: ClaimDetailProps) => {
    const cards = [
        {
            icon: <CalendarMonthIcon />,
            label: "วันที่แจ้ง",
            value: notificationDate,
        },
        {
            icon: <CalendarMonthIcon />,
            label: "วันที่โอนเงิน",
            value: transferDate,
        },
        {
            icon: <WorkIcon />,
            label: "ผู้แจ้งเคลม",
            value: employee,
        },
        {
            icon: <LocationOnIcon />,
            label: "สาขา",
            value: branch,
        },
        {
            icon: <DescriptionIcon />,
            label: "เลขที่เคลม",
            value: claimNo,
        },
        {
            icon: <BadgeIcon />,
            label: "เลขที่ Case",
            value: claimNo,
        },
        {
            icon: <FlagIcon />,
            label: "ประเภทการเคลม",
            value: claimNo,
        },
        {
            icon: <SyncIcon />,
            label: "สถานะเคลม",
            value: claimNo,
        },
    ];
    return (
        <>
            <Grid container spacing={1}>
                {cards.map((item) => (
                    <Grid item xs={6} sm={6} md={3} lg={3} key={item.label}>
                        <CardClaimInfo icon={item.icon} label={item.label} value={item.value} />
                    </Grid>
                ))}
            </Grid>
        </>
    );
};

export default ClaimDetail;
