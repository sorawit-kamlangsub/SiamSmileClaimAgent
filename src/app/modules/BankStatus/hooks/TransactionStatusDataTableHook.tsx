import { MUIDataTableColumn } from "mui-datatables";
import { useGetInquiryDetailMonitors } from "../bankStatusCheckAPI";
import dayjs from "dayjs";

type TransactionStatusDataTableProp = {
    transactionId: string;
};

const useTransactionStatusDataTableHook = ({ transactionId }: TransactionStatusDataTableProp) => {
    const { data: getInquiryDetailData, isLoading: getInquiryDetailIsLoading } = useGetInquiryDetailMonitors({
        payTransferTransactionId: transactionId,
    });

    const columns: MUIDataTableColumn[] = [
        {
            name: "transRefNo",
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
                customBodyRenderLite: (_rowIndex) => {
                    const formatDate = getInquiryDetailData?.data?.createdDate
                        ? dayjs().format("DD/MM/YYYY HH:mm:ss")
                        : "-";
                    return formatDate;
                },
            },
        },
        {
            name: "payerBankName",
            label: "BankService",
            options: {
                filter: false,
                sort: false,
            },
        },
        {
            name: "statusBank",
            label: "ResponseCode",
            options: {
                filter: false,
                sort: false,
            },
        },
        {
            name: "descriptionTH",
            label: "ResponseMessage",
            options: {
                filter: false,
                sort: false,
            },
        },
    ];

    return { getInquiryDetailData, getInquiryDetailIsLoading, columns };
};

export default useTransactionStatusDataTableHook;
