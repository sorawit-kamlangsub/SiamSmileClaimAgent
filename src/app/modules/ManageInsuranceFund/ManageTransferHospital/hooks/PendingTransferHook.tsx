import { Box, Button } from "@mui/material";
import { MUIDataTableColumn } from "mui-datatables";
import { PaginationDto, swalConfirm, swalError, swalSuccess } from "../../../_common";
// import { useAppDispatch } from "../../../../../redux";
import { useMemo, useRef, useState } from "react";
import {
    HospitalPendingTransferType,
    useGetHospitalPendingTransferMonitor,
    useTransferClaimHospitalNow,
} from "../transferClaimHospitalAPI";
import dayjs from "dayjs";
import { numberWithCommas } from "../../../../functionHelpers";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { HospitalTransferMonitorType } from "../manageTransferHospitalAPI";

const usePendingTransferHook = () => {
    // const dispatch = useAppDispatch();
    const [data, setData] = useState<HospitalPendingTransferType>();
    const [paginate, setPaginate] = useState<PaginationDto>({ page: 1, recordsPerPage: 10 });
    const [onRowsSelected, setOnRowsSelected] = useState<any[]>([]);
    const [rowsSelected, setRowsSelected] = useState<any[]>([]);

    const handleGetDataSuccess = (res: any) => {
        setData(res);
    };

    const handleTransferSuccess = () => {
        swalSuccess("ทำรายการสำเร็จ", "");

        if (lastRequest.current) {
            mutateGetHospitalPendingTransfer(lastRequest.current);
        }
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

    const { mutate: mutateTransferClaimHospitalNow, isLoading: isTransferClaimHospitalNowLoading } =
        useTransferClaimHospitalNow(handleTransferSuccess, handleError);

    const handleTransferNow = (paymentId: string) => {
        swalConfirm("ยืนยันทำรายการ", "", "ยืนยัน", "ยกเลิก").then((res) => {
            if (res.isConfirmed) {
                mutateTransferClaimHospitalNow(paymentId);
            }
        });
    };

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

    useMemo(() => {
        setOnRowsSelected([]);
        setRowsSelected([]);
    }, [paginate, fetchPendingTransfers]);

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
            label: "วันที่ทำรายการ",
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
            name: "expectedPaymentDate",
            label: "วันที่คาดว่าเงินจะออก",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (rowIndex) => {
                    const formatDate = data?.data?.[rowIndex].expectedPaymentDate
                        ? dayjs(data?.data?.[rowIndex]?.expectedPaymentDate).format("DD/MM/YYYY")
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
            name: "toBank",
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
                            {data?.data?.[rowIndex]?.toBank ?? "-"}
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
            name: "toAccountNo",
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
                            <Box sx={{ bgcolor: "#FFF7DC", color: "#C39A3B", borderRadius: 2, p: "7px" }}>
                                {data?.data?.[rowIndex]?.statusNameTH}
                            </Box>
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
                            <Button
                                variant="outlined"
                                sx={{
                                    backgroundColor: "#F2FAFF",
                                    borderBlockColorColor: "#03A9F4",
                                    borderRadius: "72px",

                                    "&:hover": {
                                        backgroundColor: "#F2FAFF",
                                    },
                                }}
                                onClick={() => {
                                    handleTransferNow(data?.data?.[rowIndex]?.paymentId ?? "");
                                }}
                                // aria-controls={open ? "fade-menu" : undefined}
                                // aria-haspopup="true"
                                // aria-expanded={open ? "true" : undefined}
                            >
                                <MoreVertIcon sx={{ color: "#03A9F4", cursor: "pointer" }} />
                            </Button>
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
        // handleGenerateSuccess: handleGenerateDialogOpen,
        isTransferClaimHospitalNowLoading,
        mutateTransferClaimHospitalNow,
        fetchPendingTransfers,
        setPaginate,
        handleRowSelected,
        onRowsSelected,
        handleSentTransfer,
    };
};

export default usePendingTransferHook;
