import React, { useMemo, useState } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import dayjs from "dayjs";
import LinkIcon from "@mui/icons-material/Link";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import { MUIDataTableColumn } from "mui-datatables";
import LinearLoading from "../../_common/components/CustomComponent/LinearLoading";
import { StandardDataTable } from "../../_common";
import { GetClaimContinueDtoResponse } from "../../../api/coreClaimApi.client";
import useContinuousClaimTable from "../hooks/useContinuousClaimTable";
import { cellAlignOptions, formatDateString, numberWithCommas, smallSizeFooter } from "../../../functionHelpers";

export type ContinuousClaimSelection = {
    claimId?: string;
    claimNo?: string;
    incidentDate?: string;
    admissionDate?: string;
    chiefComplaint?: string;
    claimDetail?: string;
    icD10Detail?: string;
    remainAmount?: number;
    totalCaseAmount?: number;
    totalPaidAmount?: number;
};

type Props = {
    open: boolean;
    applicationId?: string;
    onClose: () => void;
    onConfirm: (claim: ContinuousClaimSelection) => void;
};

const HEADER_BG = "#1a5da8";

const stepBoxSx = {
    p: 2,
    mb: 2,
    mt: 3,
    borderRadius: 2,
    border: "1px solid",
    borderColor: "divider",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
};

const InfoBox: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <Box sx={{ bgcolor: "#f5f7fa", borderRadius: 2, p: 1.5, height: "100%" }}>
        <Typography variant="caption" color="text.secondary" display="block">
            {label}
        </Typography>
        <Typography variant="body2" fontWeight={700} color={HEADER_BG}>
            {value}
        </Typography>
    </Box>
);

const SectionTitle: React.FC<{ icon: React.ReactNode; title: string; subtitle?: string }> = ({
    icon,
    title,
    subtitle,
}) => (
    <Box display="flex" alignItems="center" gap={1.25} mb={2}>
        <Box
            sx={{
                width: 38,
                height: 38,
                borderRadius: "12px",
                bgcolor: "#eaf5ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
            }}
        >
            {icon}
        </Box>
        <Box>
            <Typography fontWeight={700} color={HEADER_BG} lineHeight={1.3}>
                {title}
            </Typography>
            {subtitle && (
                <Typography variant="caption" color="text.secondary">
                    {subtitle}
                </Typography>
            )}
        </Box>
    </Box>
);

const ContinuousClaimDialog: React.FC<Props> = ({ open, applicationId, onClose, onConfirm }) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

    const { claimContinueData, pagination, claimContinueLoading, setPaginated } =
        useContinuousClaimTable(applicationId);

    const [selectedClaimId, setSelectedClaimId] = useState<string | undefined>(undefined);

    const rows: GetClaimContinueDtoResponse[] = claimContinueData?.data ?? [];
    const isLoading = claimContinueLoading;

    const selectedRow = useMemo(() => rows.find((r) => r.claimId === selectedClaimId), [rows, selectedClaimId]);

    const columns: MUIDataTableColumn[] = [
        {
            name: "claimId",
            label: "เลือก",
            options: {
                filter: false,
                sort: false,
                ...cellAlignOptions(),
                customBodyRender: (value: string) => {
                    const isSelected = value === selectedClaimId;
                    return (
                        <Button
                            size="small"
                            variant="contained"
                            onClick={() => setSelectedClaimId(value)}
                            sx={{
                                bgcolor: isSelected ? "#0e2c4e" : HEADER_BG,
                                textTransform: "none",
                                "&:hover": { bgcolor: isSelected ? "#0e2c4e" : "#154a8a" },
                            }}
                        >
                            เลือก
                        </Button>
                    );
                },
            },
        },
        {
            name: "claimNo",
            label: "ClaimNo",
            options: {
                filter: false,
                sort: false,
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: (value: string) => (
                    <Typography variant="body2" fontWeight={700} color={HEADER_BG}>
                        {value ?? "-"}
                    </Typography>
                ),
            },
        },
        {
            name: "chiefComplaint",
            label: "อาการสำคัญ (ChiefComplain)",
            options: {
                filter: false,
                sort: false,
                ...cellAlignOptions({ align: "left" }),
                customBodyRender: (value, tableMeta) => {
                    const row = rows[tableMeta.rowIndex];
                    return value ?? row?.chiefComplaintCustom ?? "-";
                },
            },
        },
        {
            name: "incidentDate",
            label: "วันที่เกิดเหตุ",
            options: {
                ...cellAlignOptions({ align: "center", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value) => (value ? formatDateString(value?.toString(), "DD/MM/BBBB") : "-"),
            },
        },
        {
            name: "totalCaseAmount",
            label: "ยอดเบิกรวม",
            options: {
                ...cellAlignOptions({ align: "right", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value?: number) => (value !== undefined ? numberWithCommas(value) : "-"),
            },
        },
        {
            name: "totalPaidAmount",
            label: "ยอดจ่ายรวม",
            options: {
                ...cellAlignOptions({ align: "right", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value?: number) => (value !== undefined ? numberWithCommas(value) : "-"),
            },
        },
    ];

    const handleConfirm = () => {
        if (!selectedRow) return;
        onConfirm({
            claimId: selectedRow.claimId,
            claimNo: selectedRow.claimNo,
            incidentDate: selectedRow.incidentDate ? dayjs(selectedRow.incidentDate).toISOString() : undefined,
            admissionDate: selectedRow.admissionDate ? dayjs(selectedRow.admissionDate).toISOString() : undefined,
            chiefComplaint: selectedRow.chiefComplaint ?? selectedRow.chiefComplaintCustom,
            claimDetail: selectedRow.claimDetail,
            icD10Detail: selectedRow.icD10Detail,
            remainAmount: selectedRow.remainAmount,
            totalCaseAmount: selectedRow.totalCaseAmount,
            totalPaidAmount: selectedRow.totalPaidAmount,
        });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth fullScreen={fullScreen}>
            <DialogTitle sx={{ pb: 1 }}>
                <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <Box
                            sx={{
                                width: 36,
                                height: 36,
                                borderRadius: "10px",
                                bgcolor: "#eaf5ff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <LinkIcon sx={{ color: HEADER_BG }} />
                        </Box>
                        <Box>
                            <Typography variant="h6" fontWeight={700}>
                                เลือกเคลมต่อเนื่อง
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                เลือกเคลมเดิมเพื่ออ้างอิงวงเงินคงเหลือและประวัติการรักษา
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton
                        onClick={onClose}
                        size="small"
                        sx={{
                            border: "1px solid",
                            borderColor: "error.main",
                            color: "error.main",
                            ":hover": { bgcolor: "#ffeaea" },
                        }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        bgcolor: "#eaf5ff",
                        borderRadius: 2,
                        px: 2,
                        py: 1.25,
                        my: 1,
                        mb: 1.5,
                    }}
                >
                    <InfoOutlinedIcon fontSize="small" sx={{ color: HEADER_BG }} />
                    <Typography variant="body2" color={HEADER_BG}>
                        เลือกรายการที่ต้องการผูกเป็นเคลมต่อเนื่อง แล้วกดยืนยันการเลือก
                    </Typography>
                </Box>

                <LinearLoading isLoading={isLoading}>
                    <StandardDataTable
                        name="continuous-claim-table"
                        title=""
                        data={rows}
                        isLoading={isLoading}
                        columns={columns}
                        color="primary"
                        columnHeaderAlign="center"
                        setPaginated={setPaginated}
                        paginated={pagination}
                        displayToolbar={false}
                        sx={smallSizeFooter}
                        options={{
                            setTableProps: () => ({ size: "small" }),
                            selectableRows: "none",
                            setRowProps: (_row, dataIndex) => ({
                                style: {
                                    backgroundColor:
                                        rows[dataIndex]?.claimId === selectedClaimId ? "#eaf5ff" : undefined,
                                },
                            }),
                        }}
                    />
                </LinearLoading>

                {/* รายการที่เลือก */}
                {selectedRow && (
                    <Box sx={stepBoxSx}>
                        <SectionTitle
                            icon={<TaskAltIcon sx={{ fontSize: 24, color: HEADER_BG }} />}
                            title="รายการที่เลือก"
                            subtitle="รายการที่เลือกเพื่อผูกเป็นเคลมต่อเนื่อง"
                        />
                        <Grid container spacing={1.5}>
                            <Grid item xs={12} sm={8}>
                                <Grid container spacing={1.5}>
                                    <Grid item xs={12} sm={4}>
                                        <InfoBox label="ClaimNo :" value={selectedRow.claimNo ?? "-"} />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <InfoBox
                                            label="วันที่เข้า รพ. :"
                                            value={
                                                selectedRow.admissionDate
                                                    ? dayjs(selectedRow.admissionDate).format("DD/MM/BBBB")
                                                    : "-"
                                            }
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <InfoBox label="ข้อมูลเคลม :" value={selectedRow.claimDetail ?? "-"} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <InfoBox
                                            label="การวินิจฉัย1 (Diagnosis1) :"
                                            value={selectedRow.icD10Detail ?? "-"}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Box
                                    sx={{
                                        bgcolor: "#fff8e1",
                                        border: "1px solid #ffe082",
                                        borderRadius: 2,
                                        p: 2,
                                        height: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Typography variant="body2" color="text.secondary">
                                        วงเงินคงเหลือ :
                                    </Typography>
                                    <Typography variant="h6" fontWeight={700} color="#2e7d32">
                                        {selectedRow.remainAmount !== undefined
                                            ? numberWithCommas(selectedRow.remainAmount)
                                            : "-"}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                )}

                <Box display="flex" justifyContent="center" mt={3} mb={1}>
                    <Button
                        variant="contained"
                        size="large"
                        disabled={!selectedRow}
                        onClick={handleConfirm}
                        sx={{
                            bgcolor: HEADER_BG,
                            textTransform: "none",
                            fontWeight: 700,
                            px: 4,
                            "&:hover": { bgcolor: "#154a8a" },
                        }}
                    >
                        ยืนยันการเลือก
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default ContinuousClaimDialog;
