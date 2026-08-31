import { Box, Button, Chip, Dialog, DialogContent, DialogTitle, IconButton, Tooltip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ArticleIcon from "@mui/icons-material/Article";
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

/**
 * ส่วน "รายละเอียดเคลม" ที่ให้ระบุว่าเคสนี้เป็นเคลมต่อเนื่องหรือไม่
 *
 * ติ๊ก Checkbox แล้วเปิด Modal ให้เลือกเคลมเดิม เมื่อเลือกแล้วจะแสดงเป็น Chip
 * และหน้าจอจะแสดงแถบสรุปเคลมต่อเนื่อง (ContinuousClaimBanner) ด้านบน
 */
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
            <HeadingWithColor icon={<ArticleIcon sx={{ fontSize: 27 }} />} text="รายละเอียดเคลม" color="blue" />

            <Box px={2} display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                <Box
                    sx={{
                        px: 2,
                        py: 0.5,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                    }}
                >
                    <FormikCheckbox
                        name="isContinuousClaim"
                        label="เป็นเคลมต่อเนื่อง"
                        formik={formik}
                        useFocusError={false}
                        onChange={(event) => onToggle(event.target.checked)}
                    />
                </Box>

                {selected && (
                    <>
                        <Tooltip title="เปลี่ยนรายการเคลมเดิม" arrow placement="top">
                            <Chip
                                icon={<DescriptionOutlinedIcon />}
                                label={`${selected.claimNo} | เคลมเดิมวันที่ ${selected.incidentDate}`}
                                variant="outlined"
                                onClick={() => onOpenChange(true)}
                                onDelete={onClear}
                                sx={{
                                    height: 46,
                                    px: 1,
                                    borderRadius: 2,
                                    fontSize: 18,
                                    fontWeight: 700,
                                    color: "#1565C0",
                                    borderColor: "divider",
                                }}
                            />
                        </Tooltip>
                    </>
                )}

                {formik.values.isContinuousClaim && !selected && (
                    <Button variant="outlined" onClick={() => onOpenChange(true)}>
                        เลือกเคลมต่อเนื่อง
                    </Button>
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

export default ContinuousClaimSection;
