import React from "react";
import { IconButton, TableCell, TableFooter, TableRow, Tooltip, Zoom } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { MUIDataTableColumn } from "mui-datatables";
import { cellAlignOptions, defaultOptionStandardDataTable, numberWithCommas } from "../../../../../functionHelpers";
import { StandardDataTable } from "../../../../_common";
import { HeadingWithColor } from "../../../../_common/components/CustomComponent/HeadingWithColor";

interface SummaryRow {
    appId: string;
    customerName: string;
    claimType: string;
    claimAmount: number;
}

interface Props {
    data: SummaryRow[];
    onEdit: () => void;
}

const ClaimSummaryPHTable: React.FC<Props> = ({ data, onEdit }) => {
    const totalClaimAmount = data.reduce((sum, row) => sum + Number(row.claimAmount), 0);

    const columns: MUIDataTableColumn[] = [
        {
            name: "appId",
            label: "ApplicationID",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "customerName",
            label: "ชื่อผู้เอาประกัน",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "claimType",
            label: "ลักษณะการเคลม",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "claimAmount",
            label: "ยอดเบิก",
            options: {
                filter: false,
                sort: false,
                ...cellAlignOptions({ align: "right" }),
                customBodyRender: (value) => Number(value).toLocaleString("th-TH", { minimumFractionDigits: 2 }),
            },
        },
        {
            name: "",
            label: "",
            options: {
                filter: false,
                sort: false,
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: () => (
                    <Tooltip
                        title="แก้ไขรายละเอียด"
                        arrow
                        placement="top"
                        TransitionComponent={Zoom}
                        enterDelay={100}
                        leaveDelay={50}
                    >
                        <IconButton size="small" sx={{ bgcolor: "#fdf6e3", color: "#c8a415" }} onClick={onEdit}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                ),
            },
        },
    ];

    return (
        <>
            <HeadingWithColor text="ข้อมูลเคลม" color="blue" />
            <StandardDataTable
                name="ClaimSummaryTable"
                title=""
                data={data}
                isLoading={false}
                columns={columns}
                color="primary"
                columnHeaderAlign="center"
                displayToolbar={false}
                displayFooter={true}
                options={{
                    ...defaultOptionStandardDataTable,
                    pagination: false,
                    customFooter: () => <></>,
                    customTableBodyFooterRender: (options) => {
                        return (
                            <>
                                {options.data.length > 0 && (
                                    <TableFooter>
                                        <TableRow>
                                            {options.columns.map((_col, index) => {
                                                if (index === 2) {
                                                    return (
                                                        <TableCell
                                                            key={index as number}
                                                            sx={{
                                                                fontSize: 14,
                                                                fontWeight: "bold",
                                                                color: "#007AC1",
                                                                textAlign: "center",
                                                                p: 2,
                                                            }}
                                                        >
                                                            จำนวนเงินรวม :
                                                        </TableCell>
                                                    );
                                                } else if (index === 3) {
                                                    return (
                                                        <TableCell
                                                            key={index as number}
                                                            sx={{
                                                                fontSize: 14,
                                                                fontWeight: "bold",
                                                                color: "#007AC1",
                                                                textAlign: "right",
                                                            }}
                                                        >
                                                            {numberWithCommas(totalClaimAmount)}
                                                        </TableCell>
                                                    );
                                                } else {
                                                    return <TableCell key={index as number} />;
                                                }
                                            })}
                                        </TableRow>
                                    </TableFooter>
                                )}
                            </>
                        );
                    },
                }}
            />
        </>
    );
};

export default ClaimSummaryPHTable;
