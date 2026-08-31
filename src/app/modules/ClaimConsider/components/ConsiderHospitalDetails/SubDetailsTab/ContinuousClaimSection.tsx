import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RepeatIcon from "@mui/icons-material/Repeat";
import { MUIDataTableColumn } from "mui-datatables";
import { useFormikContext } from "formik";

import CustomPaper from "../../../../_common/components/CustomComponent/CustomPaper";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";
import { FormikCheckbox, StandardDataTable } from "../../../../_common";
import { cellAlignOptions, defaultOptionStandardDataTable, numberWithCommas } from "../../../../../functionHelpers";
import { ContinuousClaimRow } from "../mock/hospitalConsiderMock";
import { HospitalConsiderValues } from "../../../hooks/ClaimConsiderHospital/HospitalConsiderDetailHook";

type ContinuousClaimSectionProps = {
    rows: ContinuousClaimRow[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onToggle: (checked: boolean) => void;
    onSelect: (row: ContinuousClaimRow) => void;
    onClear: () => void;
};

const ContinuousClaimSection = ({
    rows,
    open,
    onOpenChange,
    onToggle,
    onSelect,
    onClear,
}: ContinuousClaimSectionProps) => {
    const formik = useFormikContext<HospitalConsiderValues>();
    const selected = formik.values.continuousClaim;

    const columns: MUIDataTableColumn[] = [
        {
            name: "claimNo",
            label: "เลขที่ CL",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "chiefComplaint",
            label: "อาการสำคัญ (ChiefComplaint)",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "left" }) },
        },
        {
            name: "incidentDate",
            label: "วันที่เกิดเหตุ",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "totalClaimAmount",
            label: "ยอดเบิกรวม",
            options: {
                filter: false,
                sort: false,
                ...cellAlignOptions({ align: "right" }),
                customBodyRender: (value: number) => numberWithCommas(value),
            },
        },
        {
            name: "totalPaidAmount",
            label: "ยอดจ่ายรวม",
            options: {
                filter: false,
                sort: false,
                ...cellAlignOptions({ align: "right" }),
                customBodyRender: (value: number) => numberWithCommas(value),
            },
        },
        {
            name: "",
            label: "เลือก",
            options: {
                filter: false,
                sort: false,
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: (_value, tableMeta) => (
                    <Button size="small" variant="contained" onClick={() => onSelect(rows[tableMeta.rowIndex])}>
                        เลือก
                    </Button>
                ),
            },
        },
    ];

    return (
        <CustomPaper>
            <HeadingWithColor icon={<RepeatIcon sx={{ fontSize: 27 }} />} text="เคลมต่อเนื่อง" color="blue" />

            <Box px={2}>
                <FormikCheckbox
                    name="isContinuousClaim"
                    label="รายการนี้เป็นเคลมต่อเนื่อง"
                    formik={formik}
                    useFocusError={false}
                    onChange={(event) => onToggle(event.target.checked)}
                />

                {selected && (
                    <Box
                        sx={{
                            mt: 1,
                            p: 2,
                            border: "1px solid #90CAF9",
                            borderRadius: 2,
                            bgcolor: "#F5FAFF",
                            lineHeight: 1.6,
                        }}
                    >
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                            <Typography fontWeight={700} color="#1565C0">
                                รายการที่เลือก
                            </Typography>
                            <Box display="flex" gap={1}>
                                <Button size="small" variant="outlined" onClick={() => onOpenChange(true)}>
                                    เปลี่ยนรายการ
                                </Button>
                                <Button size="small" color="error" variant="outlined" onClick={onClear}>
                                    ยกเลิกการเลือก
                                </Button>
                            </Box>
                        </Box>

                        <Divider sx={{ mb: 1.5 }} />

                        <Grid container spacing={1.5}>
                            <SelectedItem label="เลขที่ CL" value={<Chip size="small" label={selected.claimNo} />} />
                            <SelectedItem label="วันที่เข้า รพ." value={selected.admissionDate} />
                            <SelectedItem label="ข้อมูลเคลม" value={selected.claimInfo} />
                            <SelectedItem label="การวินิจฉัย 1 (Diagnosis 1)" value={selected.diagnosis1} md={8} />
                            <SelectedItem
                                label="วงเงินคงเหลือ"
                                value={numberWithCommas(selected.remainingLimit)}
                                md={4}
                            />
                        </Grid>
                    </Box>
                )}
            </Box>

            <Dialog open={open} onClose={() => onOpenChange(false)} maxWidth="lg" fullWidth>
                <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    เลือกเคลมต่อเนื่อง
                    <IconButton onClick={() => onOpenChange(false)} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <StandardDataTable
                        name="continuousClaimTable"
                        title=""
                        data={rows}
                        columns={columns}
                        color="primary"
                        columnHeaderAlign="center"
                        displayToolbar={false}
                        displayFooter={false}
                        options={defaultOptionStandardDataTable}
                    />
                </DialogContent>
            </Dialog>
        </CustomPaper>
    );
};

type SelectedItemProps = {
    label: string;
    value: React.ReactNode;
    md?: number;
};

const SelectedItem = ({ label, value, md = 4 }: SelectedItemProps) => (
    <Grid item xs={12} sm={6} md={md}>
        <Typography fontSize={12} color="text.secondary" lineHeight={1.4}>
            {label}
        </Typography>
        <Typography fontSize={14} fontWeight={600} lineHeight={1.4}>
            {value}
        </Typography>
    </Grid>
);

export default ContinuousClaimSection;
