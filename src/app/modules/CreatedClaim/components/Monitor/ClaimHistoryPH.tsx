import React from "react";
import { Box, Button, Grid, Link } from "@mui/material";
import AddCommentIcon from "@mui/icons-material/AddComment";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { MUIDataTableColumn } from "mui-datatables";
import {
    cellAlignOptions,
    defaultOptionStandardDataTable,
    formatDateString,
    smallSizeFooter,
} from "../../../../functionHelpers";
import { StandardDataTable } from "../../../_common";
import LinearLoading from "../../../_common/components/CustomComponent/LinearLoading";
import { useMonitorClaimHistory } from "../../hooks/Monitor/useMonitorClaimHistory";
import { ClaimHistoryItem } from "../../store/monitorSlice";
import { HeadingWithColor } from "../../../_common/components/CustomComponent/HeadingWithColor";
import CustomPaper from "../../../_common/components/CustomComponent/CustomPaper";
import { CustomTypographyWithOutGrid } from "../../../_common/components/CustomComponent/CustomTypographyWithOutGrid";

const ClaimHistoryPH: React.FC = () => {
    const { selectedPolicy, claimHistory, isLoading, paginated, setPaginated, handleContinuousClaim, handleNewClaim } =
        useMonitorClaimHistory();

    if (!selectedPolicy) return null;

    const columns: MUIDataTableColumn[] = [
        {
            name: "claimNo",
            label: "ClaimNo",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "chiefComplain",
            label: "อาการสำคัญ(ChiefComplain)",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "left" }) },
        },
        {
            name: "incidentDate",
            label: "วันที่เกิดเหตุ",
            options: {
                ...cellAlignOptions({ align: "center", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value) => formatDateString(value?.toString(), "DD/MM/BBBB"),
            },
        },
        {
            name: "totalClaim",
            label: "ยอดเบิกรวม",
            options: {
                ...cellAlignOptions({ align: "right", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value) => Number(value).toLocaleString("th-TH", { minimumFractionDigits: 2 }),
            },
        },
        {
            name: "totalPaid",
            label: "ยอดจ่ายรวม",
            options: {
                ...cellAlignOptions({ align: "right", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value) => Number(value).toLocaleString("th-TH", { minimumFractionDigits: 2 }),
            },
        },
        {
            name: "",
            label: "",
            options: {
                ...cellAlignOptions({ align: "center", cellWhiteSpace: "nowrap" }),
                customBodyRender: (_value, tableMeta) => {
                    const item: ClaimHistoryItem = claimHistory[tableMeta.rowIndex];
                    return (
                        <Button
                            variant="contained"
                            size="small"
                            color="primary"
                            startIcon={<AddCommentIcon />}
                            onClick={() => handleContinuousClaim(item)}
                            sx={{ whiteSpace: "nowrap" }}
                        >
                            แจ้งเคลมต่อเนื่อง
                        </Button>
                    );
                },
            },
        },
    ];

    return (
        <>
            <CustomPaper>
                <HeadingWithColor text="ข้อมูลกรมธรรม์" color="blue" />
                <Grid container spacing={2} alignItems="center" ml={1.5}>
                    <Grid item xs={12} md={6} lg={4}>
                        <CustomTypographyWithOutGrid
                            label="ApplicationID"
                            value={
                                <Link
                                    href={`/checkeligible/detail/${btoa(selectedPolicy.appId)}/${btoa(
                                        selectedPolicy.appId
                                    )}`}
                                    target="_blank"
                                    fontWeight={700}
                                    fontSize={16}
                                >
                                    {selectedPolicy.appId}
                                </Link>
                            }
                        />
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                        <CustomTypographyWithOutGrid label="ชื่อผู้เอาประกัน" value={selectedPolicy.customerName} />
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                        <CustomTypographyWithOutGrid label="เลขบัตรประชาชน" value={selectedPolicy.nationalId} />
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                        <CustomTypographyWithOutGrid label="ผลิตภัณฑ์" value={selectedPolicy.productName} />
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                        <CustomTypographyWithOutGrid
                            label="วันที่เริ่มคุ้มครอง"
                            value={formatDateString(selectedPolicy.startCoverDate, "DD/MM/BBBB")}
                        />
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                        <CustomTypographyWithOutGrid
                            label="วันที่สิ้นสุดความคุ้มครอง"
                            value={
                                selectedPolicy.endCoverDate
                                    ? formatDateString(selectedPolicy.endCoverDate, "DD/MM/BBBB")
                                    : undefined
                            }
                        />
                    </Grid>
                </Grid>
            </CustomPaper>
            <CustomPaper>
                <HeadingWithColor text="ประวัติการเคลม" color="blue" />
                <LinearLoading isLoading={isLoading}>
                    <StandardDataTable
                        name="ClaimHistoryPHTable"
                        title=""
                        data={claimHistory || []}
                        isLoading={isLoading}
                        columns={columns}
                        color="primary"
                        columnHeaderAlign="center"
                        setPaginated={setPaginated}
                        paginated={paginated}
                        displayToolbar={false}
                        options={{
                            ...defaultOptionStandardDataTable,
                            textLabels: { body: { noMatch: "ไม่พบข้อมูล" } },
                        }}
                        sx={smallSizeFooter}
                    />
                </LinearLoading>
                <Box display="flex" justifyContent="flex-end" mt={2}>
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<AddCircleIcon />}
                        onClick={() => handleNewClaim(2)}
                        sx={{ height: "33px" }}
                    >
                        แจ้งเคลมใหม่
                    </Button>
                </Box>
            </CustomPaper>
        </>
    );
};

export default ClaimHistoryPH;
