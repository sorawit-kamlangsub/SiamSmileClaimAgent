import React from "react";
import { Box, Chip, Divider, Grid, Typography } from "@mui/material";
import { MUIDataTableColumn } from "mui-datatables";
import {
    backgroundColorMapPaymentStatus,
    cellAlignOptions,
    colorMapPaymentStatus,
    defaultOptionStandardDataTable,
    formatDateString,
    smallSizeFooter,
} from "../../../../../functionHelpers";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import { StandardDataTable } from "../../../../_common";
import CustomBox from "../../../../_common/components/CustomComponent/CustomBox";
import { GetPreviousClaimDtoResponse } from "../../../../../api/coreClaimApi.client";
import CachedIcon from "@mui/icons-material/Cached";
import { useClaimHistory } from "../../../hooks/Monitor/useClaimHistory";

interface Props {
    data: GetPreviousClaimDtoResponse | undefined;
}
const OldClaimSection: React.FC<Props> = ({ data }) => {
    const { caseData, caseDataisLoading } = useClaimHistory(undefined, data?.claimId);
    const columns: MUIDataTableColumn[] = [
        {
            name: "",
            label: "ลำดับ",
            options: {
                filter: false,
                sort: false,
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: (_value, tableMeta) => tableMeta.rowIndex + 1,
            },
        },
        {
            name: "caseNo",
            label: "ClaimCase",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "medicalTypeCode",
            label: "ประเภทการรักษา",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "left" }) },
        },
        {
            name: "lastestChiefComplaint",
            label: "อาการสำคัญ",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "left" }) },
        },
        {
            name: "admissionDate",
            label: "วันที่เข้ารักษา",
            options: {
                ...cellAlignOptions({ align: "center", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value) => formatDateString(value, "DD/MM/BBBB"),
            },
        },
        {
            name: "paymentStatusName",
            label: "สถานะ",
            options: {
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: (value, tableMeta) => {
                    const item = caseData?.data?.[tableMeta.rowIndex];

                    return (
                        <Chip
                            label={value}
                            size="small"
                            sx={{
                                backgroundColor:
                                    backgroundColorMapPaymentStatus[item?.paymentStatusId ?? 0] ?? "#f5f5f5",
                                color: colorMapPaymentStatus[item?.paymentStatusId ?? 0] ?? "#616161",
                                fontWeight: 600,
                                fontSize: 13,
                            }}
                        />
                    );
                },
            },
        },
        {
            name: "caseAmount",
            label: "ยอดเบิก",
            options: {
                ...cellAlignOptions({ align: "right", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value) => Number(value).toLocaleString("th-TH", { minimumFractionDigits: 2 }),
            },
        },
        {
            name: "casePaidAmount",
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
                                        {data?.claimNo}
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
                                        {data?.icD10DescriptionTH ?? "-"}
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
                                        {data?.totalNetPaidAmount?.toLocaleString("th-TH", {
                                            minimumFractionDigits: 2,
                                        }) ?? "0.00"}
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
                                        {data?.remainingCoverageLimit?.toLocaleString("th-TH", {
                                            minimumFractionDigits: 2,
                                        })}
                                    </Typography>
                                </Box>

                                <Divider flexItem sx={{ width: "100%" }} />

                                <Box sx={{ textAlign: "center" }}>
                                    <Typography variant="body2" color="text.secondary">
                                        คงเหลือหลังหักเคลมเดิม
                                    </Typography>
                                    <Typography color="#2e7d32" fontWeight={700} fontSize={18}>
                                        {data?.remainingAmountAfterPreviousClaim?.toLocaleString("th-TH", {
                                            minimumFractionDigits: 2,
                                        })}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
                <StandardDataTable
                    name="OldClaimCaseTable"
                    title=""
                    data={caseData?.data ?? []}
                    isLoading={caseDataisLoading}
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
