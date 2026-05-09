import React from "react";
import { Button } from "@mui/material";
import AddCommentIcon from "@mui/icons-material/AddComment";
import { MUIDataTableColumn } from "mui-datatables";
import {
    cellAlignOptions,
    defaultOptionStandardDataTable,
    formatDateString,
    smallSizeFooter,
} from "../../../../functionHelpers";
import { StandardDataTable } from "../../../_common";
import LinearLoading from "../../../_common/components/CustomComponent/LinearLoading";
import { HeadingWithColor } from "../../../_common/components/CustomComponent/HeadingWithColor";
import { ClaimHistoryItem } from "../../store/monitorSlice";
import { useMonitorClaimHistory } from "../../hooks/Monitor/useMonitorClaimHistory";

interface Props {
    tableId: string; // "ClaimHistoryPATable" | "ClaimHistoryPHTable"
    onContinuousClaim: (item: ClaimHistoryItem) => void;
}

const ClaimHistoryTable: React.FC<Props> = ({ tableId, onContinuousClaim }) => {
    const { claimHistory, isLoading, paginated, setPaginated } = useMonitorClaimHistory();
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
                    const item = claimHistory[tableMeta.rowIndex];
                    return (
                        <Button
                            variant="contained"
                            size="small"
                            color="primary"
                            startIcon={<AddCommentIcon />}
                            onClick={() => onContinuousClaim(item)}
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
            <HeadingWithColor text="ประวัติการเคลม" color="blue" />
            <LinearLoading isLoading={isLoading}>
                <StandardDataTable
                    name={tableId}
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
        </>
    );
};

export default ClaimHistoryTable;
