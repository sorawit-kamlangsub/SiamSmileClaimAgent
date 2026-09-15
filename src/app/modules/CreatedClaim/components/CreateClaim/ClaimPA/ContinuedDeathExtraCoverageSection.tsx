import React, { useEffect, useMemo, useRef } from "react";
import { Box, Checkbox, Chip, Grid, Skeleton, Typography } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import HeartBrokenIcon from "@mui/icons-material/HeartBroken";
import InfoIcon from "@mui/icons-material/Info";
import PublicIcon from "@mui/icons-material/Public";
import SchoolIcon from "@mui/icons-material/School";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import dayjs from "dayjs";
import { FormikProps } from "formik";
import {
    GetCustomerBenefitDetailHalfDtoResponse,
    GetPreviousClaimDtoResponse,
} from "../../../../../api/coreClaimApi.client";
import { classifyDeathBenefit } from "../../../../../deathBenefitHelpers";
import { ClaimPAFormValues, DeathExtraCoverageId } from "../../../store/claimPASlice";
import {
    backgroundColorMapPaymentStatus,
    colorMapPaymentStatus,
    numberWithCommas,
} from "../../../../../functionHelpers";
import { useGetPaymentStatus } from "../../../../../api/coreClaimMastersApi";
import { FormikTextNumber } from "../../../../_common";
import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

const ICON_BY_CATEGORY: Partial<Record<DeathExtraCoverageId, React.ReactNode>> = {
    [DeathExtraCoverageId.PublicDisaster]: <PublicIcon fontSize="small" />,
    [DeathExtraCoverageId.SchoolLiability]: <SchoolIcon fontSize="small" />,
    [DeathExtraCoverageId.FuneralExpense]: <VolunteerActivismIcon fontSize="small" />,
};

const DESCRIPTION_BY_CATEGORY: Partial<Record<DeathExtraCoverageId, string>> = {
    [DeathExtraCoverageId.PublicDisaster]: "ความคุ้มครองเพิ่มเติมกรณีเสียชีวิตจากภัยสาธารณะ",
    [DeathExtraCoverageId.SchoolLiability]: "ความคุ้มครองเพิ่มเติมตามเงื่อนไขความรับผิดของสถานศึกษา",
    [DeathExtraCoverageId.FuneralExpense]: "ผลประโยชน์ค่าปลงศพตามแผนประกัน",
};

const CAUSE_OF_INCIDENT_NAME: Record<number, string> = {
    2: "โรคทั่วไป",
    3: "อุบัติเหตุทั่วไป",
    4: "ขับขี่/โดยสารจักรยานยนต์",
    5: "ฆาตกรรม",
};

interface Props {
    oldClaim: GetPreviousClaimDtoResponse | undefined;
    benefits: GetCustomerBenefitDetailHalfDtoResponse[];
    isLoading?: boolean;
    formik: FormikProps<ClaimPAFormValues>;
}

const ContinuedDeathExtraCoverageSection: React.FC<Props> = ({ oldClaim, benefits, isLoading, formik }) => {
    const extraBenefits = useMemo(
        () =>
            benefits
                .map((b) => ({ benefit: b, category: classifyDeathBenefit(b) }))
                .filter(
                    (x): x is { benefit: GetCustomerBenefitDetailHalfDtoResponse; category: DeathExtraCoverageId } =>
                        x.category !== undefined && x.category !== "main"
                ),
        [benefits]
    );

    const { data: paymentStatusData } = useGetPaymentStatus();
    const oldClaimPaymentStatusName = useMemo(
        () =>
            paymentStatusData?.data?.find((s) => s.paymentStatusId === oldClaim?.paymentStatusId)?.paymentStatusNameTH,
        [paymentStatusData, oldClaim?.paymentStatusId]
    );

    // เลือก = category อยู่ใน formik.values.extraCoverageIds / ยอด = formik.values.deathBenefitAmounts (คีย์ด้วย standardMedicalExpenseId)
    const { extraCoverageIds, deathBenefitAmounts } = formik.values;
    const { setFieldValue } = formik;

    const toggleSelected = (category: DeathExtraCoverageId, expenseId: number) => {
        if (extraCoverageIds.includes(category)) {
            setFieldValue(
                "extraCoverageIds",
                extraCoverageIds.filter((c) => c !== category),
                false
            );
            setFieldValue(`deathBenefitAmounts.${expenseId}`, "", false);
        } else {
            setFieldValue("extraCoverageIds", [...extraCoverageIds, category], false);
        }
    };

    // ครั้งแรกที่โหลด benefits มา ให้เลือกทุกรายการไว้ก่อน (เหมือนพฤติกรรมเดิม)
    const didInitSelection = useRef(false);
    useEffect(() => {
        if (didInitSelection.current || extraBenefits.length === 0) return;
        didInitSelection.current = true;
        const allCategories = Array.from(new Set(extraBenefits.map((x) => x.category)));
        setFieldValue("extraCoverageIds", allCategories, false);
    }, [extraBenefits, setFieldValue]);

    const total = useMemo(
        () =>
            extraBenefits
                .filter((x) => extraCoverageIds.includes(x.category))
                .reduce(
                    (sum, x) => sum + (Number(deathBenefitAmounts?.[x.benefit.standardMedicalExpenseId ?? -1]) || 0),
                    0
                ),
        [extraBenefits, extraCoverageIds, deathBenefitAmounts]
    );

    const selectedCount = useMemo(
        () => extraBenefits.filter((x) => extraCoverageIds.includes(x.category)).length,
        [extraBenefits, extraCoverageIds]
    );

    // ดันยอดรวมความคุ้มครองเพิ่มเติมเข้า transferAmount เพื่อให้ validate/บันทึกใช้ค่าเดียวกัน
    useEffect(() => {
        if (formik.values.transferAmount !== total) {
            setFieldValue("transferAmount", total, false);
        }
    }, [total, formik.values.transferAmount, setFieldValue]);

    return (
        <CustomPaper>
            {/* หัวข้อ */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5} flexWrap="wrap" gap={1}>
                <Box display="flex" alignItems="center" gap={1}>
                    <Box
                        sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            bgcolor: "#EAF1FE",
                            color: "#2F6FED",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <SwapHorizIcon sx={{ fontSize: 27 }} />
                    </Box>
                    <Typography fontWeight={700} fontSize={16}>
                        แจ้งเคลมต่อเนื่อง — ความคุ้มครองเพิ่มเติม
                    </Typography>
                </Box>
                <Chip
                    icon={<LockIcon sx={{ fontSize: 16 }} />}
                    label="ล็อกยอดชีวิตหลักแล้ว"
                    size="small"
                    sx={{
                        bgcolor: "#FFF7E0",
                        color: "#B8860B",
                        fontWeight: 600,
                        border: "1px solid #F3E3A8",
                    }}
                />
            </Box>
            <Typography fontSize={13} color="text.secondary" mb={2}>
                อ้างอิงจากเคลมเสียชีวิตเดิม และเปิดให้ระบุเฉพาะสิทธิ์เพิ่มเติมที่ยังไม่ได้เบิก
            </Typography>

            {/* เคลมเดิม */}
            <Box
                sx={{
                    border: "1px solid #F5D5D5",
                    borderRadius: 2,
                    bgcolor: "#FDF3F3",
                    p: 2,
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 2,
                }}
            >
                <Box display="flex" alignItems="flex-start" gap={1.5}>
                    <Box
                        sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            bgcolor: "#FBE0E0",
                            color: "#D9534F",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                    >
                        <HeartBrokenIcon fontSize="small" />
                    </Box>
                    <Box>
                        <Typography fontSize={12} color="text.secondary">
                            เคลมเดิม
                        </Typography>
                        <Typography fontWeight={700} fontSize={15} mb={1}>
                            {oldClaim?.causeOfIncidentId != null && CAUSE_OF_INCIDENT_NAME[oldClaim.causeOfIncidentId]
                                ? `เสียชีวิตจาก${CAUSE_OF_INCIDENT_NAME[oldClaim.causeOfIncidentId]}`
                                : "-"}
                        </Typography>
                        <Box display="flex" gap={1} flexWrap="wrap">
                            <Chip size="small" label={`เลขที่ CL : ${oldClaim?.claimNo ?? "-"}`} />
                            <Chip
                                size="small"
                                label={`วันที่เกิดเหตุ : ${
                                    oldClaim?.incidentDate ? dayjs(oldClaim.incidentDate).format("DD/MM/BBBB") : "-"
                                }`}
                            />
                            <Chip
                                size="small"
                                label={`สถานะ : ${oldClaimPaymentStatusName ?? "-"}`}
                                sx={{
                                    bgcolor:
                                        backgroundColorMapPaymentStatus[oldClaim?.paymentStatusId ?? 0] ?? undefined,
                                    color: colorMapPaymentStatus[oldClaim?.paymentStatusId ?? 0] ?? undefined,
                                    fontWeight: 600,
                                }}
                            />
                        </Box>
                    </Box>
                </Box>
                <Box textAlign="right">
                    <Typography fontSize={12} color="text.secondary">
                        ยอดจ่ายผลประโยชน์หลัก
                    </Typography>
                    <Typography fontWeight={700} fontSize={20} color="#D9534F">
                        {numberWithCommas(oldClaim?.totalNetPaidAmount ?? 0)} บาท
                    </Typography>
                </Box>
            </Box>

            {/* แจ้งเตือน */}
            <Box
                sx={{
                    border: "1px solid #F3E3A8",
                    borderRadius: 2,
                    bgcolor: "#FFF9EA",
                    p: 1.5,
                    mb: 2,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1,
                }}
            >
                <InfoIcon sx={{ color: "#C8A415", fontSize: 20, mt: "1px" }} />
                <Typography fontSize={13} color="#8a6d1f">
                    ผลประโยชน์ เสียชีวิตจากอุบัติเหตุทั่วไป ถูกจ่ายครบแล้ว ระบบจึงไม่แสดงช่องกรอกยอดเดิมซ้ำ
                    กรุณาเลือกและกรอกเฉพาะความคุ้มครองเพิ่มเติมด้านล่าง
                </Typography>
            </Box>

            {/* เลือกความคุ้มครองเพิ่มเติม */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5} flexWrap="wrap" gap={1}>
                <Box display="flex" alignItems="center" gap={0.75}>
                    <AddCircleIcon sx={{ fontSize: 18, color: "#2F6FED" }} />
                    <Typography fontWeight={700} fontSize={14}>
                        เลือกความคุ้มครองเพิ่มเติม
                    </Typography>
                </Box>
                {!isLoading && extraBenefits.length > 0 && (
                    <Chip
                        size="small"
                        label={`เลือกแล้ว ${selectedCount} / ${extraBenefits.length}`}
                        sx={{ bgcolor: "#EAF1FE", color: "#2F6FED", fontWeight: 600 }}
                    />
                )}
            </Box>

            {isLoading ? (
                <Grid container spacing={2} mb={2}>
                    {[1, 2, 3].map((n) => (
                        <Grid item xs={12} sm={6} md={4} key={n}>
                            <Skeleton variant="rounded" height={210} />
                        </Grid>
                    ))}
                </Grid>
            ) : extraBenefits.length === 0 ? (
                <Box
                    sx={{
                        border: "1px dashed #D5DEEB",
                        borderRadius: 2,
                        bgcolor: "#F9FBFD",
                        p: 3,
                        mb: 2,
                        textAlign: "center",
                    }}
                >
                    <Typography fontSize={13} color="text.secondary">
                        ไม่พบความคุ้มครองเพิ่มเติมสำหรับกรมธรรม์นี้
                    </Typography>
                </Box>
            ) : (
                <Grid container spacing={2} mb={2}>
                    {extraBenefits.map(({ benefit, category }) => {
                        const id = benefit.standardMedicalExpenseId ?? -1;
                        const isSelected = extraCoverageIds.includes(category);
                        const isRemainEmpty = (benefit.remainAmount ?? 0) <= 0;
                        return (
                            <Grid item xs={12} sm={6} md={4} key={id}>
                                <Box
                                    onClick={() => toggleSelected(category, id)}
                                    sx={{
                                        border: "1px solid",
                                        borderColor: isSelected ? "#2F6FED" : "#E3E8EF",
                                        borderRadius: 2.5,
                                        p: 2,
                                        height: "100%",
                                        cursor: "pointer",
                                        display: "flex",
                                        flexDirection: "column",
                                        bgcolor: isSelected ? "#F5F9FF" : "#fff",
                                        boxShadow: isSelected ? "0 0 0 3px rgba(47,111,237,0.12)" : "none",
                                        transition: "border-color .15s, box-shadow .15s, background-color .15s",
                                        "&:hover": { borderColor: isSelected ? "#2F6FED" : "#B7C9E4" },
                                    }}
                                >
                                    <Box display="flex" alignItems="flex-start" gap={1.25} mb={1.25}>
                                        <Box
                                            sx={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: "50%",
                                                flexShrink: 0,
                                                bgcolor: isSelected ? "#2F6FED" : "#EAF1FE",
                                                color: isSelected ? "#fff" : "#2F6FED",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            {ICON_BY_CATEGORY[category] ?? <AddCircleIcon fontSize="small" />}
                                        </Box>
                                        <Box flex={1} minWidth={0}>
                                            <Typography fontWeight={700} fontSize={14} lineHeight={1.35}>
                                                {benefit.benefitName ?? "-"}
                                            </Typography>
                                            <Typography fontSize={12} color="text.secondary" mt={0.25}>
                                                {DESCRIPTION_BY_CATEGORY[category] ?? ""}
                                            </Typography>
                                        </Box>
                                        <Checkbox
                                            checked={isSelected}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={() => toggleSelected(category, id)}
                                            size="small"
                                            sx={{ p: 0.25, mt: -0.25 }}
                                        />
                                    </Box>

                                    <Box
                                        sx={{
                                            display: "inline-flex",
                                            alignItems: "baseline",
                                            gap: 0.5,
                                            alignSelf: "flex-start",
                                            bgcolor: "#EEF3FA",
                                            borderRadius: 1,
                                            px: 1,
                                            py: 0.25,
                                            mb: 1.5,
                                        }}
                                    >
                                        <Typography
                                            fontSize={11.5}
                                            color={isRemainEmpty ? "error.main" : "text.secondary"}
                                        >
                                            วงเงินคงเหลือ
                                        </Typography>
                                        <Typography
                                            fontSize={12.5}
                                            fontWeight={700}
                                            color={isRemainEmpty ? "error.main" : "#1F2A44"}
                                        >
                                            {numberWithCommas(benefit.remainAmount ?? 0)}
                                        </Typography>
                                        <Typography
                                            fontSize={11.5}
                                            color={isRemainEmpty ? "error.main" : "text.secondary"}
                                        >
                                            บาท
                                        </Typography>
                                    </Box>

                                    <Box mt="auto" onClick={(e) => e.stopPropagation()}>
                                        <FormikTextNumber
                                            name={`deathBenefitAmounts.${id}`}
                                            label="จำนวนเงินที่ต้องการโอน"
                                            formik={formik}
                                            decimalScale={2}
                                            thousandSeparator
                                            placeholder="0.00"
                                            disabled={!isSelected}
                                            useFocusError={false}
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    bgcolor: isSelected ? "#fff" : "transparent",
                                                },
                                            }}
                                        />
                                    </Box>
                                </Box>
                            </Grid>
                        );
                    })}
                </Grid>
            )}

            {/* สรุปยอดรวม */}
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
                gap={1}
                sx={{ bgcolor: "#F5F9FF", border: "1px solid #DDE8FA", borderRadius: 2, p: 1.75 }}
            >
                <Typography fontSize={13.5} color="text.secondary">
                    จำนวนเงินตามความคุ้มครองเพิ่มเติมที่เลือก
                    {selectedCount > 0 && ` (${selectedCount} รายการ)`}
                </Typography>
                <Typography fontWeight={700} fontSize={16} color="#2F6FED">
                    {numberWithCommas(total)}.00 บาท
                </Typography>
            </Box>
        </CustomPaper>
    );
};

export default ContinuedDeathExtraCoverageSection;

