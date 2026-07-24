import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useFormik } from "formik";
import { Box, Grid, Button, IconButton, Tooltip } from "@mui/material";
import { MUIDataTableColumnDef } from "mui-datatables";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import { ExtraPaymentListItem, RetryTransferResult, TransferStatusId } from "../store/ExtraPayment.types";
import { setClaimOnLineId, setCpgNo } from "../store/extraPaymentSlice";
import { cellAlignOptions, defaultOptionStandardDataTable, smallSizeFooter } from "../../../functionHelpers";
import CustomPaper from "../../_common/components/CustomComponent/CustomPaper";
import { StandardDataTable } from "../../_common";
import { useGetExtraPaymentList } from "../hooks/useGetExtraPaymentList";
import { TransferStatusChip } from "../components/TransferStatusChip";
import { ExtraPaymentSearchModal } from "../components/ExtraPaymentSearchModal";
import { EditBankAccountModal } from "../components/EditBankAccountModal";
import { RetryTransferSuccessModal } from "../components/RetryTransferSuccessModal";
import BranchAutocomplete from "../../_common/components/ClaimAgent/CustomDropdown/ฺBranchAutocomplete";
import PaymentStatusDropDown from "../../_common/components/ClaimAgent/CustomDropdown/PaymentStatusDropDown";
import { isRetryableTransferStatus } from "../hooks/TransferStatus";

interface StatusFilterFormValues {
    branchId?: number;
    branchId_selectedText: string;
    statusId?: number;
    statusId_selectedText: string;
}

// const statusDropdownOptions = transferStatusFilterOptions.filter((opt) => opt.id !== null);

const REF = {
    primary: "#0b74bd",
    primaryDark: "#075d99",
    soft: "#e6f1fd",
    line: "#dce8f4",
    lineStrong: "#c4d7ea",
    muted: "#718096",
    text: "#243447",
    success: "#15803d",
    successSoft: "#f0f8f1",
    successLine: "#d1e9d6",
};

export const ExtraPaymentListPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const formik = useFormik<StatusFilterFormValues>({
        initialValues: {
            branchId: 0,
            branchId_selectedText: "",
            statusId: 0,
            statusId_selectedText: "",
        },
        onSubmit: () => {},
    });
    const statusFilter = formik.values.statusId ?? null;

    const { data, isLoading, refetch } = useGetExtraPaymentList(statusFilter);

    const [searchModalOpen, setSearchModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ExtraPaymentListItem | null>(null);
    const [retryResult, setRetryResult] = useState<RetryTransferResult | null>(null);

    const handleViewDetail = (cpgNo: string) => {
        // TODO: เปลี่ยน path ให้ตรงกับ route จริงของหน้า "ค้นหาเคลมออนไลน์ > รายละเอียด"
        navigate(`/claim-online/detail/${cpgNo}`);
    };

    const handleSearchFound = (result: { cpgNo: string; claimOnLineId?: number }) => {
        dispatch(setCpgNo(result.cpgNo));
        dispatch(setClaimOnLineId(result.claimOnLineId ?? null));
        navigate("/payment-monitor/extra-payment");
    };

    const handleRetrySuccess = (result: RetryTransferResult) => {
        setEditingItem(null);
        setRetryResult(result);
    };

    const handleCloseSuccessModal = () => {
        setRetryResult(null);
        refetch();
    };

    const columns: MUIDataTableColumnDef[] = [
        {
            name: "cpgNo",
            label: "เลขที่ CPG",
            options: { filter: false, sort: false, ...cellAlignOptions({}) },
        },
        {
            name: "createdAt",
            label: "วันที่สร้างเคลม",
            options: { filter: false, sort: false, ...cellAlignOptions({}) },
        },
        {
            name: "insuredName",
            label: "ชื่อผู้เอาประกัน",
            options: { filter: false, sort: false, ...cellAlignOptions({}) },
        },
        {
            name: "branchName",
            label: "สาขา",
            options: { filter: false, sort: false, ...cellAlignOptions({}) },
        },
        {
            name: "amount",
            label: "จำนวนเงิน",
            options: {
                sort: false,
                filter: false,
                ...cellAlignOptions({}),
                customBodyRender: (value: number) => value.toLocaleString("th-TH", { minimumFractionDigits: 2 }),
            },
        },
        {
            name: "extraTransferAmount",
            label: "โอนเพิ่ม",
            options: {
                sort: false,
                filter: false,
                ...cellAlignOptions({}),
                customBodyRender: (value: number) => value.toLocaleString("th-TH", { minimumFractionDigits: 2 }),
            },
        },
        {
            name: "statusId",
            label: "สถานะ",
            options: {
                sort: false,
                filter: false,
                ...cellAlignOptions({}),
                customBodyRender: (value: TransferStatusId) => <TransferStatusChip statusId={value} />,
            },
        },
        {
            name: "reason",
            label: "สาเหตุ",
            options: {
                sort: false,
                filter: false,
                customBodyRender: (value: string | null) => value ?? "-",
            },
        },
        {
            name: "action",
            label: "ดำเนินการ",
            options: {
                sort: false,
                filter: false,
                customBodyRenderLite: (dataIndex) => {
                    const row = data[dataIndex];
                    return (
                        <Box display="flex" gap={1}>
                            <Tooltip title="ดูรายละเอียด" arrow placement="top" enterDelay={100} leaveDelay={50}>
                                <IconButton
                                    size="small"
                                    color="info"
                                    sx={{
                                        bgcolor: REF.soft,
                                        borderColor: REF.lineStrong,
                                    }}
                                    onClick={() => handleViewDetail(row.cpgNo)}
                                >
                                    <VisibilityIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            {isRetryableTransferStatus(row.statusId) && (
                                <Tooltip
                                    title="แก้ไขบัญชีรับสินไหม"
                                    arrow
                                    placement="top"
                                    enterDelay={100}
                                    leaveDelay={50}
                                >
                                    <IconButton
                                        size="small"
                                        sx={{ bgcolor: "#FFF1CD", color: "#a56e07" }}
                                        onClick={() => setEditingItem(row)}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Box>
                    );
                },
            },
        },
    ];

    return (
        <Box>
            <CustomPaper>
                <Grid container spacing={2} alignItems="center" p="3pxx">
                    <Grid item xs={12} sm={3}>
                        <BranchAutocomplete name="branchId" formik={formik} withAllOption />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <PaymentStatusDropDown name="statusId" formik={formik} withAllOption />
                    </Grid>
                    <Grid item xs={12} sm={8} md={2} lg={1.5}>
                        <Button
                            variant="contained"
                            startIcon={<AddCircleOutlineIcon />}
                            sx={{ height: 39, alignItems: "center" }}
                            onClick={() => setSearchModalOpen(true)}
                            fullWidth
                        >
                            โอนเพิ่ม
                        </Button>
                    </Grid>
                </Grid>
            </CustomPaper>

            <Box mt={2}>
                <CustomPaper>
                    <StandardDataTable
                        name="extra-payment-list-table"
                        data={data}
                        columns={columns}
                        isLoading={isLoading}
                        color="primary"
                        columnHeaderAlign="center"
                        displayToolbar={false}
                        options={defaultOptionStandardDataTable}
                        sx={smallSizeFooter}
                        rowHover={false}
                    />
                </CustomPaper>
            </Box>

            <ExtraPaymentSearchModal
                open={searchModalOpen}
                onClose={() => setSearchModalOpen(false)}
                onFound={handleSearchFound}
            />

            <EditBankAccountModal
                open={!!editingItem}
                item={editingItem}
                onClose={() => setEditingItem(null)}
                onRetrySuccess={handleRetrySuccess}
            />

            <RetryTransferSuccessModal open={!!retryResult} result={retryResult} onConfirm={handleCloseSuccessModal} />
        </Box>
    );
};
