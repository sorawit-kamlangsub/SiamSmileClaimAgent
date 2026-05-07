import React from "react";
import { Box, Chip, Grid, IconButton, Tooltip, Typography } from "@mui/material";
import IndeterminateCheckBoxIcon from "@mui/icons-material/IndeterminateCheckBox";
import AddBoxIcon from "@mui/icons-material/AddBox";
import { MUIDataTableColumn } from "mui-datatables";
import { OldClaimInfo } from "../../../store/claimPHSlice";
import {
    cellAlignOptions,
    defaultOptionStandardDataTable,
    formatDateString,
    smallSizeFooter,
} from "../../../../../functionHelpers";
import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import { StandardDataTable } from "../../../../_common";

interface Props {
    data: OldClaimInfo;
    onToggleHidden: () => void;
}

const OldClaimSection: React.FC<Props> = ({ data, onToggleHidden }) => {
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
            label: "ลักษณะการเคลม",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "chiefComplain",
            label: "อาการสำคัญ",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "left" }) },
        },
        {
            name: "admitDate",
            label: "วันที่เข้า รพ.",
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
                            backgroundColor: value === "อนุมัติ" ? "#e8f5e9" : "#fff3e0",
                            color: value === "อนุมัติ" ? "#2e7d32" : "#e65100",
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
        <CustomPaper>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <HeadingWithColor text="ข้อมูลเคลมเดิม" color="blue" />
                <Tooltip title={data.isHidden ? "ยกเลิกการซ่อน" : "ซ่อน"}>
                    <IconButton size="small" color="primary" onClick={onToggleHidden}>
                        {data.isHidden ? (
                            <AddBoxIcon fontSize="small" />
                        ) : (
                            <IndeterminateCheckBoxIcon fontSize="small" />
                        )}
                    </IconButton>
                </Tooltip>
            </Box>

            {!data.isHidden && (
                <>
                    <Grid container spacing={1} mb={1}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="body2" color="text.secondary" component="span">
                                ClaimNo :{" "}
                            </Typography>
                            <Typography variant="body2" color="primary" fontWeight={700} component="span">
                                {data.claimNo}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="body2" color="text.secondary" component="span">
                                วันที่เกิดเหตุ :{" "}
                            </Typography>
                            <Typography variant="body2" color="primary" fontWeight={700} component="span">
                                {formatDateString(data.incidentDate, "DD/MM/BBBB")}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={12} md={6}>
                            <Typography variant="body2" color="text.secondary" component="span">
                                Diagnosis :{" "}
                            </Typography>
                            <Typography variant="body2" color="primary" fontWeight={700} component="span">
                                {data.diagnosis}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="body2" color="text.secondary" component="span">
                                ยอดเบิกรวม :{" "}
                            </Typography>
                            <Typography variant="body2" color="error" fontWeight={700} component="span">
                                {data.totalClaim.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="body2" color="text.secondary" component="span">
                                ยอดจ่ายรวม :{" "}
                            </Typography>
                            <Typography variant="body2" color="primary" fontWeight={700} component="span">
                                {data.totalPaid.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="body2" color="text.secondary" component="span">
                                วงเงินคงเหลือ :{" "}
                            </Typography>
                            <Typography variant="body2" color="primary" fontWeight={700} component="span">
                                {data.remainingBudget.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="body2" color="text.secondary" component="span">
                                จำนวนครั้งคงเหลือ :{" "}
                            </Typography>
                            <Typography variant="body2" color="primary" fontWeight={700} component="span">
                                {data.remainingCount}
                            </Typography>
                        </Grid>
                    </Grid>

                    <StandardDataTable
                        name="OldClaimCaseTable"
                        title=""
                        data={data.cases}
                        isLoading={false}
                        columns={columns}
                        color="primary"
                        columnHeaderAlign="center"
                        displayToolbar={false}
                        options={{ ...defaultOptionStandardDataTable }}
                        sx={smallSizeFooter}
                    />
                </>
            )}
        </CustomPaper>
    );
};

export default OldClaimSection;
