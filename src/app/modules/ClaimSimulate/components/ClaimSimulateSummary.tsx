import React, { useEffect } from "react";
import {
    Box,
    Button,
    Chip,
    Divider,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import HotelOutlinedIcon from "@mui/icons-material/HotelOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import BedroomChildOutlinedIcon from "@mui/icons-material/BedroomChildOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import HealthAndSafetyOutlinedIcon from "@mui/icons-material/HealthAndSafetyOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";

import { useAppSelector } from "../../../../redux";
import { useClaimSimulatePage } from "../hooks/useClaimSimulatePage";
import { CLAIM_CAUSE_OPTIONS } from "../store/claimSimulateOptions";
import ConfirmCalaulateModal from "./ConfirmCalaulateModal";
import { useNavigate } from "react-router-dom";
import { useGetDataFromApi } from "../hooks/useGetDataFromApi";

const REF = {
    primary: "#0b74bd",
    primaryDark: "#075d99",
    soft: "#eaf5ff",
    line: "#dce8f4",
    lineStrong: "#c4d7ea",
    text: "#243447",
    danger: "#F14242",
    dangerSoft: "#fef2f0",
    dangerLine: "#fbd2cf",
    success: "#15803d",
    successSoft: "#f0f8f1",
    successLine: "#d1e9d6",
};

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; subtitle?: string }> = ({
    icon,
    title,
    subtitle,
}) => (
    <Box display="flex" alignItems="center" gap={1.25} mb={2.5}>
        <Box
            sx={{
                width: 38,
                height: 38,
                borderRadius: "12px",
                bgcolor: REF.soft,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
            }}
        >
            {icon}
        </Box>
        <Box>
            <Typography fontWeight={700} fontSize={16} color={REF.primaryDark} lineHeight={1.3}>
                {title}
            </Typography>
            {subtitle && (
                <Typography variant="caption" color="text.secondary">
                    {subtitle}
                </Typography>
            )}
        </Box>
    </Box>
);

const InfoField: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({
    icon,
    label,
    value,
}) => (
    <Box
        sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1.25,
            p: 1.5,
            borderRadius: 2,
            border: "1px solid",
            borderColor: REF.line,
            bgcolor: "#fafcff",
            height: "100%",
        }}
    >
        <Box
            sx={{
                width: 30,
                height: 30,
                borderRadius: "8px",
                bgcolor: REF.soft,
                color: REF.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
            }}
        >
            {icon}
        </Box>
        <Box>
            <Typography variant="caption" color="text.secondary" fontSize={13} lineHeight={1.4}>
                {label}
            </Typography>
            <Typography fontWeight={700} color={REF.text} fontSize={15} lineHeight={1.4}>
                {value}
            </Typography>
        </Box>
    </Box>
);

const DayStatCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    sub: string;
    value: number;
    color: string;
    bg: string;
    border: string;
}> = ({ icon, label, sub, value, color, bg, border }) => (
    <Paper
        elevation={0}
        sx={{
            p: 2,
            borderRadius: 2,
            textAlign: "center",
            bgcolor: bg,
            border: "1px solid",
            borderColor: border,
            height: "100%",
        }}
    >
        <Box display="flex" alignItems="center" justifyContent="center" gap={0.75} mb={1}>
            <Box sx={{ color, display: "flex" }}>{icon}</Box>
            <Typography fontWeight={700} fontSize={14} color={color}>
                {label}
            </Typography>
        </Box>
        <Typography variant="h4" fontWeight={800} color={color} lineHeight={1.2}>
            {value}
        </Typography>
        <Typography variant="caption" color="text.secondary">
            {sub}
        </Typography>
    </Paper>
);

const ClaimSimulateSummary: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
    const navigate = useNavigate();
    const { header, daysCalculate, selectedInsured } = useAppSelector((s) => s.claimsimulate);

    const {
        filledItems,
        coverageTypeOptions,
        medicalTypeOptions,
        openConfirm,
        isCalculating,
        handleConfirmCalculate,
        handleConfirm,
        handleCloseConfirm,
    } = useClaimSimulatePage();

    const { claimContinueOptions } = useGetDataFromApi(selectedInsured?.policyCode);

    const fmt = (n: number) => (n ?? 0).toLocaleString("th-TH", { minimumFractionDigits: 2 });
    const fmtDate = (d: any) => (d ? (d.format ? d.format("DD/MM/BBBB") : String(d)) : "-");
    const fmtDateTime = (d: any) => (d ? (d.format ? d.format("DD/MM/BBBB HH:mm") : String(d)) : "-");

    const claimCauseLabel = CLAIM_CAUSE_OPTIONS.find((o) => o.value === header.claimCause)?.label ?? "-";
    const coverageTypeLabel = coverageTypeOptions.find((o) => o.value === header.coverageType)?.label ?? "-";
    const medicalTypeLabel = medicalTypeOptions.find((o) => o.value === header.medicalType)?.label ?? "-";

    const rows = filledItems.map((item) => {
        const claimAmount = item.claimAmount ?? 0;
        const discount = item.discount ?? 0;
        const notCovered = item.notCovered ?? 0;
        const eligibleAmount = Math.max(claimAmount - discount - notCovered, 0);
        return {
            label: `${item.code ?? ""} ${item.description ?? ""}`.trim(),
            claimAmount,
            eligibleAmount,
            notCovered,
            remark: item.remark || "-",
        };
    });

    const totalClaim = rows.reduce((s, r) => s + r.claimAmount, 0);
    const totalEligible = rows.reduce((s, r) => s + r.eligibleAmount, 0);
    const totalNotCovered = rows.reduce((s, r) => s + r.notCovered, 0);

    const continuousClaimLabel = daysCalculate.isContinuous
        ? claimContinueOptions.find((opt) => opt.claimId === daysCalculate.continuousFromClaimNo)?.label ?? "-"
        : null;

    useEffect(() => {
        if (!selectedInsured?.policyCode) navigate("..");
    }, [selectedInsured?.policyCode]);

    return (
        <Box sx={{ p: { xs: 1.5, sm: 2.5 } }}>
            {/* ── Header banner ── */}
            <Box
                sx={{
                    // background: `linear-gradient(135deg, ${REF.primary}, ${REF.primaryDark})`,
                    background: `linear-gradient(150deg, ${REF.primaryDark} 0%, ${REF.primary} 100%)`,
                    borderRadius: 3,
                    px: { xs: 2.5, sm: 3.5 },
                    py: 2.75,
                    mb: 2.5,
                    color: "#fff",
                    boxShadow: "0 8px 24px rgba(11,116,189,.18)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 1.5,
                }}
            >
                <Box>
                    <Typography fontWeight={700} fontSize={20} mb={0.5}>
                        ตรวจสอบรายการและสรุปความคุ้มครอง
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.85 }}>
                        ตรวจสอบข้อมูลที่กรอกก่อนยืนยันการบันทึกผลคำนวณ
                    </Typography>
                </Box>
                {selectedInsured?.customerName && (
                    <Chip
                        icon={<PersonOutlineOutlinedIcon sx={{ color: "#fff !important", fontSize: 18 }} />}
                        label={`${selectedInsured.customerName}${
                            selectedInsured.policyCode ? ` · ${selectedInsured.policyCode}` : ""
                        }`}
                        sx={{
                            bgcolor: "rgba(255,255,255,0.16)",
                            color: "#fff",
                            fontWeight: 600,
                            px: 0.5,
                            backdropFilter: "blur(2px)",
                        }}
                    />
                )}
            </Box>

            {/* ── รายละเอียดเคลม ── */}
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2, sm: 2.5 },
                    mb: 2.5,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                }}
            >
                <SectionHeader
                    icon={<DescriptionOutlinedIcon sx={{ fontSize: 25, color: REF.primary }} />}
                    title="รายละเอียดเคลม"
                    subtitle="ข้อมูลสรุปรายการที่เลือก"
                />

                <Grid container spacing={2} mb={3}>
                    <Grid item xs={12} sm={6} md={4}>
                        <InfoField
                            icon={<HealthAndSafetyOutlinedIcon sx={{ fontSize: 17 }} />}
                            label="เหตุของการเคลม"
                            value={claimCauseLabel}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <InfoField
                            icon={<DescriptionOutlinedIcon sx={{ fontSize: 17 }} />}
                            label="ประเภทความคุ้มครอง"
                            value={coverageTypeLabel}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <InfoField
                            icon={<LocalHospitalOutlinedIcon sx={{ fontSize: 17 }} />}
                            label="ประเภทการรักษา"
                            value={medicalTypeLabel}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <InfoField
                            icon={<EventOutlinedIcon sx={{ fontSize: 17 }} />}
                            label="วันที่เกิดเหตุ"
                            value={fmtDate(daysCalculate.dateHappen)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <InfoField
                            icon={<LoginOutlinedIcon sx={{ fontSize: 17 }} />}
                            label="วันที่เข้า รพ."
                            value={fmtDateTime(daysCalculate.admitDate)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <InfoField
                            icon={<LogoutOutlinedIcon sx={{ fontSize: 17 }} />}
                            label="วันที่ออก รพ."
                            value={fmtDateTime(daysCalculate.dischargeDate)}
                        />
                    </Grid>
                </Grid>

                <Divider sx={{ mb: 2.5, borderColor: REF.line }} />

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                        <DayStatCard
                            icon={<HotelOutlinedIcon sx={{ fontSize: 18 }} />}
                            label="IPD"
                            sub="จำนวนวันนอนห้องปกติ"
                            value={daysCalculate.ipdDays ?? 0}
                            color={REF.primary}
                            bg={REF.soft}
                            border={REF.line}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <DayStatCard
                            icon={<LocalHospitalOutlinedIcon sx={{ fontSize: 18 }} />}
                            label="ICU"
                            sub="จำนวนวันนอนห้อง ICU"
                            value={daysCalculate.icuDays ?? 0}
                            color={REF.danger}
                            bg={REF.dangerSoft}
                            border={REF.dangerLine}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <DayStatCard
                            icon={<BedroomChildOutlinedIcon sx={{ fontSize: 18 }} />}
                            label="วันนอนรวม"
                            sub="จำนวนวันนอนรวมทั้งหมด"
                            value={daysCalculate.bedDays ?? 0}
                            color="#5b6472"
                            bg="#f4f5f7"
                            border="#e2e5ea"
                        />
                    </Grid>
                </Grid>
                {daysCalculate.isContinuous && (
                    <>
                        <Divider sx={{ my: 2.5, borderColor: REF.line }} />
                        <InfoField
                            icon={<EventOutlinedIcon sx={{ fontSize: 17 }} />}
                            label="เคลมต่อเนื่องจาก"
                            value={continuousClaimLabel}
                        />
                    </>
                )}
            </Paper>

            {/* ── รายการค่าใช้จ่าย ── */}
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2, sm: 2.5 },
                    mb: 2.5,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                }}
            >
                <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1} mb={2.5}>
                    <SectionHeader
                        icon={<ReceiptLongOutlinedIcon sx={{ fontSize: 25, color: REF.primary }} />}
                        title="รายการค่าใช้จ่าย"
                        subtitle="ยอดเบิก สิทธิ์เบิก และยอดไม่คุ้มครอง"
                    />
                    <Chip
                        label={`${rows.length} รายการ`}
                        size="small"
                        sx={{ bgcolor: REF.soft, color: REF.primaryDark, fontWeight: 700 }}
                    />
                </Box>

                <TableContainer
                    sx={{
                        border: "1px solid",
                        borderColor: REF.line,
                        borderRadius: 2,
                        overflowX: "auto",
                        overflowY: "hidden",

                        "&::-webkit-scrollbar": {
                            height: 6,
                        },
                        "&::-webkit-scrollbar-thumb": {
                            backgroundColor: "#c5c5c5",
                            borderRadius: 10,
                        },
                    }}
                >
                    <Table
                        size="small"
                        sx={{
                            minWidth: 760, // หรือ 700
                            tableLayout: "auto",
                        }}
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell
                                    sx={{
                                        fontWeight: 700,
                                        whiteSpace: "nowrap",
                                        fontSize: 15,
                                        color: REF.primaryDark,
                                        bgcolor: REF.soft,
                                        borderBottom: "1px solid",
                                        borderColor: REF.line,
                                    }}
                                >
                                    รายการ
                                </TableCell>
                                {["ยอดเบิก", "สิทธิ์เบิก", "ยอดไม่คุ้มครอง", "หมายเหตุ"].map((h) => (
                                    <TableCell
                                        key={h}
                                        align={h === "หมายเหตุ" ? "center" : "right"}
                                        sx={{
                                            fontWeight: 700,
                                            whiteSpace: "nowrap",
                                            fontSize: 15,
                                            color: REF.primaryDark,
                                            bgcolor: REF.soft,
                                            borderBottom: "1px solid",
                                            borderColor: REF.line,
                                        }}
                                    >
                                        {h}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.disabled" }}>
                                        ไม่พบรายการ
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rows.map((r, idx) => (
                                    <TableRow
                                        key={idx}
                                        sx={{
                                            bgcolor: idx % 2 === 0 ? "#fff" : "#fafcff",
                                            "&:last-child td": { borderBottom: "none" },
                                        }}
                                    >
                                        <TableCell sx={{ fontSize: 15, whiteSpace: "nowrap" }}>{r.label}</TableCell>
                                        <TableCell
                                            align="right"
                                            sx={{ fontSize: 15, color: REF.text, whiteSpace: "nowrap" }}
                                        >
                                            {fmt(r.claimAmount)}
                                        </TableCell>
                                        <TableCell
                                            align="right"
                                            sx={{ fontSize: 15, whiteSpace: "nowrap", color: REF.primary }}
                                        >
                                            {fmt(r.eligibleAmount)}
                                        </TableCell>
                                        <TableCell
                                            align="right"
                                            sx={{ fontSize: 15, whiteSpace: "nowrap", color: REF.danger }}
                                        >
                                            {fmt(r.notCovered)}
                                        </TableCell>
                                        <TableCell
                                            align="center"
                                            sx={{ fontSize: 15, whiteSpace: "nowrap", color: "text.secondary" }}
                                        >
                                            {r.remark}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* ── สรุปยอดสุทธิ ── */}
                <Grid container spacing={1.5} mt={0.5}>
                    <Grid item xs={12} sm={4}>
                        <Paper
                            elevation={0}
                            sx={{
                                flex: 1,
                                minWidth: 160,
                                p: 1.75,
                                borderRadius: 2,
                                bgcolor: REF.soft,
                                border: "1px solid",
                                borderColor: REF.line,
                                textAlign: "center",
                            }}
                        >
                            <Typography fontSize={14} color="text.secondary">
                                ยอดเบิกรวม
                            </Typography>
                            <Typography fontWeight={800} fontSize={18} color={REF.text}>
                                {fmt(totalClaim)}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Paper
                            elevation={0}
                            sx={{
                                flex: 1,
                                minWidth: 160,
                                p: 1.75,
                                borderRadius: 2,
                                bgcolor: "#eefaf1",
                                border: "1px solid",
                                borderColor: "#cdeed8",
                                textAlign: "center",
                            }}
                        >
                            <Typography fontSize={14} color="text.secondary">
                                สิทธิ์เบิกรวม
                            </Typography>
                            <Typography fontWeight={800} fontSize={18} color="#15803d">
                                {fmt(totalEligible)}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Paper
                            elevation={0}
                            sx={{
                                flex: 1,
                                minWidth: 160,
                                p: 1.75,
                                borderRadius: 2,
                                bgcolor: REF.dangerSoft,
                                border: "1px solid",
                                borderColor: REF.dangerLine,
                                textAlign: "center",
                            }}
                        >
                            <Typography fontSize={14} color="text.secondary">
                                ยอดไม่คุ้มครองรวม
                            </Typography>
                            <Typography fontWeight={800} fontSize={18} color={REF.danger}>
                                {fmt(totalNotCovered)}
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Paper>

            {/* ── ปุ่มดำเนินการ ── */}
            <Box display="flex" justifyContent="flex-end" gap={1.5} flexDirection={{ xs: "column", sm: "row" }} pb={2}>
                <Button
                    variant="outlined"
                    startIcon={<EditOutlinedIcon />}
                    onClick={onBack}
                    sx={{
                        borderRadius: 2,
                        fontWeight: 600,
                        px: 3,
                        bgcolor: "#fff",
                        boxShadow: 1,
                        fontSize: 14,
                        xs: "100%",
                        sm: "auto",
                    }}
                    size="medium"
                >
                    กลับไปแก้ไข
                </Button>
                <Button
                    variant="contained"
                    startIcon={<FactCheckOutlinedIcon />}
                    onClick={handleConfirmCalculate}
                    disabled={isCalculating}
                    sx={{ borderRadius: 2, fontWeight: 700, px: 3, boxShadow: 1, fontSize: 14, xs: "70%", sm: "auto" }}
                    size="medium"
                >
                    {isCalculating ? "กำลังคำนวณ..." : "สรุปความคุ้มครอง"}
                </Button>
            </Box>

            <ConfirmCalaulateModal open={openConfirm} onClose={handleCloseConfirm} onConfirm={handleConfirm} />
        </Box>
    );
};

export default ClaimSimulateSummary;
