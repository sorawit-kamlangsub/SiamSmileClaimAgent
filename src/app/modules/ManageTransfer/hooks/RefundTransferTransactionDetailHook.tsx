import { MUIDataTableColumn } from "mui-datatables";
import { useGetRefundDetailMonitors } from "../repayAPI";
import dayjs from "dayjs";

type RefundTransferTransactionDetailProp = {
    transactionId: string;
};

const useRefundTransferTransactionDetailHook = ({ transactionId }: RefundTransferTransactionDetailProp) => {
    const { data: getRefundDetailData, isLoading: getRefundDetailIsLoading } = useGetRefundDetailMonitors({
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
                    const formatDate = getRefundDetailData?.data?.createdDate
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
    return { columns, getRefundDetailData, getRefundDetailIsLoading };
};

export default useRefundTransferTransactionDetailHook;
