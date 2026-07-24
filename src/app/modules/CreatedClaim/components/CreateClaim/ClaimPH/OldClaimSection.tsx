import React from "react";
import { Box, Chip, Divider, Grid, Typography } from "@mui/material";
import { MUIDataTableColumn } from "mui-datatables";
import {
    cellAlignOptions,
    defaultOptionStandardDataTable,
    formatDateString,
    smallSizeFooter,
} from "../../../../../functionHelpers";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import { StandardDataTable } from "../../../../_common";
import CustomBox from "../../../../_common/components/CustomComponent/CustomBox";
import { GetCaseByClaimIdDtoResponse } from "../../../../../api/coreClaimApi.client";
import CachedIcon from "@mui/icons-material/Cached";

interface Props {
    data: GetCaseByClaimIdDtoResponse;
}
const mockClaimHistoryData = [
    {
        seq: 1,
        claimCase: "CL-2026-000123",
        claimType: "ผู้ป่วยใน (IPD)",
        chiefComplain: "ไข้เลือดออก มีไข้สูง 3 วัน",
        admitDate: "2026-05-12",
        status: "จ่ายแล้ว",
        claimAmount: 45000,
        paidAmount: 42000,
    },
    {
        seq: 2,
        claimCase: "CL-2026-000456",
        claimType: "ผู้ป่วยนอก (OPD)",
        chiefComplain: "ปวดท้อง คลื่นไส้ อาเจียน",
        admitDate: "2026-06-03",
        status: "รอพิจารณา",
        claimAmount: 3500,
        paidAmount: 0,
    },
];
const OldClaimSection: React.FC<Props> = ({ data }) => {
    const columns: MUIDataTableColumn[] = [
        {
            name: "seq",
            label: "ลำดับ",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "claimCase",
            label: "ClaimCase",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "claimType",
            label: "ประเภทการรักษา",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "left" }) },
        },
        {
            name: "chiefComplain",
            label: "อาการสำคัญ",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "left" }) },
        },
        {
            name: "admitDate",
            label: "วันที่เข้ารักษา",
            options: {
                ...cellAlignOptions({ align: "center", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value) => formatDateString(value, "DD/MM/BBBB"),
            },
        },
        {
            name: "status",
            label: "สถานะ",
            options: {
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: (value) => (
                    <Chip
                        label={value}
                        size="small"
                        sx={{
                            backgroundColor: value === "จ่ายแล้ว" ? "#e8f5e9" : "#fff3e0",
                            color: value === "จ่ายแล้ว" ? "#2e7d32" : "#e65100",
                            fontWeight: 600,
                            fontSize: 11,
                        }}
                    />
                ),
            },
        },
        {
            name: "claimAmount",
            label: "ยอดเบิก",
            options: {
                ...cellAlignOptions({ align: "right", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value) => Number(value).toLocaleString("th-TH", { minimumFractionDigits: 2 }),
            },
        },
        {
            name: "paidAmount",
            label: "ยอดจ่าย",
            options: {
                ...cellAlignOptions({ align: "right", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value) => Number(value).toLocaleString("th-TH", { minimumFractionDigits: 2 }),
            },
        },
    ];

    return (
        <CustomBox>
            <HeadingWithColor icon={<CachedIcon sx={{ fontSize: 27 }} />} text="ข้อมูลเคลมเดิม" color="blue" />

            <>
                <Box
                    sx={{
                        border: "1px solid #b3d4f0",
                        borderRadius: 2,
                        p: 1,
                        bgcolor: "#eaf3fb",
                        mb: 2,
                    }}
                >
                    <Grid container spacing={1} alignItems="center">
                        <Grid item xs={12} sm={9}>
                            <Grid container spacing={1} ml={1}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary" component="span">
                                        ClaimNo :{" "}
                                    </Typography>
                                    <Typography variant="body2" color="primary" fontWeight={700} component="span">
                                        {data.claimNo}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary" component="span">
                                        วันที่เกิดเหตุ :{" "}
                                    </Typography>
                                    <Typography variant="body2" color="primary" fontWeight={700} component="span">
                                        {formatDateString(data?.incidentDate?.toString(), "DD/MM/BBBB")}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={12}>
                                    <Typography variant="body2" color="text.secondary" component="span">
                                        Diagnosis :{" "}
                                    </Typography>
                                    <Typography variant="body2" color="primary" fontWeight={700} component="span">
                                        {data.icD10Detail ?? "-"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary" component="span">
                                        ยอดเบิกรวม :{" "}
                                    </Typography>
                                    <Typography variant="body2" color="primary" fontWeight={700} component="span">
                                        {data?.totalCaseAmount?.toLocaleString("th-TH", { minimumFractionDigits: 2 }) ??
                                            "-"}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary" component="span">
                                        ยอดจ่ายรวม :{" "}
                                    </Typography>
                                    <Typography variant="body2" color="primary" fontWeight={700} component="span">
                                        {data?.totalPaidAmount?.toLocaleString("th-TH", { minimumFractionDigits: 2 }) ??
                                            "0.00"}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <Box
                                sx={{
                                    border: "1.5px dashed #1976d2",
                                    borderRadius: 2,
                                    p: 2,
                                    bgcolor: "#F0FDF4",
                                    width: "100%",
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    gap: 1.5,
                                }}
                            >
                                <Box sx={{ textAlign: "center" }}>
                                    <Typography variant="body2" color="text.secondary">
                                        วงเงินคงเหลือ
                                    </Typography>
                                    <Typography color="#2e7d32" fontWeight={700} fontSize={18}>
                                        {(3200).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                                    </Typography>
                                </Box>

                                <Divider flexItem sx={{ width: "100%" }} />

                                <Box sx={{ textAlign: "center" }}>
                                    <Typography variant="body2" color="text.secondary">
                                        คงเหลือหลังหักเคลมเดิม
                                    </Typography>
                                    <Typography color="#2e7d32" fontWeight={700} fontSize={18}>
                                        {(500000).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
                <StandardDataTable
                    name="OldClaimCaseTable"
                    title=""
                    data={mockClaimHistoryData ?? []}
                    isLoading={false}
                    columns={columns}
                    color="primary"
                    columnHeaderAlign="center"
                    displayToolbar={false}
                    options={{ ...defaultOptionStandardDataTable }}
                    sx={smallSizeFooter}
                />
            </>
        </CustomBox>
    );
};

export default OldClaimSection;
