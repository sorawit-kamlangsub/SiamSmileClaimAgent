import React from "react";
import { Box, Button, Grid, IconButton, Tooltip, Zoom } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { MUIDataTableColumn } from "mui-datatables";
import { ClaimInsuredItem } from "../../../store/claimPASlice";
import { cellAlignOptions, defaultOptionStandardDataTable, smallSizeFooter } from "../../../../../functionHelpers";
import { StandardDataTable } from "../../../../_common";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";

interface Props {
    data: ClaimInsuredItem[];
    onEdit: (item: ClaimInsuredItem) => void;
    onDelete: (id: string) => void;
    onAddInsured: () => void;
}

const ClaimSummaryPATable: React.FC<Props> = ({ data, onEdit, onDelete, onAddInsured }) => {
    const claimTypeLabel = (item: ClaimInsuredItem) => {
        if ((item.claimType === "OPD" || item.claimType === "IPD") && item.opdSubType)
            return `${item.claimType} (${item.opdSubType})`;
        return item.claimType;
    };

    const columns: MUIDataTableColumn[] = [
        { name: "seq", label: "ลำดับ", options: { ...cellAlignOptions({ align: "center" }) } },
        { name: "customerName", label: "ชื่อผู้เอาประกัน", options: { ...cellAlignOptions({ align: "left" }) } },
        { name: "insuredType", label: "ประเภทผู้เอาประกัน", options: { ...cellAlignOptions({ align: "center" }) } },
        {
            name: "claimType",
            label: "ลักษณะการเคลม",
            options: {
                ...cellAlignOptions({ align: "center" }),
                customBodyRenderLite: (i) => claimTypeLabel(data[i]),
            },
        },
        {
            name: "claimAmount",
            label: "ยอดเบิก",
            options: {
                ...cellAlignOptions({ align: "right" }),
                customBodyRender: (v) => Number(v).toLocaleString("th-TH", { minimumFractionDigits: 2 }),
            },
        },
        {
            name: "",
            label: "",
            options: {
                ...cellAlignOptions({ align: "center" }),
                customBodyRenderLite: (i) => {
                    const item = data[i];
                    return (
                        <Box display="flex" gap={0.5} justifyContent="center">
                            <Tooltip title="แก้ไขรายการ" arrow TransitionComponent={Zoom} placement="top">
                                <IconButton
                                    size="small"
                                    sx={{ color: "#c8a415", bgcolor: "#fcf2dc", alignItems: "center" }}
                                    onClick={() => onEdit(item)}
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="ลบรายการ" arrow TransitionComponent={Zoom} placement="top">
                                <IconButton
                                    size="small"
                                    sx={{ color: "#b32121", bgcolor: "#fde8e8", alignItems: "center" }}
                                    onClick={() => onDelete(item.id)}
                                >
                                    <DeleteForeverIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    );
                },
            },
        },
    ];

    return (
        <>
            <HeadingWithColor text="ข้อมูลเคลม" color="blue" />
            <StandardDataTable
                name="ClaimSummaryPATable"
                title=""
                data={data}
                isLoading={false}
                columns={columns}
                color="primary"
                columnHeaderAlign="center"
                displayToolbar={false}
                options={{ ...defaultOptionStandardDataTable }}
                sx={smallSizeFooter}
            />
            <Grid container justifyContent="flex-end" mt={2}>
                <Button size="small" color="primary" onClick={onAddInsured} startIcon={<PersonAddIcon />}>
                    เพิ่มผู้เอาประกัน
                </Button>
            </Grid>
        </>
    );
};

export default ClaimSummaryPATable;
