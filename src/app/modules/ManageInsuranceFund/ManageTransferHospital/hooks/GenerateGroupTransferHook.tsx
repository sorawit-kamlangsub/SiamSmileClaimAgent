import dayjs from "dayjs";
import { MUIDataTableColumn } from "mui-datatables";
import { numberWithCommas } from "../../../../functionHelpers";
import { Typography } from "@mui/material";
import { PaginationDto, swalInfo } from "../../../_common";
import { useMemo, useState } from "react";
import { useAppDispatch } from "../../../../../redux";
import { setDialogOpen } from "../store/generateTransferSlice";

type GenerateGroupTransferHookProps = {
    statusId: number | undefined;
    searchDetail: string;
};

const dataMock = [
    {
        caseId: "b1e2a4c6-1234-4a5b-8c9d-000000000001",
        hospitalRefNo: "REF-690900001",
        caseNo: "CC690900000018",
        billSentDate: "01/08/2569",
        customerName: "ด.ญ.กรณิกา สมวาจา",
        hospitalName: "โรงพยาบาลกรุงเทพ",
        amount: 3303.0,
        statusId: 1,
        statusName: "รอสร้างรายการ",
    },
    {
        caseId: "b1e2a4c6-1234-4a5b-8c9d-000000000002",
        hospitalRefNo: "REF-690900002",
        caseNo: "CC690900000042",
        billSentDate: "02/08/2569",
        customerName: "นายสมชาย ใจดี",
        hospitalName: "โรงพยาบาลพญาไท 3",
        amount: 1750.5,
        statusId: 1,
        statusName: "รอสร้างรายการ",
    },
    {
        caseId: "b1e2a4c6-1234-4a5b-8c9d-000000000003",
        hospitalRefNo: "REF-690900003",
        caseNo: "CC690900000057",
        billSentDate: "03/08/2569",
        customerName: "นางสาวรัชชนก สุวรรณโชค",
        hospitalName: "โรงพยาบาลศิริราช",
        amount: 5200.0,
        statusId: 1,
        statusName: "รอสร้างรายการ",
    },
    {
        caseId: "b1e2a4c6-1234-4a5b-8c9d-000000000004",
        hospitalRefNo: "REF-690900004",
        caseNo: "CC690900000020",
        billSentDate: "01/08/2569",
        customerName: "ด.ญ.กรณิกา สมวาจา",
        hospitalName: "โรงพยาบาลกรุงเทพ",
        amount: 3300.0,
        statusId: 1,
        statusName: "รอสร้างรายการ",
    },
];

const useGenerateGroupTransferHook = ({ statusId, searchDetail }: GenerateGroupTransferHookProps) => {
    const dispatch = useAppDispatch();
    const [paginate, setPaginate] = useState<PaginationDto>({ page: 1, recordsPerPage: 10 });
    const [onRowsSelected, setOnRowsSelected] = useState<any[]>([]);
    const [rowsSelected, setRowsSelected] = useState<any[]>([]);
    let data: any[] = [];

    if (statusId === 1) {
        data = dataMock;
    }

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
                                swalInfo(data?.[rowIndex]?.caseId, "");
                            }}
                            sx={{ color: "#4389B5", cursor: "pointer" }}
                        >
                            {data?.[rowIndex]?.caseNo}
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
                    const formatDate = data?.[rowIndex].billSentDate
                        ? dayjs(data?.[rowIndex]?.billSentDate).format("DD/MM/YYYY")
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
                    const formatNumberAmount = numberWithCommas(data?.[rowIndex]?.amount ?? 0);
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
                    return data?.[rowIndex]?.statusName;
                },
            },
        },
    ];

    //TODO - mutate handle when generate
    const handleGenerateDialogOpen = () => {
        console.info(`statusId: ${statusId} searchDetail: ${searchDetail}`);
        console.log(rowsSelected);
        dispatch(setDialogOpen({ isOpen: true, generateListData: rowsSelected }));
    };

    const handleRowSelected = (
        _currentRowsSelected: any[],
        _allRowsSelected: any[],
        selectedRowIndexes: number[] = []
    ) => {
        setOnRowsSelected(selectedRowIndexes);

        const rows = selectedRowIndexes.map((rowIndex) => data[rowIndex]);
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
        handleGenerateSuccess: handleGenerateDialogOpen,
        setPaginate,
        handleRowSelected,
        onRowsSelected,
    };
};

export default useGenerateGroupTransferHook;
