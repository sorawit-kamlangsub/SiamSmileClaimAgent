import { Avatar, Box, Chip, Divider, Grid, Typography } from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import { useMemo } from "react";
import { GetCustomerDetailByIdDtoResponse } from "../../../../../api/coreClaimApi.client";
import { useGetBank } from "../../../../../api/coreClaimMastersApi";
import {
    backgroundColorMapCustomerPaymentStatus,
    colorMapCustomerPaymentStatus,
    formatPhone,
    setBankLogo,
} from "../../../../../functionHelpers";

type InfoRowProps = {
    label: string;
    value: React.ReactNode;
};

const InfoRow = ({ label, value }: InfoRowProps) => (
    <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: "0.8rem", color: "#757575", mb: 0.25 }}>{label}</Typography>
        <Typography component="div" sx={{ fontSize: "1rem", fontWeight: 700, color: "#007AC1" }}>
            {value || "-"}
        </Typography>
    </Box>
);

type HeaderCardSchoolDetailsProps = {
    customerDetail: GetCustomerDetailByIdDtoResponse | undefined;
};

const HeaderCardSchoolDetails = ({ customerDetail }: HeaderCardSchoolDetailsProps) => {
    const { data: bankData } = useGetBank();

    const bankName = useMemo(
        () => bankData?.data?.find((bank) => bank.organizeId === customerDetail?.bankId)?.organizeName,
        [bankData, customerDetail?.bankId]
    );

    // cardTypeId 2 = บัตรประชาชน (3 = passport) — แสดงเฉพาะกรณีบัตรประชาชน เหมือน HeaderCardCustomerDetails
    const idCardNo = customerDetail?.cardTypeId === 2 ? customerDetail?.cardDetail : undefined;

    const paymentStatusCode = customerDetail?.customerPaymentStatusCode;
    const paymentStatusBgColor = paymentStatusCode
        ? backgroundColorMapCustomerPaymentStatus[paymentStatusCode]
        : undefined;
    const paymentStatusTextColor = paymentStatusCode ? colorMapCustomerPaymentStatus[paymentStatusCode] : undefined;

    return (
        <Box
            sx={{
                borderRadius: 3,
                backgroundColor: "#FFFFFF",
                padding: "16px 20px",
                width: "100%",
                border: "1px solid #E8EDF3",
                boxShadow: "0 1px 3px rgba(16, 24, 40, 0.06)",
            }}
        >
            <Grid container alignItems="center" spacing={1.5} wrap="nowrap">
                <Grid item sx={{ flexShrink: 0 }}>
                    <Box
                        sx={{
                            width: 52,
                            height: 52,
                            minWidth: 52,
                            borderRadius: 3,
                            backgroundColor: "#EAF5FF",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <SchoolIcon sx={{ color: "#0B7FC7", fontSize: 28 }} />
                    </Box>
                </Grid>

                <Grid item xs sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: "0.8rem", color: "#757575" }}>ข้อมูลสถานศึกษา</Typography>
                    <Typography sx={{ fontSize: "1.05rem", fontWeight: 700, color: "#0068B0" }}>
                        {customerDetail?.schoolName ?? "-"}
                    </Typography>
                </Grid>

                <Grid item sx={{ flexShrink: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                    <Typography sx={{ fontSize: "0.85rem", color: "#757575" }}>AppID :</Typography>
                    <Chip
                        label={customerDetail?.policyCode ?? "-"}
                        size="small"
                        sx={{
                            backgroundColor: "#EAF5FF",
                            color: "#0068B0",
                            fontWeight: 700,
                            borderRadius: "8px",
                        }}
                    />
                </Grid>
            </Grid>

            <Divider sx={{ my: 1.5 }} />

            <Grid container rowSpacing={2} columnSpacing={3}>
                <Grid item xs={12}>
                    <InfoRow label="ที่อยู่" value={customerDetail?.address} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <InfoRow label="ผู้ติดต่อประสาน" value={customerDetail?.contactName} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <InfoRow label="ตำแหน่ง" value={customerDetail?.contactPositionName} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <InfoRow label="รหัสบัตร ปชช." value={idCardNo} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <InfoRow label="เบอร์โทรศัพท์" value={formatPhone(customerDetail?.contactPhoneNo)} />
                </Grid>
                <Grid item xs={12} md={6}>
                    <InfoRow
                        label="ข้อมูลบัญชี"
                        value={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                                {customerDetail?.bankId && (
                                    <Avatar
                                        src={setBankLogo(customerDetail.bankId)}
                                        alt={bankName ?? ""}
                                        sx={{ width: 20, height: 20 }}
                                    />
                                )}
                                <span>
                                    {[bankName, customerDetail?.bankAccountNo].filter(Boolean).join(" ") || "-"}
                                </span>
                                {customerDetail?.bankAccountName && (
                                    <Typography
                                        component="span"
                                        sx={{ fontSize: "0.85rem", fontWeight: 400, color: "#8A94A6" }}
                                    >
                                        {customerDetail.bankAccountName}
                                    </Typography>
                                )}
                            </Box>
                        }
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <InfoRow
                        label="สถานะการชำระเงิน"
                        value={
                            <Chip
                                label={customerDetail?.customerPaymentStatus ?? "-"}
                                size="small"
                                sx={{
                                    backgroundColor: paymentStatusBgColor ?? "#EEEEEE",
                                    color: paymentStatusTextColor ?? "#616161",
                                    fontWeight: 600,
                                    borderRadius: "16px",
                                    height: "auto",
                                    "& .MuiChip-label": { lineHeight: 1.6, py: "2px" },
                                }}
                            />
                        }
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default HeaderCardSchoolDetails;
