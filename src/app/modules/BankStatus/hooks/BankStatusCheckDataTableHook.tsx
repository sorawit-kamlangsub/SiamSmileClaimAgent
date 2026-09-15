import { Box, IconButton } from "@mui/material";
import { MUIDataTableColumn } from "mui-datatables";
import SendIcon from "@mui/icons-material/Send";
import { numberWithCommas } from "../../../functionHelpers";
import { useState } from "react";
import { useAppSelector } from "../../../../redux";
import { useGetInquiryMonitors, useSentToBank } from "../bankStatusCheckAPI";
import { PaginationSortableDto, swalConfirm, swalError, swalSuccess } from "../../_common";
import dayjs from "dayjs";

const useBankStatusCheckDataTableHook = () => {
    const { searchBankStatusCheck } = useAppSelector((state) => state.bankStatusCheck);
    const [paginated, setPaginated] = useState<PaginationSortableDto>({
        page: 1,
        recordsPerPage: 10,
    });
    const { data: getInquiryMonitorsData, isLoading: getInquiryMonitorsIsLoading } = useGetInquiryMonitors({
        searchDetail: searchBankStatusCheck.searchDetail,
        page: paginated.page,
        recordsPerPage: paginated.recordsPerPage,
    });

    const handleSuccess = () => {
        swalSuccess("แจ้งเตือน", "ทำรายการสำเร็จ");
    };

    const handleError = (err: string) => {
        swalError("แจ้งเตือน", err);
    };

    const { mutate: sentToBankMutate, isLoading: sentToBankIsLoading } = useSentToBank(handleSuccess, handleError);

    const columns: MUIDataTableColumn[] = [
        {
            name: "paymentCode",
            label: "เลขที่ CL",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (rowIndex) => {
                    return getInquiryMonitorsData?.data?.[rowIndex]?.paymentCode ?? "-";
                },
            },
        },
        {
            name: "createdDate",
            label: "วันที่สร้างเคลม",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (rowIndex) => {
                    const formatDate = getInquiryMonitorsData?.data?.[rowIndex]?.createdDate
                        ? dayjs(getInquiryMonitorsData?.data?.[rowIndex]?.createdDate).format("DD/MM/YYYY HH:mm:ss")
                        : "-";
                    return formatDate;
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
                    return getInquiryMonitorsData?.data?.[rowIndex]?.toAccountNo ?? "-";
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
                    return getInquiryMonitorsData?.data?.[rowIndex]?.toAccountName ?? "-";
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
                    return getInquiryMonitorsData?.data?.[rowIndex]?.toBank ?? "-";
                },
            },
        },
        {
            name: "totalNetPaidAmount",
            label: "จำนวนเงิน",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (rowIndex) => {
                    return (
                        <Box sx={{ textAlign: "end" }}>
                            {numberWithCommas(getInquiryMonitorsData?.data?.[rowIndex]?.totalNetPaidAmount ?? 0)}
                        </Box>
                    );
                },
            },
        },
        {
            name: "transferStatus",
            label: "สถานะโอนเงิน",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (rowIndex) => {
                    return (
                        <Box
                            sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                borderRadius: 3,
                                color: "#BF360C",
                                bgcolor: "#FCE8E6",
                                justifyItems: "center",
                                gap: "4px",
                                padding: "3px 12px",
                            }}
                        >
                            <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#BF360C" }} />
                            {getInquiryMonitorsData?.data?.[rowIndex]?.transferStatusName ?? "-"}
                        </Box>
                    );
                },
            },
        },
        {
            name: "",
            label: "ดำเนินการ",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (rowIndex) => {
                    return (
                        <IconButton
                            sx={{
                                backgroundColor: "#00569D",
                                color: "#FFFFFF",
                                scale: -0.8,
                                "&:hover": {
                                    backgroundColor: "#014074",
                                    color: "#FFFFFF",
                                },
                            }}
                            onClick={() => {
                                swalConfirm(
                                    "ยืนยันการสอบถามธนาคาร",
                                    "ยืนยันการทำรายการเพื่อสอบถามรายการโอนกับทางธนาคารใช่หรือไม่",
                                    "ยืนยัน",
                                    "ยกเลิก"
                                ).then((res) => {
                                    if (res.isConfirmed) {
                                        sentToBankMutate({
                                            refCode: getInquiryMonitorsData?.data?.[rowIndex]?.payListHeaderId,
                                        });
                                    }
                                });
                            }}
                        >
                            <SendIcon sx={{ transform: "scaleX(-1) scale(0.8)" }} />
                        </IconButton>
                    );
                },
            },
        },
    ];
    return {
        columns,
        getInquiryMonitorsData,
        getInquiryMonitorsIsLoading,
        paginated,
        setPaginated,
        sentToBankIsLoading,
    };
};

export default useBankStatusCheckDataTableHook;
