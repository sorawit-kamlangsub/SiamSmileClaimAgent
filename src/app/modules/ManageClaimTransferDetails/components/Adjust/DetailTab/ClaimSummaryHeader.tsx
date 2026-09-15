import React from "react";
import { Box, Grid, Link, Typography } from "@mui/material";
import { numberWithCommas } from "../../../../../functionHelpers";

export interface ClaimSummaryHeaderProps {
    claimDetails: any;
    onClNoClick?: () => void;
}

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <Box sx={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
        <Typography sx={{ color: "#78909C", fontSize: "0.9rem" }}>{label} :</Typography>
        {children}
    </Box>
);

const ClaimSummaryHeader = ({ claimDetails, onClNoClick }: ClaimSummaryHeaderProps) => {
    return (
        <Box
            sx={{
                backgroundColor: "#FFFFFF",
                borderRadius: "10px",
                padding: "20px 24px",
                border: "1px solid #E0E0E0",
            }}
        >
            <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                    <Field label="เลขที่ CL">
                        <Link
                            component="button"
                            underline="hover"
                            onClick={onClNoClick}
                            sx={{ color: "#1565C0", fontWeight: 700 }}
                        >
                            {claimDetails?.claimNo}
                        </Link>
                    </Field>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Field label="ชื่อผู้เอาประกัน">
                        <Typography sx={{ fontWeight: 700, color: "#1565C0" }}>{claimDetails?.customerName}</Typography>
                    </Field>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Field label="ผู้ทำรายการ">
                        <Typography sx={{ fontWeight: 700, color: "#1565C0" }}>
                            {claimDetails?.createdByUserName}
                        </Typography>
                    </Field>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Field label="จำนวนการเคลม">
                        <Typography sx={{ fontWeight: 700, color: "#1565C0" }}>{claimDetails?.countItem}</Typography>
                    </Field>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Field label="จำนวนเงินที่โอนแล้ว">
                        <Typography sx={{ fontWeight: 700, color: "#1565C0" }}>
                            {numberWithCommas(claimDetails?.totalNetPaidAmount ?? 0)}
                        </Typography>
                    </Field>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ClaimSummaryHeader;
