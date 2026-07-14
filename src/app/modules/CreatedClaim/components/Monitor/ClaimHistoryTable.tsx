import React from "react";
import { Button } from "@mui/material";
import AddCommentIcon from "@mui/icons-material/AddComment";
import { MUIDataTableColumn } from "mui-datatables";
import { cellAlignOptions, formatDateString, smallSizeFooter } from "../../../../functionHelpers";
import { StandardDataTable } from "../../../_common";
import LinearLoading from "../../../_common/components/CustomComponent/LinearLoading";
import { HeadingWithColor } from "../../../_common/components/CustomComponent/HeadingWithColor";
import { GetClaimHistoryDtoResponseListServiceResponse } from "../../../../api/coreClaimApi.client";
import { useClaimHistory } from "../../hooks/Monitor/useClaimHistory";

interface Props {
    tableId: string; // "ClaimHistoryPATable" | "ClaimHistoryPHTable"
    onContinuousClaim: (item: GetClaimHistoryDtoResponseListServiceResponse) => void;
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
            name: "chiefComplaintDetail",
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
                    const item = claimHistoryData?.data?.[tableMeta.rowIndex] as
                        | GetClaimHistoryDtoResponseListServiceResponse
                        | undefined;
                    return (
                        <Button
                            variant="contained"
                            size="small"
                            color="primary"
                            startIcon={<AddCommentIcon />}
                            onClick={() => {
                                if (item) onContinuousClaim(item);
                            }}
                            disabled={!item}
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
