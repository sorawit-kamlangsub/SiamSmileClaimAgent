import { Box } from "@mui/material";
import { MUIDataTableColumn } from "mui-datatables";
import {
    PaginationResultDto,
    PaginationSortableDto,
    swalConfirm,
    swalError,
    swalSuccess,
    swalWarning,
} from "../../../_common";
// import { useAppDispatch } from "../../../../../redux";
import { useEffect, useMemo, useState } from "react";
import { useGetHospitalMonitorDataByStatus, useTransferClaimHospitalNow } from "../transferClaimHospitalAPI";
import dayjs from "dayjs";
import { numberWithCommas } from "../../../../functionHelpers";
import SpitButtonAction from "../components/SpitButtonAction";

type PendingTransferHookProps = {
    statusId: number | undefined;
    searchDetail: string;
};

const usePendingTransferHook = ({ statusId, searchDetail }: PendingTransferHookProps) => {
    // const dispatch = useAppDispatch();
    const [paginate, setPaginate] = useState<PaginationSortableDto>({ page: 1, recordsPerPage: 10 });
    const [onRowsSelected, setOnRowsSelected] = useState<any[]>([]);
    const [rowsSelected, setRowsSelected] = useState<any[]>([]);

    const handleTransferSuccess = (res: any) => {
        if (res.data?.isSuccess) {
            swalSuccess("ทำรายการสำเร็จ", "");
        } else {
            swalWarning("แจ้งเตือน", res?.message);
        }
    };

    const handleError = (message: string) => {
        swalError("แจ้งเตือน", message);
    };

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

    const { data: getHospitalMonitorByStatusData, isLoading: isGetHospitalMonitorByStatusDataLoading } =
        useGetHospitalMonitorDataByStatus({
            statusId: statusId,
            hospitalName: searchDetail,
            paginate,
        });

    const handleRowSelected = (
        _currentRowsSelected: any[],
        _allRowsSelected: any[],
        selectedRowIndexes: number[] = []
    ) => {
        setOnRowsSelected(selectedRowIndexes);

        const rows = selectedRowIndexes.map((rowIndex) => getHospitalMonitorByStatusData?.data[rowIndex]);
        setRowsSelected(rows);
    };

    const pagination: PaginationResultDto = useMemo(
        () => ({
            totalAmountRecords: getHospitalMonitorByStatusData?.totalAmountRecords ?? 0,
            totalAmountPages: getHospitalMonitorByStatusData?.totalAmountPages ?? 0,
            currentPage: getHospitalMonitorByStatusData?.currentPage ?? 0,
            recordsPerPage: getHospitalMonitorByStatusData?.recordsPerPage ?? 0,
            pageIndex: getHospitalMonitorByStatusData?.pageIndex ?? 0,
        }),
        [getHospitalMonitorByStatusData]
    );

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
            label: "วันที่ทำรายการ",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (rowIndex) => {
                    const formatDate = getHospitalMonitorByStatusData?.data?.[rowIndex].paymentDate
                        ? dayjs(getHospitalMonitorByStatusData?.data?.[rowIndex]?.paymentDate).format("DD/MM/YYYY")
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
                    const formatDate = getHospitalMonitorByStatusData?.data?.[rowIndex].expectedPaymentDate
                        ? dayjs(getHospitalMonitorByStatusData?.data?.[rowIndex]?.expectedPaymentDate).format(
                              "DD/MM/YYYY"
                          )
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
                    const formatNumberAmount = numberWithCommas(
                        getHospitalMonitorByStatusData?.data?.[rowIndex]?.amount ?? 0
                    );
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
                            {getHospitalMonitorByStatusData?.data?.[rowIndex]?.toBank ?? "-"}
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
                            {getHospitalMonitorByStatusData?.data?.[rowIndex]?.toAccountNo ?? "-"}
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
                            {getHospitalMonitorByStatusData?.data?.[rowIndex]?.toAccountName ?? "-"}
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
                            <Box sx={{ bgcolor: "#FFF7DC", color: "#C39A3B", borderRadius: 2, p: "7px" }}>
                                {getHospitalMonitorByStatusData?.data?.[rowIndex]?.statusNameTH}
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
                            <SpitButtonAction
                                handleTransfer={handleTransferNow}
                                paymentId={getHospitalMonitorByStatusData?.data?.[rowIndex]?.paymentId ?? ""}
                                statusId={2}
                            />
                        </Box>
                    );
                },
            },
        },
    ];
    return {
        getHospitalMonitorByStatusData,
        column,
        pagination,
        // handleGenerateSuccess: handleGenerateDialogOpen,
        isTransferClaimHospitalNowLoading,
        mutateTransferClaimHospitalNow,
        setPaginate,
        handleRowSelected,
        onRowsSelected,
        handleSentTransfer,
        isGetHospitalMonitorByStatusDataLoading,
    };
};

export default usePendingTransferHook;
