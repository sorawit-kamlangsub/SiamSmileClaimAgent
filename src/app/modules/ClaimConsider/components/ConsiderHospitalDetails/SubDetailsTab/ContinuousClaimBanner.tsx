import { Box, Button, Chip, Collapse, Divider, Grid, IconButton, Tooltip, Typography } from "@mui/material";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import LinkIcon from "@mui/icons-material/Link";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { ReactNode, useState } from "react";

import { numberWithCommas } from "../../../../../functionHelpers";
import { ContinuousClaimRow } from "../mock/hospitalConsiderMock";

const ORANGE = "#E08600";
const ORANGE_SOFT = "#FFF7E8";
const ORANGE_BORDER = "#F0A93B";

type ContinuousClaimBannerProps = {
    /** เคลมเดิมที่ผู้พิจารณาเลือกไว้ */
    claim: ContinuousClaimRow;
    /** เลขที่เคสของเคลมที่กำลังพิจารณาอยู่ */
    currentCaseNo: string;
    /** สถานะของเคสปัจจุบัน */
    currentCaseStatus?: string;
    /** หัวข้อแถบ — ต่างกันตามหน้าที่เรียกใช้ (เคลมโรงพยาบาล / เคลมลูกค้า) */
    title?: string;
};

/**
 * แถบสรุป "พิจารณาเคลมต่อเนื่อง" ที่แสดงเมื่อเคสนี้ถูกระบุว่าเป็นเคลมต่อเนื่อง
 *
 * ใช้ร่วมกันทั้งหน้าพิจารณาเคลมโรงพยาบาลและเคลมลูกค้า
 * เพื่อให้ผู้พิจารณาเห็นเคลมเดิม การวินิจฉัย และวงเงินคงเหลือก่อนพิจารณาเคสปัจจุบัน
 */
const ContinuousClaimBanner = ({
    claim,
    currentCaseNo,
    currentCaseStatus = "กำลังพิจารณา",
    title = "พิจารณาเคลมต่อเนื่อง - เคลมโรงพยาบาล",
}: ContinuousClaimBannerProps) => {
    const [expanded, setExpanded] = useState(true);

    return (
        <Box
            sx={{
                border: `2px solid ${ORANGE_BORDER}`,
                borderRadius: 3,
                bgcolor: ORANGE_SOFT,
                overflow: "hidden",
                mb: "1.5rem",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: 2,
                    py: 1.5,
                    flexWrap: "wrap",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        bgcolor: "#FDE8C4",
                        color: ORANGE,
                    }}
                >
                    <SyncAltIcon />
                </Box>

                <Box sx={{ flex: 1, minWidth: 240, lineHeight: 1.4 }}>
                    <Typography fontWeight={700} fontSize={18} color="#7A4A00">
                        {title}
                    </Typography>
                    <Typography fontSize={13} color="#8A6A3A">
                        ตรวจสอบเคลมเดิม ประวัติการรักษา และวงเงินคงเหลือก่อนพิจารณาเคสปัจจุบัน
                    </Typography>
                </Box>

                <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setExpanded((prev) => !prev)}
                    startIcon={
                        <KeyboardArrowUpIcon
                            sx={{
                                transform: expanded ? "rotate(0deg)" : "rotate(180deg)",
                                transition: "transform 0.2s ease",
                            }}
                        />
                    }
                    sx={{
                        borderRadius: 5,
                        borderColor: ORANGE_BORDER,
                        color: "#7A4A00",
                        bgcolor: "#fff",
                        "&:hover": { borderColor: ORANGE, bgcolor: "#fff" },
                    }}
                >
                    {expanded ? "ซ่อนรายการ" : "แสดงรายการ"}
                </Button>

                <Chip label="เคลมต่อเนื่อง" sx={{ bgcolor: ORANGE, color: "#fff", fontWeight: 700, borderRadius: 5 }} />
            </Box>

            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <Divider sx={{ borderColor: "#F3D9AC" }} />

                <Grid container sx={{ px: 2, py: 2 }}>
                    <SummaryCell
                        icon={<DescriptionOutlinedIcon fontSize="small" />}
                        label="เคลมเดิม"
                        divider
                        value={
                            <Box display="flex" alignItems="center" gap={0.5}>
                                {claim.claimNo}
                                <Tooltip title="เปิดเคลมเดิม" arrow placement="top">
                                    <IconButton size="small" sx={{ color: "#1565C0" }}>
                                        <OpenInNewIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        }
                        footer={
                            <Box>
                                <Typography fontSize={12} color="text.secondary">
                                    วันที่รักษาครั้งก่อน
                                </Typography>
                                <Box display="flex" alignItems="center" gap={0.5} color="text.secondary">
                                    <CalendarMonthIcon sx={{ fontSize: 15 }} />
                                    <Typography fontSize={13}>{claim.incidentDate}</Typography>
                                </Box>
                            </Box>
                        }
                    />

                    <SummaryCell
                        icon={<LinkIcon fontSize="small" />}
                        label="เคสปัจจุบัน"
                        value={currentCaseNo}
                        divider
                    />

                    <SummaryCell
                        icon={<ShieldOutlinedIcon fontSize="small" />}
                        label="Diagnosis"
                        value={claim.diagnosis1}
                        valueFontSize={14}
                        divider
                    />

                    <SummaryCell
                        icon={<AccountBalanceWalletOutlinedIcon fontSize="small" />}
                        label="วงเงินคงเหลือ"
                        value={
                            <Typography component="span" fontSize={20} fontWeight={700} color="#178236">
                                {`${numberWithCommas(claim.remainingLimit)} บาท`}
                            </Typography>
                        }
                        footer={
                            <Typography fontSize={12} color="text.secondary">
                                {`ยอดจ่ายสะสม ${numberWithCommas(claim.totalPaidAmount)} บาท`}
                            </Typography>
                        }
                    />
                </Grid>

                <Divider sx={{ borderColor: "#F3D9AC" }} />

                <Box sx={{ px: 2, py: 2 }}>
                    <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                        <FormatListBulletedIcon sx={{ color: ORANGE, fontSize: 20 }} />
                        <Typography fontWeight={700} color="#7A4A00">
                            ความต่อเนื่องของการรักษา
                        </Typography>
                        <Chip
                            size="small"
                            label="ติดตามอาการต่อเนื่อง"
                            variant="outlined"
                            sx={{ borderColor: ORANGE_BORDER, color: "#7A4A00", bgcolor: "#fff" }}
                        />
                    </Box>

                    <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                        <CaseCard
                            icon={<CheckCircleIcon sx={{ color: "#178236" }} />}
                            label="CC ครั้งก่อน"
                            caseNo={claim.previousCaseNo}
                            status={claim.previousCaseStatus}
                            color="#178236"
                            bgColor="#F0FDF4"
                        />

                        <ArrowForwardIcon sx={{ color: "#8A6A3A" }} />

                        <CaseCard
                            icon={<AssignmentOutlinedIcon sx={{ color: "#1565C0" }} />}
                            label="CC ปัจจุบัน"
                            caseNo={currentCaseNo}
                            status={currentCaseStatus}
                            color="#1565C0"
                            bgColor="#EFF7FF"
                        />
                    </Box>
                </Box>
            </Collapse>
        </Box>
    );
};

type SummaryCellProps = {
    icon: ReactNode;
    label: string;
    value: ReactNode;
    footer?: ReactNode;
    divider?: boolean;
    valueFontSize?: number;
};

const SummaryCell = ({ icon, label, value, footer, divider, valueFontSize = 17 }: SummaryCellProps) => (
    <Grid
        item
        xs={12}
        sm={6}
        md={3}
        sx={{
            display: "flex",
            gap: 1.25,
            px: 1.5,
            borderRight: { md: divider ? "1px dashed #E7C68A" : "none" },
        }}
    >
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 34,
                height: 34,
                minWidth: 34,
                borderRadius: 1.5,
                bgcolor: "#fff",
                color: ORANGE,
                border: "1px solid #F3D9AC",
            }}
        >
            {icon}
        </Box>

        <Box sx={{ lineHeight: 1.4 }}>
            <Typography fontSize={12} color="text.secondary">
                {label}
            </Typography>
            <Typography fontSize={valueFontSize} fontWeight={700} component="div">
                {value}
            </Typography>
            {footer}
        </Box>
    </Grid>
);

type CaseCardProps = {
    icon: ReactNode;
    label: string;
    caseNo: string;
    status: string;
    color: string;
    bgColor: string;
};

const CaseCard = ({ icon, label, caseNo, status, color, bgColor }: CaseCardProps) => (
    <Box
        sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            px: 2,
            py: 1.25,
            minWidth: 260,
            borderRadius: 2,
            bgcolor: bgColor,
            border: `1px solid ${color}55`,
        }}
    >
        {icon}
        <Box sx={{ lineHeight: 1.4 }}>
            <Typography fontSize={13}>
                <Typography component="span" fontSize={13} color={color}>
                    {`${label} `}
                </Typography>
                <Typography component="span" fontSize={14} fontWeight={700}>
                    {caseNo}
                </Typography>
            </Typography>
            <Typography fontSize={12} color={color}>
                {status}
            </Typography>
        </Box>
    </Box>
);

export default ContinuousClaimBanner;
