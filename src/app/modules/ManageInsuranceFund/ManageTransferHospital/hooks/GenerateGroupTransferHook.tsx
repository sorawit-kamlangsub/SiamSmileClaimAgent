import dayjs from "dayjs";
import { MUIDataTableColumn } from "mui-datatables";
import { numberWithCommas } from "../../../../functionHelpers";
import { Typography } from "@mui/material";
import { PaginationDto, swalError, swalInfo } from "../../../_common";
import { useMemo, useState } from "react";
import { useAppDispatch } from "../../../../../redux";
import { setDialogOpen } from "../store/generateTransferSlice";
import { HospitalTransferMonitorResponse, useGetHospitalTransferMonitor } from "../manageTransferHospitalAPI";

const useGenerateGroupTransferHook = () => {
    const dispatch = useAppDispatch();
    const [data, setData] = useState<HospitalTransferMonitorResponse>();
    const [paginate, setPaginate] = useState<PaginationDto>({ page: 1, recordsPerPage: 10 });
    const [onRowsSelected, setOnRowsSelected] = useState<any[]>([]);
    const [rowsSelected, setRowsSelected] = useState<any[]>([]);

    const handleGetDataSuccess = (res: HospitalTransferMonitorResponse) => {
        setData(res);
    };

    const handleError = (message: string) => {
        swalError("แจ้งเตือน", message);
    };

    const { mutate, isLoading } = useGetHospitalTransferMonitor(handleGetDataSuccess, handleError);

    const column: MUIDataTableColumn[] = [
        {
            name: "caseNo",
            label: "เลขที่เคส",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (rowIndex) => {
                    return (
                        <Typography
                            onClick={() => {
                                swalInfo(data?.data?.[rowIndex]?.caseId ?? "", "");
                            }}
                            sx={{ color: "#4389B5", cursor: "pointer" }}
                        >
                            {data?.data?.[rowIndex]?.caseNo}
                        </Typography>
                    );
                },
            },
        },
        {
            name: "billSentDate",
            label: "วันที่ส่งวางบิล",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (rowIndex) => {
                    const formatDate = data?.data?.[rowIndex].billSentDate
                        ? dayjs(data?.data?.[rowIndex]?.billSentDate).format("DD/MM/YYYY")
                        : "-";
                    return formatDate;
                },
            },
        },
        {
            name: "customerName",
            label: "ชื่อผู้เอาประกัน",
            options: { sort: false, filter: false },
        },
        {
            name: "hospitalName",
            label: "สถานพยาบาล",
            options: { sort: false, filter: false },
        },
        {
            name: "amount",
            label: "จำนวนเงิน",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (rowIndex) => {
                    const formatNumberAmount = numberWithCommas(data?.data?.[rowIndex]?.amount ?? 0);
                    return formatNumberAmount;
                },
            },
        },
        {
            name: "statusId",
            label: "สถานะ",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (rowIndex) => {
                    return data?.data?.[rowIndex]?.statusNameTH;
                },
            },
        },
    ];

    //TODO - mutate handle when generate
    const handleGenerateDialogOpen = () => {
        dispatch(setDialogOpen({ isOpen: true, generateListData: rowsSelected }));
    };

    const handleRowSelected = (
        _currentRowsSelected: any[],
        _allRowsSelected: any[],
        selectedRowIndexes: number[] = []
    ) => {
        setOnRowsSelected(selectedRowIndexes);

        const rows = selectedRowIndexes.map((rowIndex) => data?.data[rowIndex]);
        setRowsSelected(rows);
    };

    useMemo(() => {
        setOnRowsSelected([]);
        setRowsSelected([]);
    }, [paginate]);

    return {
        data,
        column,
        paginate,
        mutate,
        isLoading,
        handleGenerateSuccess: handleGenerateDialogOpen,
        setPaginate,
        handleRowSelected,
        onRowsSelected,
    };
};

export default useGenerateGroupTransferHook;
