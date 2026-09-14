import {
    Box,
    Button,
    Chip,
    FormControl,
    Grid,
    InputAdornment,
    MenuItem,
    Select,
    TextField,
    Typography,
} from "@mui/material";
import { MUIDataTableColumn } from "mui-datatables";
import { useNavigate } from "react-router-dom";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SearchIcon from "@mui/icons-material/Search";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import InsightsIcon from "@mui/icons-material/Insights";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LaunchIcon from "@mui/icons-material/Launch";
import HistoryToggleOffIcon from "@mui/icons-material/HistoryToggleOff";
import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import LoadingOverlay from "../../../../_common/components/CustomComponent/LoadingOverlay";
import { StandardDataTable } from "../../../../_common";
import CardClaimInfo from "../../_common/CardClaimInfo";
import useClaimHistoryTab, { CLAIM_HISTORY_SORT_OPTIONS } from "../../../hooks/ClaimConsiderDetail/useClaimHistoryTab";
import { GetClaimHistoryDtoResponse } from "../../../../../api/coreClaimApi.client";
import {
    backgroundColorMapClaimStatus,
    cellAlignOptions,
    colorMapClaimStatus,
    formatDateString,
} from "../../../../../functionHelpers";

const fmtBaht = (v: number) => v.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type ClaimHistoryTabProps = {
    /** applicationId (policyCode) ของผู้เอาประกันของเคสที่กำลังพิจารณาอยู่ — ใช้ยิง useGetClaimHistory */
    applicationId?: string;
};

const ClaimHistoryTab = ({ applicationId }: ClaimHistoryTabProps) => {
    const navigate = useNavigate();
    const { items, summary, isLoading, searchText, setSearchText, sortBy, setSortBy, pagination, setPaginated } =
        useClaimHistoryTab(applicationId);

    const columns: MUIDataTableColumn[] = [
        {
            name: "claimNo",
            label: "เลขที่เคลม",
            options: {
                ...cellAlignOptions({ align: "center", cellWhiteSpace: "nowrap" }),
                customBodyRender: (_value, tableMeta) => {
                    // TODO(caseId): GetClaimHistoryDtoResponse ยังไม่มี caseId จาก BE — cast ไว้ก่อน
                    // route customers/:id/:caseId ต้องการ :caseId (btoa) คู่กับ :id เพื่อยิง useGetClaimDetailConsider
                    const item = items[tableMeta.rowIndex] as GetClaimHistoryDtoResponse & { caseId?: string };
                    return (
                        <Button
                            variant="outlined"
                            size="small"
                            endIcon={<LaunchIcon fontSize="small" />}
                            onClick={() =>
                                navigate(
                                    `/consider/monitor/customers/${btoa(item.claimId ?? "")}/${btoa(item.caseId ?? "")}`
                                )
                            }
                            sx={{ borderRadius: 5, textTransform: "none" }}
                        >
                            {item.claimNo}
                        </Button>
                    );
                },
            },
        },
        {
            name: "displayClaimNature",
            label: "ลักษณะการเคลม",
            options: {
                ...cellAlignOptions({ align: "left", cellWhiteSpace: "nowrap" }),
                customBodyRender: () => "-",
            },
        },
        {
            name: "hospitalName",
            label: "ชื่อสถานพยาบาล",
            options: { ...cellAlignOptions({ align: "left", cellWhiteSpace: "nowrap" }) },
        },
        {
            name: "lastestChiefComplaint",
            label: "ChiefComplaint",
            options: {
                ...cellAlignOptions({ align: "left", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value?: string) => value ?? "-",
            },
        },
        {
            name: "icD10Detail",
            label: "คำวินิจฉัย1 (Diagnosis1)",
            options: {
                ...cellAlignOptions({ align: "left", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value?: string) => value ?? "-",
            },
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
            name: "isEnableClaimContinue",
            label: "เป็นเคลมต่อเนื่อง",
            options: {
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: (value?: boolean) =>
                    value ? <CheckCircleIcon color="success" fontSize="small" /> : "-",
            },
        },
        {
            name: "claimStatusName",
            label: "สถานะเคลม",
            options: {
                ...cellAlignOptions({ align: "center" }),
                customBodyRenderLite: (rowIndex) => {
                    const row = items[rowIndex];
                    const value = row?.claimStatusName;
                    if (!value) return "-";
                    const bgColor = row?.claimStatusId ? backgroundColorMapClaimStatus[row?.claimStatusId] : undefined;
                    const textColor = row?.claimStatusId ? colorMapClaimStatus[row?.claimStatusId] : undefined;
                    return (
                        <Chip
                            label={value}
                            size="small"
                            sx={{
                                backgroundColor: bgColor,
                                color: textColor,
                                fontWeight: 700,
                                borderRadius: "16px",
                            }}
                        />
                    );
                },
            },
        },
        {
            name: "totalCaseAmount",
            label: "ยอดเบิก",
            options: {
                ...cellAlignOptions({ align: "right", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value?: number) => fmtBaht(value ?? 0),
            },
        },
        {
            name: "paidAmount",
            label: "จ่ายจริง",
            options: {
                ...cellAlignOptions({ align: "right", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value?: number) => fmtBaht(value ?? 0),
            },
        },
        {
            // BE ยังไม่ส่งครั้งที่ OPD มาให้ที่ endpoint นี้ — ใช้ค่าคงที่ไปก่อน
            name: "opdCount",
            label: "ครั้งที่ OPD",
            options: {
                ...cellAlignOptions({ align: "center", cellWhiteSpace: "nowrap" }),
                customBodyRender: () => "2569/1",
            },
        },
    ];

    return (
        <CustomPaper>
            <HeadingWithColor icon={<AssignmentIcon sx={{ fontSize: 27 }} />} text="ประวัติการเคลม" color="blue" />
            <Grid container spacing={2} sx={{ mb: 2.5 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <CardClaimInfo
                        icon={<HistoryToggleOffIcon />}
                        label="จำนวนรายการ"
                        value={`${summary.totalCount} รายการ`}
                        iconColor="#1a5da8"
                        iconBgColor="#e8f0fb"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <CardClaimInfo
                        icon={<EventAvailableIcon />}
                        label="OPD คงเหลือในปีกรมธรรม์"
                        value={`${summary.opdRemaining} ครั้ง`}
                        iconColor="#0B7FC7"
                        iconBgColor="#EAF5FF"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <CardClaimInfo
                        icon={<AutorenewIcon />}
                        label="เคลมต่อเนื่อง"
                        value={`${summary.continuousCount} รายการ`}
                        iconColor="#0F9D58"
                        iconBgColor="#E6F6EC"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <CardClaimInfo
                        icon={<InsightsIcon />}
                        label="ยอดเบิกปีกรมธรรม์ (สะสม)"
                        value={`${fmtBaht(summary.accumulatedClaimAmount)} บาท`}
                        iconColor="#7B61FF"
                        iconBgColor="#F1EEFF"
                    />
                </Grid>
            </Grid>

            <Box
                sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    gap: 1.5,
                    mb: 2,
                }}
            >
                <TextField
                    size="small"
                    fullWidth
                    placeholder="ค้นหาเลขที่เคลม / ชื่อสถานพยาบาล"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" color="action" />
                            </InputAdornment>
                        ),
                    }}
                />
                <FormControl size="small" sx={{ minWidth: { xs: "100%", md: 220 } }}>
                    <Select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}>
                        {CLAIM_HISTORY_SORT_OPTIONS.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                                จัดเรียง : {opt.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <LoadingOverlay isLoading={isLoading} minHeight={300}>
                {!isLoading && items.length === 0 ? (
                    <Box sx={{ py: 6, textAlign: "center" }}>
                        <HistoryToggleOffIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
                        <Typography color="text.disabled">ไม่พบประวัติการเคลม</Typography>
                    </Box>
                ) : (
                    <StandardDataTable
                        name="claimHistoryTable"
                        title=""
                        data={items}
                        isLoading={isLoading}
                        columns={columns}
                        color="primary"
                        columnHeaderAlign="center"
                        paginated={pagination}
                        setPaginated={setPaginated}
                        displayToolbar={false}
                    />
                )}
            </LoadingOverlay>
        </CustomPaper>
    );
};

export default ClaimHistoryTab;
