import { Box } from "@mui/material";
import { MUIDataTableColumn } from "mui-datatables";
import { PaginationDto, swalError } from "../../../_common";
// import { useAppDispatch } from "../../../../../redux";
import { useEffect, useRef, useState } from "react";
import { HospitalPendingTransferType, useGetHospitalPendingTransferMonitor } from "../transferClaimHospitalAPI";
import dayjs from "dayjs";
import { numberWithCommas } from "../../../../functionHelpers";
import { HospitalTransferMonitorType } from "../manageTransferHospitalAPI";
import SpitButtonAction from "../components/SpitButtonAction";

type useTransferSuccessTableHookProp = {
    statusId: number | undefined;
};

const useTransferSuccessTableHook = ({ statusId }: useTransferSuccessTableHookProp) => {
    // const dispatch = useAppDispatch();
    const [data, setData] = useState<HospitalPendingTransferType>();
    const [paginate, setPaginate] = useState<PaginationDto>({ page: 1, recordsPerPage: 10 });
    const [onRowsSelected, setOnRowsSelected] = useState<any[]>([]);
    const [rowsSelected, setRowsSelected] = useState<any[]>([]);

    const handleGetDataSuccess = (res: any) => {
        setData(res);
    };

    const handleError = (message: string) => {
        swalError("แจ้งเตือน", message);
    };

    const lastRequest = useRef<HospitalTransferMonitorType>();

    const fetchPendingTransfers = (payload: HospitalTransferMonitorType) => {
        lastRequest.current = payload;
        mutateGetHospitalPendingTransfer(payload);
    };

    const { mutate: mutateGetHospitalPendingTransfer, isLoading: isGetHospitalPendingTransferLoading } =
        useGetHospitalPendingTransferMonitor(handleGetDataSuccess, handleError);

    const handleSentTransfer = () => {
        // dispatch(setDialogOpen({ isOpen: true, generateListData: rowsSelected }));
        console.log(rowsSelected);
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

    useEffect(() => {
        setOnRowsSelected([]);
        setRowsSelected([]);
    }, [paginate]);

    const column: MUIDataTableColumn[] = [
        {
            name: "paymentCode",
            label: "เลขอ้างอิงการโอน",
            options: {
                sort: false,
                filter: false,
            },
        },
        {
            name: "paymentDate",
            label: "วันที่โอนเงิน",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (rowIndex) => {
                    const formatDate = data?.data?.[rowIndex].paymentDate
                        ? dayjs(data?.data?.[rowIndex]?.paymentDate).format("DD/MM/YYYY")
                        : "-";
                    return formatDate;
                },
            },
        },
        {
            name: "hospitalName",
            label: "สถานพยาบาล",
            options: { sort: false, filter: false },
        },
        {
            name: "itemCount",
            label: "จำนวนราย",
            options: { sort: false, filter: false },
        },
        {
            name: "amount",
            label: "จำนวนเงิน",
            options: {
                sort: false,
                filter: false,
                setCellHeaderProps: () => ({
                    style: { textAlign: "center" },
                }),
                customBodyRenderLite: (rowIndex) => {
                    const formatNumberAmount = numberWithCommas(data?.data?.[rowIndex]?.amount ?? 0);
                    return (
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "end",
                                alignItems: "center",
                            }}
                        >
                            {formatNumberAmount}
                        </Box>
                    );
                },
            },
        },
        {
            name: "toBank",
            label: "ธนาคาร",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (rowIndex) => {
                    return (
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            {data?.data?.[rowIndex]?.toBank ?? "-"}
                        </Box>
                    );
                },
            },
        },
        {
            name: "toAccountNo",
            label: "เลขที่บัญชี",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (rowIndex) => {
                    return (
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            {data?.data?.[rowIndex]?.toAccountNo ?? "-"}
                        </Box>
                    );
                },
            },
        },
        {
            name: "toAccountName",
            label: "ชื่อบัญชี",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (rowIndex) => {
                    return (
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            {data?.data?.[rowIndex]?.toAccountName ?? "-"}
                        </Box>
                    );
                },
            },
        },
        {
            name: "statusId",
            label: "สถานะ",
            options: {
                sort: false,
                filter: false,
                setCellHeaderProps: () => ({
                    style: { textAlign: "center" },
                }),
                customBodyRenderLite: (rowIndex) => {
                    return (
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            {statusId === 3 ? (
                                <Box sx={{ bgcolor: "#E7F8EE", color: "#429B7B", borderRadius: 2, p: "7px" }}>
                                    {data?.data?.[rowIndex]?.statusNameTH}
                                </Box>
                            ) : statusId === 5 ? (
                                <Box sx={{ bgcolor: "#f8e7e7", color: "#BF360C", borderRadius: 2, p: "7px" }}>
                                    {data?.data?.[rowIndex]?.statusNameTH}
                                </Box>
                            ) : (
                                "-"
                            )}
                        </Box>
                    );
                },
            },
        },
        {
            name: "",
            label: "สถานะส่งเมล",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (rowIndex) => {
                    return (
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            {data?.data?.[rowIndex]?.isSelectable ? (
                                <Box sx={{ bgcolor: "#EEF5F8", color: "#A0ACB6", borderRadius: 2, p: "7px" }}>
                                    {data?.data?.[rowIndex]?.statusNameTH}
                                </Box>
                            ) : (
                                "-"
                            )}
                        </Box>
                    );
                },
            },
        },
        {
            name: "action",
            label: "ดำเนินการ",
            options: {
                sort: false,
                filter: false,
                setCellHeaderProps: () => ({
                    style: { textAlign: "center" },
                }),
                customBodyRenderLite: (rowIndex) => {
                    return (
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <SpitButtonAction
                                handleTransfer={() => {}}
                                paymentId={data?.data?.[rowIndex]?.paymentId ?? ""}
                                statusId={statusId}
                            />
                        </Box>
                    );
                },
            },
        },
    ];
    return {
        data,
        column,
        paginate,
        mutateGetHospitalPendingTransfer,
        isGetHospitalPendingTransferLoading,
        fetchPendingTransfers,
        setPaginate,
        handleRowSelected,
        onRowsSelected,
        handleSentTransfer,
    };
};

export default useTransferSuccessTableHook;
