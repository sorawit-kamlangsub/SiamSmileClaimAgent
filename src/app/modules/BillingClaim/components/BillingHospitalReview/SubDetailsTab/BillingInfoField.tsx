import { ReactNode } from "react";
import { Box, Grid, GridProps, Typography } from "@mui/material";

type BillingInfoFieldProps = {
    label: string;
    value?: ReactNode | undefined;
    xs?: GridProps["xs"];
    sm?: GridProps["sm"];
    md?: GridProps["md"];
    lg?: GridProps["lg"];
};

/**
 * ช่องแสดงข้อมูลแบบ Read-only ของหน้าตรวจสอบรพ.วางบิล — props/ขนาด grid ชุดเดียวกับ `CustomDisplayText`
 * (_common) เพื่อสลับแทนกันได้ตรง ๆ แต่แสดงเป็นกล่องพื้นอ่อน — สี label/ค่าชุดเดียวกับการ์ด `CardClaimInfo`
 * (header ข้อมูลเคลมด้านบนของหน้า) : label `#757575` + ค่าตัวหนา `#0068B0`
 * แยกไว้เฉพาะ BillingClaim ไม่แตะ `CustomDisplayText` ที่ใช้ทั้งโปรเจค
 */
const BillingInfoField = ({ label, value, xs = 12, sm = 6, md = 3, lg }: BillingInfoFieldProps) => {
    // BE ส่ง null มาได้ (เช่น reservationRemark) — นับเป็นค่าว่างเหมือน undefined ไม่งั้นจะ render ว่างเปล่าไม่มี "-"
    const isText = typeof value === "string" || value === undefined || value === null;
    const isEmpty = isText && (value === undefined || value === null || (value as string).trim() === "");

    return (
        <Grid item xs={xs} sm={sm} md={md} lg={lg}>
            <Box
                sx={{
                    height: "100%",
                    p: "10px 14px",
                    borderRadius: "10px",
                    bgcolor: "#F7F9FC",
                    border: "1px solid #EDF1F7",
                }}
            >
                <Typography sx={{ fontSize: "0.8rem", color: "#757575", mb: 0.25 }}>{label}</Typography>
                {isText ? (
                    <Typography
                        sx={{
                            fontSize: "1rem",
                            fontWeight: 700,
                            color: "#0068B0",
                            whiteSpace: "pre-line",
                            wordBreak: "break-word",
                        }}
                    >
                        {isEmpty ? "-" : value}
                    </Typography>
                ) : (
                    value
                )}
            </Box>
        </Grid>
    );
};

export default BillingInfoField;
