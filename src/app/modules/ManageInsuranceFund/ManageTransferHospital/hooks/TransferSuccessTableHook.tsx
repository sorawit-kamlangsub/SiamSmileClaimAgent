import { Box } from "@mui/material";
import { MUIDataTableColumn } from "mui-datatables";
import { PaginationResultDto, PaginationSortableDto } from "../../../_common";
// import { useAppDispatch } from "../../../../../redux";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { numberWithCommas } from "../../../../functionHelpers";
import SpitButtonAction from "../components/SpitButtonAction";
import { useGetHospitalMonitorDataByStatus } from "../transferClaimHospitalAPI";

type useTransferSuccessTableHookProp = {
    statusId: number | undefined;
    searchDetail: string;
};

const useTransferSuccessTableHook = ({ statusId, searchDetail }: useTransferSuccessTableHookProp) => {
    // const dispatch = useAppDispatch();

    const [paginate, setPaginate] = useState<PaginationSortableDto>({ page: 1, recordsPerPage: 10 });
    const [onRowsSelected, setOnRowsSelected] = useState<any[]>([]);
    const [rowsSelected, setRowsSelected] = useState<any[]>([]);

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
            label: "วันที่โอนเงิน",
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
                            {statusId === 3 ? (
                                <Box sx={{ bgcolor: "#E7F8EE", color: "#429B7B", borderRadius: 2, p: "7px" }}>
                                    {getHospitalMonitorByStatusData?.data?.[rowIndex]?.statusNameTH}
                                </Box>
                            ) : statusId === 5 ? (
                                <Box sx={{ bgcolor: "#f8e7e7", color: "#BF360C", borderRadius: 2, p: "7px" }}>
                                    {getHospitalMonitorByStatusData?.data?.[rowIndex]?.statusNameTH}
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
                            {getHospitalMonitorByStatusData?.data?.[rowIndex]?.isSelectable ? (
                                <Box sx={{ bgcolor: "#EEF5F8", color: "#A0ACB6", borderRadius: 2, p: "7px" }}>
                                    {getHospitalMonitorByStatusData?.data?.[rowIndex]?.statusNameTH}
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
                                paymentId={getHospitalMonitorByStatusData?.data?.[rowIndex]?.paymentId ?? ""}
                                statusId={statusId}
                            />
                        </Box>
                    );
                },
            },
        },
    ];
    return {
        column,
        paginate,
        pagination,
        setPaginate,
        handleRowSelected,
        onRowsSelected,
        handleSentTransfer,
        getHospitalMonitorByStatusData,
        isGetHospitalMonitorByStatusDataLoading,
    };
};

export default useTransferSuccessTableHook;
