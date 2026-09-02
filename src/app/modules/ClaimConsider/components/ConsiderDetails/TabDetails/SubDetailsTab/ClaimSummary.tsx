import { MUIDataTableColumn } from "mui-datatables";
import { Box, Chip, Grid, IconButton, Tooltip, Typography } from "@mui/material";
import { Visibility } from "@mui/icons-material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import BedIcon from "@mui/icons-material/Bed";
import CustomPaper from "../../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../../_common/components/CustomComponent/HeadingWithColor";
import { StandardDataTable } from "../../../../../_common";
import { CaseDocumentV2Request } from "../../../../../../api/coreClaimApi.client";
import { DOC_STORAGE_URL } from "../../../../../../../Const";
import { useAppSelector } from "../../../../../../../redux";
import {
    cellAlignOptions,
    handleClickLink,
    defaultOptionStandardDataTable,
    formatDateString,
} from "../../../../../../functionHelpers";
import { claimPHSelector } from "../../../../../CreatedClaim/store/claimPHSlice";
import { useFormikContext } from "formik";
import { ClaimConsiderValues } from "../../../../store/claimConsiderSlice";
import { CustomDisplayText } from "../../../../../_common/components/CustomComponent/CustomDisplayText";
import dayjs, { Dayjs } from "dayjs";

type ClaimSummaryProps = {
    attachedDocuments: CaseDocumentV2Request[];
    createdClaimDate: Dayjs | undefined;
};
const formatDate = (date: Dayjs | undefined) => formatDateString(date?.toString(), "DD/MM/BBBB") ?? undefined;

const formatTime = (date: Dayjs | undefined) =>
    date && dayjs(date).isValid() ? dayjs(date).format("HH:mm") : undefined;
const formatDiagnosis = (d?: { icd10Id?: number; icd10Detail?: string }) =>
    d?.icd10Id !== undefined ? d.icd10Detail ?? "-" : undefined;
// กล่องสรุปจำนวนวัน 1 กล่อง — สีคาดซ้ายและสีตัวเลขปรับตาม type

type StayDayBoxProps = {
    label: string;
    value: number;
    borderColor: string;
    valueColor: string;
};

const StayDayBox = ({ label, value, borderColor, valueColor }: StayDayBoxProps) => (
    <Grid item xs={12} md={4}>
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                minHeight: 60,
                px: 1.5,
                py: 1,
                border: "1px solid",
                borderColor,
                borderRadius: 2,
                bgcolor: "#fff",
            }}
        >
            <Typography
                variant="body2"
                sx={{
                    color: "#344054",
                    fontWeight: 500,
                }}
            >
                {label}
            </Typography>

            <Typography
                variant="body2"
                sx={{
                    fontWeight: 600,
                    color: valueColor,
                    whiteSpace: "nowrap",
                }}
            >
                {value} วัน
            </Typography>
        </Box>
    </Grid>
);
const ClaimSummary = ({ attachedDocuments, createdClaimDate }: ClaimSummaryProps) => {
    const { documentScanList, documentDetailById } = useAppSelector(claimPHSelector);
    const { values } = useFormikContext<ClaimConsiderValues>();
    const [diagnosis1, diagnosis2, diagnosis3] = values.diagnoses ?? [];
    // เอาเฉพาะเอกสารที่ user แนบจริง (attachedDocuments) มาต่อกับรายละเอียดที่เก็บไว้ใน redux
    const rows = attachedDocuments
        .map((attached) => {
            const scanInfo = documentScanList.find((d) => d.documentId === attached.documentId);
            const detail = documentDetailById[attached.documentId ?? ""];

            if (!scanInfo) return null;

            return {
                documentId: scanInfo.documentId,
                documentCode: scanInfo.documentCode,
                documentSubTypeName: scanInfo.documentSubTypeName,
                fileCount: detail?.docDetail?.fileCount ?? 0,
            };
        })
        .filter((row): row is NonNullable<typeof row> => row !== null);

    const columns: MUIDataTableColumn[] = [
        {
            name: "documentCode",
            label: "รหัสเอกสาร",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "documentSubTypeName",
            label: "ประเภทเอกสาร",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "fileCount",
            label: "จำนวนเอกสาร",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "documentId",
            label: "รายละเอียด",
            options: {
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: (value) => (
                    <Grid container alignItems="center" justifyContent="center">
                        <Tooltip title="ดูรายละเอียด" arrow placement="top" enterDelay={100} leaveDelay={50}>
                            <IconButton
                                aria-label="preview"
                                size="small"
                                sx={{ backgroundColor: "#E2F2FF" }}
                                onClick={() => {
                                    const url = `${DOC_STORAGE_URL}/document/${value}/preview`;
                                    handleClickLink(url);
                                }}
                            >
                                <Visibility color="primary" />
                            </IconButton>
                        </Tooltip>
                    </Grid>
                ),
            },
        },
    ];

    return (
        <CustomPaper>
            <HeadingWithColor icon={<ReceiptLongIcon sx={{ fontSize: 27 }} />} text="สรุปรายการเคลม" color="blue" />
            <Grid container spacing={2} p={2}>
                <CustomDisplayText label="เหตุของการเคลม" value={values.incidentTypeName} />
                <CustomDisplayText label="ประเภทความคุ้มครอง" value={values.coverageTypeName} />
                <CustomDisplayText label="ประเภทการรักษา" value={values.medicalTypeName} />
                <CustomDisplayText label="วันที่แจ้งเคลม" value={formatDate(createdClaimDate)} />
                <CustomDisplayText label="วันที่เกิดเหตุ" value={formatDate(values.incidentDate)} />

                <CustomDisplayText label="เวลาที่เกิดเหตุ" value={formatTime(values.incidentTime)} />
                <CustomDisplayText label="วันที่เข้า รพ." value={formatDate(values.admissionDate)} />
                <CustomDisplayText label="เวลาที่เข้า รพ." value={formatTime(values.admissionTime)} />
                <CustomDisplayText label="วันที่ออก รพ." value={formatDate(values.dischargeDate)} />
                <CustomDisplayText label="เวลาที่ออก รพ." value={formatTime(values.dischargeTime)} />
                <CustomDisplayText label="อาการสำคัญ" value={values.chiefComplaintId_selectedText} xs={12} md={6} />

                <CustomDisplayText label="สถานพยาบาล" value={values.hospitalName} xs={12} md={12} />
                <CustomDisplayText label="คำวินิจฉัย 1" value={formatDiagnosis(diagnosis1)} xs={12} md={12} />
                <CustomDisplayText label="คำวินิจฉัย 2" value={formatDiagnosis(diagnosis2)} xs={12} md={12} />
                <CustomDisplayText label="คำวินิจฉัย 3" value={formatDiagnosis(diagnosis3)} xs={12} md={12} />
                <CustomDisplayText label="หมายเหตุ" value={values.detail ?? "-"} xs={12} md={12} />
            </Grid>
            <Box
                sx={{
                    mx: 2,
                    mb: 2,
                    pt: 2,
                    borderTop: "1px solid #E0E0E0",
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1,
                        mb: 1.5,
                    }}
                >
                    {/* Icon */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 32,
                            height: 32,
                            flexShrink: 0,
                            borderRadius: 1,
                            bgcolor: "#E2F2FF",
                        }}
                    >
                        <BedIcon
                            sx={{
                                fontSize: 20,
                                color: "#007AC1",
                            }}
                        />
                    </Box>

                    {/* Title */}
                    <Box>
                        <Typography
                            sx={{
                                color: "#007AC1",
                                fontWeight: 700,
                                fontSize: 13,
                                lineHeight: 1.4,
                            }}
                        >
                            สรุปจำนวนวันนอน
                        </Typography>

                        <Typography
                            sx={{
                                color: "#667085",
                                fontSize: 12,
                                lineHeight: 1.4,
                                mt: 0.25,
                            }}
                        >
                            IPD
                        </Typography>
                    </Box>
                </Box>

                {/* Stay Day Summary */}
                <Grid container spacing={1.5}>
                    <StayDayBox
                        label="จำนวนวัน IPD"
                        value={values.ipdDays ?? 0}
                        borderColor="#D6E8FF"
                        valueColor="#007AC1"
                    />

                    <StayDayBox
                        label="จำนวนวัน ICU"
                        value={values.icuDays ?? 0}
                        borderColor="#FFD9B3"
                        valueColor="#E53935"
                    />

                    <StayDayBox
                        label="จำนวนวันนอน"
                        value={values.totalDays ?? 0}
                        borderColor="#D0D5DD"
                        valueColor="#344054"
                    />
                </Grid>
            </Box>
            <StandardDataTable
                name="claimSummaryDocumentTable"
                title=""
                data={rows}
                isLoading={false}
                columns={columns}
                color="primary"
                columnHeaderAlign="center"
                displayToolbar={false}
                displayFooter={false}
                options={defaultOptionStandardDataTable}
            />
        </CustomPaper>
    );
};

export default ClaimSummary;
