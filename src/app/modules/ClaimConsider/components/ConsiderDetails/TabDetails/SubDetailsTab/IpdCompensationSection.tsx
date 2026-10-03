import React from "react";
import { Alert, Box, Typography } from "@mui/material";
import HotelOutlinedIcon from "@mui/icons-material/HotelOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { IpdCompensationResult } from "../../../../store/ipdCompensationCalculator";

// ─── ใช้ token ชุดเดียวกับ Section "สรุปยอดเงิน" ใน ExpenseRecords ─────────────
const REF = {
    primary: "#0b74bd",
    primaryDark: "#075d99",
    soft: "#eaf5ff",
    line: "#e3e9f0",
};

const fmt = (v: number) => v.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface IpdCompensationSectionProps {
    compensation: IpdCompensationResult;
}

/**
 * ค่าชดเชยผู้ป่วยใน (ตามสิทธิ์ความคุ้มครอง) — อ่านอย่างเดียว
 * แสดงเฉพาะพิจารณาเคลมลูกค้า ค่ารักษา IPD/Day Case อยู่ระหว่างตารางรายการค่ารักษากับ "สรุปยอดเงิน"
 * กรณีมี IPD_Half_5 ยังแสดงยอดที่คำนวณได้ตามเดิม (แต่ไม่ถูกนำไปบวกในยอดเงินสุทธิ)
 */
const IpdCompensationSection: React.FC<IpdCompensationSectionProps> = ({ compensation }) => {
    const rows = [
        { label: "จำนวนวันนอนรวม", value: `${compensation.days.toLocaleString("th-TH")}`, unit: "วัน" },
        { label: "อัตราค่าชดเชยต่อวัน", value: fmt(compensation.dailyRate), unit: "บาท" },
        {
            label: "วงเงินคงเหลือตามสิทธิ์",
            value: compensation.remainingBenefit === undefined ? "-" : fmt(compensation.remainingBenefit),
            unit: compensation.remainingBenefit === undefined ? "" : "บาท",
        },
    ];

    return (
        <Box
            sx={{
                border: "1px solid",
                borderColor: REF.line,
                borderRadius: 1.5,
                overflow: "hidden",
                mb: 2.5,
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 2,
                    py: 1.25,
                    bgcolor: REF.soft,
                    borderBottom: "1px solid",
                    borderColor: REF.line,
                }}
            >
                <HotelOutlinedIcon sx={{ fontSize: 20, color: REF.primary }} />
                <Typography fontWeight={700} color={REF.primary} fontSize={14}>
                    ค่าชดเชยผู้ป่วยใน (ตามสิทธิ์ความคุ้มครอง)
                </Typography>
            </Box>

            <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Box
                    sx={{
                        display: "grid",
                        gap: 1.5,
                        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
                        alignItems: "stretch",
                    }}
                >
                    {rows.map((row) => (
                        <Box
                            key={row.label}
                            sx={{
                                border: "1px solid",
                                borderColor: REF.line,
                                borderRadius: 1.5,
                                px: 2,
                                py: 1.5,
                                bgcolor: "#fafcff",
                            }}
                        >
                            <Typography variant="caption" color="text.secondary">
                                {row.label} :
                            </Typography>
                            <Typography fontWeight={700} color={REF.primaryDark} fontSize={17}>
                                {row.value}{" "}
                                <Typography component="span" variant="caption" color="text.secondary">
                                    {row.unit}
                                </Typography>
                            </Typography>
                        </Box>
                    ))}

                    <Box
                        sx={{
                            border: "1px solid",
                            borderColor: "#cdeacf",
                            borderRadius: 1.5,
                            px: 2,
                            py: 1.5,
                            bgcolor: "#f0f8f1",
                        }}
                    >
                        <Typography variant="caption" color="success.main" fontWeight={600}>
                            ค่าชดเชยผู้ป่วยใน :
                        </Typography>
                        <Typography fontWeight={700} color="success.main" fontSize={17}>
                            {fmt(compensation.payableCompensation)}{" "}
                            <Typography component="span" variant="caption">
                                บาท
                            </Typography>
                        </Typography>
                    </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={0.75} mt={1.25}>
                    <InfoOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                    <Typography variant="caption" color="text.secondary">
                        เป็นการคำนวณจากระบบ โปรดตรวจสอบกับยอดเงินที่โอน
                    </Typography>
                </Box>

                {!compensation.valid && (
                    <Alert severity="error" sx={{ mt: 1.5 }} tabIndex={-1} data-ipd-compensation-error>
                        ไม่สามารถคำนวณค่าชดเชยผู้ป่วยในได้ กรุณาตรวจสอบจำนวนวันนอนรวมและอัตราค่าชดเชยต่อวัน
                    </Alert>
                )}
            </Box>
        </Box>
    );
};

export default IpdCompensationSection;
