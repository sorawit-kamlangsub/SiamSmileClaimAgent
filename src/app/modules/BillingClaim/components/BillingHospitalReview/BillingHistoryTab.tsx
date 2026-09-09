import { Box, Chip, Grid, IconButton, Tooltip, Typography } from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { MUIDataTableColumn } from "mui-datatables";
import CustomPaper from "../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../_common/components/CustomComponent/HeadingWithColor";
import { StandardDataTable } from "../../../_common";
import { cellAlignOptions, defaultOptionStandardDataTable, formatDateString } from "../../../../functionHelpers";
import useBillingHistoryHook from "../../hooks/BillingHospitalReview/BillingHistoryHook";
import {
    backgroundColorMapBillingStatus,
    billingReturnStatusLabel,
    billingStatusLabel,
    colorMapBillingStatus,
} from "../../store/billingStatusHelpers";

type BillingHistoryTabProps = {
    /** billingDetailId ของรายการที่กำลังเปิดดูอยู่ (ไม่ใช่ url ที่เลือกดูรอบอื่นใน tab นี้) */
    currentBillingDetailId: string;
};

/**
 * Tab "ประวัติทำรายการ" — GET /billing/hospital/{id}/history
 *
 * `rounds` = ทุกรอบวางบิลของ Case เดิม (คลิกเพื่อดูรอบอื่น), `revisions` = ผลตรวจย้อนหลังเฉพาะรอบที่เลือก
 * `snapshot` ในแต่ละ revision ใช้แสดงย้อนหลังอย่างเดียว ไม่เอายอด/ชื่อจาก live detail มาแทน
 */
const BillingHistoryTab = ({ currentBillingDetailId }: BillingHistoryTabProps) => {
    const { rounds, revisions, isLoading, selectedRoundId, setSelectedRoundId, isViewingCurrentRound } =
        useBillingHistoryHook(currentBillingDetailId);

    const roundColumns: MUIDataTableColumn[] = [
        {
            name: "submittedDate",
            label: "วันที่ส่งวางบิล",
            options: {
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: (value) => (value ? formatDateString(value.toString(), "DD/MM/BBBB HH:mm") : "-"),
            },
        },
        {
            name: "externalBillingId",
            label: "เลขที่อ้างอิงจาก SmileConnect",
            options: { ...cellAlignOptions({ align: "left" }), customBodyRender: (value) => value ?? "-" },
        },
        {
            name: "statusId",
            label: "สถานะ",
            options: {
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: (value: number) => (
                    <Chip
                        label={billingStatusLabel(value)}
                        size="small"
                        sx={{
                            backgroundColor: backgroundColorMapBillingStatus[value as 1 | 2 | 3 | 4 | 5],
                            color: colorMapBillingStatus[value as 1 | 2 | 3 | 4 | 5],
                            fontWeight: 600,
                            borderRadius: "16px",
                        }}
                    />
                ),
            },
        },
        {
            name: "_view",
            label: " ",
            options: {
                sort: false,
                ...cellAlignOptions({ align: "center" }),
                customBodyRenderLite: (rowIndex) => {
                    const row = rounds[rowIndex];
                    const isSelected = row.billingDetailId === selectedRoundId;
                    return (
                        <Tooltip title={isSelected ? "กำลังดูรอบนี้" : "ดูรอบนี้"}>
                            <IconButton
                                size="small"
                                disabled={isSelected}
                                onClick={() => row.billingDetailId && setSelectedRoundId(row.billingDetailId)}
                                sx={{ bgcolor: isSelected ? "#E3F2FD" : "#E2F2FF" }}
                            >
                                <VisibilityIcon color="primary" fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    );
                },
            },
        },
    ];

    const revisionColumns: MUIDataTableColumn[] = [
        { name: "version", label: "เวอร์ชัน", options: cellAlignOptions({ align: "center" }) },
        {
            name: "previousStatusId",
            label: "จากสถานะ",
            options: {
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: (value: number) => billingStatusLabel(value),
            },
        },
        {
            name: "statusId",
            label: "เป็นสถานะ",
            options: {
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: (value: number) => (
                    <Chip
                        label={billingStatusLabel(value)}
                        size="small"
                        sx={{
                            backgroundColor: backgroundColorMapBillingStatus[value as 1 | 2 | 3 | 4 | 5],
                            color: colorMapBillingStatus[value as 1 | 2 | 3 | 4 | 5],
                            fontWeight: 600,
                            borderRadius: "16px",
                        }}
                    />
                ),
            },
        },
        {
            name: "reviewedDate",
            label: "วันที่ตรวจสอบ",
            options: {
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: (value) => (value ? formatDateString(value.toString(), "DD/MM/BBBB HH:mm") : "-"),
            },
        },
        {
            // API คืนแค่ user id ไม่คืนชื่อ — แสดง id ไปก่อน (hospital-billing-fe.md ข้อ 8)
            name: "reviewedByUserId",
            label: "ผู้ตรวจสอบ (User ID)",
            options: cellAlignOptions({ align: "center" }),
        },
        {
            name: "returnStatus",
            label: "สถานะการส่งกลับ",
            options: {
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: (value) => billingReturnStatusLabel(value),
            },
        },
    ];

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <CustomPaper>
                    <HeadingWithColor icon={<HistoryIcon sx={{ fontSize: 27 }} />} text="รอบวางบิล" color="blue" />
                    {!isViewingCurrentRound && (
                        <Typography variant="body2" sx={{ mb: 1.5, color: "text.secondary" }}>
                            กำลังดูประวัติของรอบอื่น — ผลตรวจสอบด้านล่างเป็นของรอบที่เลือกไว้
                        </Typography>
                    )}
                    <StandardDataTable
                        name="billingHistoryRounds"
                        title=""
                        data={rounds}
                        columns={roundColumns}
                        isLoading={isLoading}
                        color="primary"
                        columnHeaderAlign="center"
                        displayToolbar={false}
                        displayFooter={false}
                        options={defaultOptionStandardDataTable}
                    />
                </CustomPaper>
            </Grid>
            <Grid item xs={12}>
                <CustomPaper>
                    <HeadingWithColor text="ผลตรวจสอบของรอบที่เลือก" color="green" />
                    <Box>
                        <StandardDataTable
                            name="billingHistoryRevisions"
                            title=""
                            data={revisions}
                            columns={revisionColumns}
                            isLoading={isLoading}
                            color="primary"
                            columnHeaderAlign="center"
                            displayToolbar={false}
                            displayFooter={false}
                            options={defaultOptionStandardDataTable}
                        />
                    </Box>
                </CustomPaper>
            </Grid>
        </Grid>
    );
};

export default BillingHistoryTab;
