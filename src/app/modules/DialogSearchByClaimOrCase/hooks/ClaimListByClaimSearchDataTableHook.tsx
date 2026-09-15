import dayjs from "dayjs";
import { numberWithCommas } from "../../../functionHelpers";
import { Button } from "@mui/material";
import { MUIDataTableColumn } from "mui-datatables";

export interface ClaimSearchResultRow {
    caseAmount: number;
    caseId: string;
    claimCase: string;
    claimId: string;
    coverageType: string;
    createdClaimDate: string;
    customerName: string;
}

type ClaimListByClaimSearchDataTableHookProps = {
    data: any;
    selectedCaseId?: string | null;
    onSelect: (row: ClaimSearchResultRow) => void;
};

const useClaimListByClaimSearchDataTableHook = ({
    data,
    selectedCaseId,
    onSelect,
}: ClaimListByClaimSearchDataTableHookProps) => {
    const columns: MUIDataTableColumn[] = [
        {
            name: "claimCase",
            label: "เลขที่ CC",
            options: { sort: false, filter: false },
        },
        {
            name: "customerName",
            label: "ชื่อผู้เอาประกัน",
            options: { sort: false, filter: false },
        },
        {
            name: "coverageType",
            label: "ประเภทความคุ้มครอง",
            options: { sort: false, filter: false },
        },
        {
            name: "createdClaimDate",
            label: "วันที่สร้างเคลม",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (dataIndex) =>
                    dayjs(data[dataIndex].createdClaimDate).format("DD/MM/YYYY HH:mm:ss"),
            },
        },
        {
            name: "caseAmount",
            label: "จำนวนเงิน",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (dataIndex) => numberWithCommas(data[dataIndex].caseAmount ?? 0),
            },
        },
        {
            name: "",
            label: "เลือก",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (dataIndex) => {
                    const row = data[dataIndex];
                    const isSelected = row.caseId === selectedCaseId;

                    return (
                        <Button
                            size="small"
                            variant={isSelected ? "outlined" : "contained"}
                            onClick={() => onSelect(row)}
                            sx={
                                isSelected
                                    ? {
                                          textTransform: "none",
                                          borderColor: "#0D4C8C",
                                          color: "#0D4C8C",
                                      }
                                    : {
                                          textTransform: "none",
                                          backgroundColor: "#0D4C8C",
                                          "&:hover": { backgroundColor: "#0A3D70" },
                                      }
                            }
                        >
                            {isSelected ? "เลือกแล้ว" : "เลือก"}
                        </Button>
                    );
                },
            },
        },
    ];
    return { columns };
};

export default useClaimListByClaimSearchDataTableHook;
