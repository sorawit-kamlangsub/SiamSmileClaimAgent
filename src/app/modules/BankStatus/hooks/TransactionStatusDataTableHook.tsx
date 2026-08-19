import { MUIDataTableColumn } from "mui-datatables";

const useTransactionStatusDataTableHook = () => {
    const dataMock = [
        {
            claimPayTransactionCode: "CT690400139",
            createdDate: "11/10/2569 12:24:23",
            bankService: "BBL",
            status: "Fail",
            responseCode: "W003",
            responseMessage: "ปัญหาจากระบบ",
        },
        {
            claimPayTransactionCode: "CT690400140",
            createdDate: "11/10/2569 13:02:11",
            bankService: "KTB",
            status: "Success",
            responseCode: "S000",
            responseMessage: "ทำรายการสำเร็จ",
        },
        {
            claimPayTransactionCode: "CT690400141",
            createdDate: "11/10/2569 13:45:57",
            bankService: "SCB",
            status: "Pending",
            responseCode: "P001",
            responseMessage: "รอผลการโอนเงินจากธนาคาร",
        },
        {
            claimPayTransactionCode: "CT690400142",
            createdDate: "11/10/2569 14:10:32",
            bankService: "KBANK",
            status: "Fail",
            responseCode: "E404",
            responseMessage: "ไม่พบเลขที่บัญชีปลายทาง",
        },
    ];

    const columns: MUIDataTableColumn[] = [
        {
            name: "claimPayTransactionCode",
            label: "ClaimPayTransactionCode",
            options: {
                filter: false,
                sort: false,
            },
        },
        {
            name: "createdDate",
            label: "CreatedDate",
            options: {
                filter: false,
                sort: false,
            },
        },
        {
            name: "bankService",
            label: "BankService",
            options: {
                filter: false,
                sort: false,
            },
        },
        {
            name: "responseCode",
            label: "ResponseCode",
            options: {
                filter: false,
                sort: false,
            },
        },
        {
            name: "responseMessage",
            label: "ResponseMessage",
            options: {
                filter: false,
                sort: false,
            },
        },
    ];

    return { dataMock, columns };
};

export default useTransactionStatusDataTableHook;
