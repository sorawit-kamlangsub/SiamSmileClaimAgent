import dayjs from "dayjs";
import { MUIDataTableColumn } from "mui-datatables";
import { numberWithCommas } from "../../../../functionHelpers";
import { Box, Typography } from "@mui/material";
import { PaginationResultDto, PaginationSortableDto, swalInfo } from "../../../_common";
import { useMemo, useState } from "react";
import { useAppDispatch } from "../../../../../redux";
import { setDialogOpen } from "../store/generateTransferSlice";
import { useGetHospitalTransferMonitorData } from "../manageTransferHospitalAPI";

type GenerateGroupTransferHookProps = {
    statusId: number | undefined;
    searchDetail: string;
};

const useGenerateGroupTransferHook = ({ statusId, searchDetail }: GenerateGroupTransferHookProps) => {
    const dispatch = useAppDispatch();
    const [paginate, setPaginate] = useState<PaginationSortableDto>({ page: 1, recordsPerPage: 10 });
    const [onRowsSelected, setOnRowsSelected] = useState<any[]>([]);
    const [rowsSelected, setRowsSelected] = useState<any[]>([]);

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
                                swalInfo(getHospitalTransferData?.data?.[rowIndex]?.caseId ?? "", "");
                            }}
                            sx={{ color: "#4389B5", cursor: "pointer" }}
                        >
                            {getHospitalTransferData?.data?.[rowIndex]?.caseNo}
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
                    const formatDate = getHospitalTransferData?.data?.[rowIndex].billSentDate
                        ? dayjs(getHospitalTransferData?.data?.[rowIndex]?.billSentDate).format("DD/MM/YYYY")
                        : "-";
                    return formatDate;
                },
            },
        },
        {
            name: "insuredName",
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
                setCellHeaderProps: () => ({
                    style: { textAlign: "center" },
                }),
                customBodyRenderLite: (rowIndex) => {
                    const formatNumberAmount = numberWithCommas(getHospitalTransferData?.data?.[rowIndex]?.amount ?? 0);
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
                                {getHospitalTransferData?.data?.[rowIndex]?.statusNameTH}
                            </Box>
                        </Box>
                    );
                },
            },
        },
    ];

    const handleGenerateDialogOpen = () => {
        dispatch(setDialogOpen({ isOpen: true, generateListData: rowsSelected }));
    };

    const handleRowSelected = (
        _currentRowsSelected: any[],
        _allRowsSelected: any[],
        selectedRowIndexes: number[] = []
    ) => {
        setOnRowsSelected(selectedRowIndexes);

        const rows = selectedRowIndexes.map((rowIndex) => getHospitalTransferData?.data[rowIndex]);
        setRowsSelected(rows);
    };

    const { data: getHospitalTransferData, isLoading: isGetHospitalTransferLoading } =
        useGetHospitalTransferMonitorData({ statusId: statusId, hospitalName: searchDetail, paginate });

    useMemo(() => {
        setOnRowsSelected([]);
        setRowsSelected([]);
    }, [paginate, getHospitalTransferData?.data]);

    const pagination: PaginationResultDto = useMemo(
        () => ({
            totalAmountRecords: getHospitalTransferData?.totalAmountRecords ?? 0,
            totalAmountPages: getHospitalTransferData?.totalAmountPages ?? 0,
            currentPage: getHospitalTransferData?.currentPage ?? 0,
            recordsPerPage: getHospitalTransferData?.recordsPerPage ?? 0,
            pageIndex: getHospitalTransferData?.pageIndex ?? 0,
        }),
        [getHospitalTransferData]
    );

    return {
        getHospitalTransferData,
        column,
        pagination,
        isGetHospitalTransferLoading,
        handleGenerateSuccess: handleGenerateDialogOpen,
        setPaginate,
        handleRowSelected,
        onRowsSelected,
    };
};

export default useGenerateGroupTransferHook;
