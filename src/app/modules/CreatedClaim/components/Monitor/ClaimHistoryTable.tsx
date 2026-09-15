import React from "react";
import { Button } from "@mui/material";
import AddCommentIcon from "@mui/icons-material/AddComment";
import { MUIDataTableColumn } from "mui-datatables";
import { cellAlignOptions, formatDateString, smallSizeFooter } from "../../../../functionHelpers";
import { StandardDataTable } from "../../../_common";
import LinearLoading from "../../../_common/components/CustomComponent/LinearLoading";
import { HeadingWithColor } from "../../../_common/components/CustomComponent/HeadingWithColor";
import { GetClaimHistoryDtoResponse } from "../../../../api/coreClaimApi.client";
import { useClaimHistory } from "../../hooks/Monitor/useClaimHistory";

interface Props {
    tableId: string; // "ClaimHistoryPATable" | "ClaimHistoryPHTable"
    onContinuousClaim: (item: GetClaimHistoryDtoResponse) => void;
}

const ClaimHistoryTable: React.FC<Props> = ({ tableId, onContinuousClaim }) => {
    const { claimHistoryData, claimHistoryisLoading, setPaginated, pagination } = useClaimHistory();
    const columns: MUIDataTableColumn[] = [
        {
            name: "claimNo",
            label: "ClaimNo",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "lastestChiefComplaint",
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
            name: "totalCaseAmount",
            label: "ยอดเบิกรวม",
            options: {
                ...cellAlignOptions({ align: "right", cellWhiteSpace: "nowrap" }),
                customBodyRender: (value) => Number(value).toLocaleString("th-TH", { minimumFractionDigits: 2 }),
            },
        },
        {
            name: "paidAmount",
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
                    const item = claimHistoryData?.data?.[tableMeta.rowIndex] as GetClaimHistoryDtoResponse | undefined;
                    // แสดงปุ่มเฉพาะเคสที่ backend อนุญาตให้แจ้งเคลมต่อเนื่องเท่านั้น เคสอื่นปล่อยว่าง
                    if (!item?.isEnableClaimContinue) {
                        return null;
                    }
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
            <LinearLoading isLoading={claimHistoryisLoading}>
                <StandardDataTable
                    name={tableId}
                    title=""
                    data={claimHistoryData?.data || []}
                    isLoading={claimHistoryisLoading}
                    columns={columns}
                    color="primary"
                    columnHeaderAlign="center"
                    setPaginated={setPaginated}
                    paginated={pagination}
                    displayToolbar={false}
                    sx={smallSizeFooter}
                />
            </LinearLoading>
        </>
    );
};

export default ClaimHistoryTable;
