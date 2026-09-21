import React from "react";
import { Box, Typography } from "@mui/material";
import { StandardDataTable } from "../../../_common";
import useHospitalManagementDataTableHook, { HospitalPaySettingRow } from "../hooks/HospitalManagementDataTableHook";

export interface HospitalPaySettingsTableProps {
    initialRows: HospitalPaySettingRow[];
    onSaveRow: (row: HospitalPaySettingRow) => void;
    renderHistory: (hospitalId: string, hospitalName: string) => React.ReactNode;
    isLoading: boolean;
}

const HospitalPaySettingsTable = ({
    initialRows,
    onSaveRow,
    renderHistory,
    isLoading,
}: HospitalPaySettingsTableProps) => {
    const { rows, columns, expandedIndexes, renderExpandableRow } = useHospitalManagementDataTableHook({
        initialRows,
        onSaveRow,
        renderHistory,
    });

    return (
        <Box
            sx={{
                border: "1px solid #E0E0E0",
                borderRadius: "12px",
                backgroundColor: "#FFFFFF",
                overflow: "hidden",
                // Hide mui-datatables' own expand-arrow column entirely —
                // expansion here is only ever triggered by the "ประวัติ"
                // button inside the last column, matching the screenshot
                // (no arrow column shown there).
                "& .MuiTableBody-root .MuiTableRow-root > .MuiTableCell-root:first-of-type button": {
                    display: "none",
                },
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px" }}>
                <Typography sx={{ fontWeight: 700, color: "#1565C0" }}>รายการตั้งค่าการจ่ายเงิน</Typography>
                <Box
                    sx={{
                        backgroundColor: "#EAF4FC",
                        color: "#1565C0",
                        borderRadius: "20px",
                        padding: "4px 14px",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                    }}
                >
                    {rows.length} สถานพยาบาล
                </Box>
            </Box>

            <StandardDataTable
                name="hospitalPaySettings"
                title=""
                data={rows}
                columns={columns}
                displayFooter={false}
                isLoading={isLoading}
                color="primary"
                options={{
                    expandableRows: true,
                    expandableRowsHeader: false,
                    expandableRowsOnClick: false,
                    rowsExpanded: expandedIndexes,
                    renderExpandableRow,
                }}
            />
        </Box>
    );
};

export default HospitalPaySettingsTable;
