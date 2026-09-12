# ClaimAgent - Project Memory

## Architecture
- React + TypeScript + Vite project
- APIGW pattern: frontend proxies through gateway to multiple backend services
- Base gateway URL: `VITE_APIGW_CLAIM_FUND_API_URL` → `/api/ClaimFund/`
- Auth: SSO (OIDC) with keycloak

## Swagger
- Available at: `https://lcjjwsfc-5001.asse.devtunnels.ms/swagger/v1/swagger.json`
- Dev tunnel: `lcjjwsfc-5001.asse.devtunnels.ms` (need curl to bypass interstitial)

## API Endpoints (from swagger `/api/ClaimFund/`)

### Search
- `GET /Setting/SearchClaimOrCase?searchDetail=`

### Masters
- `GET /Masters/GetAdjustmentReasons` (for adjust)
- `GET /Masters/GetRefundReasons` (for refund, returns `{ id, name }[]`)

### Refund
- `POST /Refund/RefundMonitor?Page=&recordsPerPage=` body `{ branceId, refundStatusId }`
- `GET /Refund/SaveRefundDetails?caseId=` - detail page data
- `GET /Refund/SaveRefundAccountDetail?paymentId=` - account details
- `GET /Refund/GetClaimTransaction?caseId=&Page=&recordsPerPage=` - transaction history
- `GET /Refund/TransferHistory?caseId=` - pay transfer history (returns `{ payTransferDetails: [] }`)
- `GET /Refund/GetDecreaseTransaction?caseId=&Page=&recordsPerPage=` - refund history

### Adjust
- `GET /AdditionalTransfer/AdditionalTransferDetails?caseId=`
- `GET /AdditionalTransfer/GetClaimTransactions?caseId=` (note: plural)
- `POST /AdditionalTransfer/SaveAdditionalTransfer`

## Table Template Pattern (IMPORTANT)

### Column definitions
```tsx
const columns: MUIDataTableColumn[] = [
    // Simple text column
    { name: "fieldName", label: "Header", options: { filter: false, sort: false } },

    // Date column
    {
        name: "createdDate",
        label: "วันที่ทำรายการ",
        options: {
            filter: false,
            sort: false,
            customBodyRenderLite: (rowIndex) =>
                data[rowIndex]?.createdDate
                    ? dayjs(data[rowIndex].createdDate).format("DD/MM/YYYY HH:mm:ss")
                    : "-",
        },
    },

    // Amount column (right aligned)
    // IMPORTANT: do NOT use customHeadRender for headers - it REPLACES the whole
    // <th> and loses the blue/grey header background. Use setCellHeaderProps instead
    // so the native TableHeadCell keeps the theme background color.
    {
        name: "amount",
        label: "จำนวนเงิน",
        options: {
            filter: false,
            sort: false,
            setCellHeaderProps: () => ({ align: "right" as const }),
            customBodyRenderLite: (rowIndex) => (
                <Box sx={{ textAlign: "end" }}>{numberWithCommas(data[rowIndex]?.amount ?? 0)}</Box>
            ),
        },
    },

    // Button column
    {
        name: "",
        label: "ดำเนินการ",
        options: {
            filter: false,
            sort: false,
            customBodyRenderLite: (dataIndex) => (
                <IconButton size="small" onClick={() => handleAction(data[dataIndex])}>
                    <Icon sx={{ color: "#1565C0", fontSize: 20 }} />
                </IconButton>
            ),
        },
    },
];
```

### Table component pattern
```tsx
<Paper elevation={2} sx={{ borderRadius: "8px" }}>
    <StandardDataTable
        name="tableName"           // lowercase
        title=""                   // empty for detail tables
        data={data?.data ?? []}
        columns={columns}
        color="grey"               // grey for detail, primary for listing
        paginated={pagination}     // PaginationResultDto
        setPaginated={setPaginated} // PaginationSortableDto state
        isLoading={isLoading}
        displayToolbar={false}     // hide search/filter toolbar
        displayFooter={false}      // hide pagination footer (for small lists)
    />
</Paper>
```

### Refund Monitor Table columns
```tsx
{ name: "refundNo", label: "เลขที่ Refund" }      // NOT transactionCode
{ name: "claimNo", label: "เลขที่ CL" }
{ name: "caseNo", label: "เลขที่ CC" }
{ name: "createdDate", label: "วันที่สร้างเคลม" }  // dayjs format
{ name: "customerName", label: "ชื่อผู้เอาประกัน" }
{ name: "totalNetPaidAmount", label: "จำนวนเงิน" }  // NOT amount
{ name: "refundAmount", label: "โอนคืน" }
{ name: "refundStatusNameTH", label: "สถานะ" }      // StatusPill component
// No reason column (swagger remark is int32)
```

### Refund Transaction Table columns
```tsx
{ name: "transactionDate", label: "วันที่ทำรายการ" }
{ name: "claimTransactionTypeName", label: "ประเภทรายการ" }
{ name: "createdByFullName", label: "ผู้ทำรายการ" }
{ name: "amountTotal", label: "จำนวนเงิน" }       // right aligned
{ name: "remark", label: "หมายเหตุ" }
```

### Transfer History pattern
```tsx
// Two separate HistoryTableCard components
// 1. "ประวัติการโอนเงิน" → /Refund/TransferHistory → payTransferDetails[]
// 2. "ประวัติการคืนเงิน" → /Refund/GetDecreaseTransaction → decreaseData[]
// Each has its own PaginationSortableDto state!
```

## Key TypeScript Types
```typescript
interface SaveRefundDetailsResponseDto {
    claimId: string;
    caseId: string;
    claimNo: string;
    customerName: string;
    createdByUserName: string;
    totalNetPaidAmount: number;
    countItem: number;
    additionalTransferLimit: number;
    caseDetails: CaseDetailDto[]; // { customerName, coverageTypeNameTH, caseNo, totalNetPaidAmount }
    account: AccountDetail; // { contactPerson, accountNo, accountName, bankId, bankName, phoneNumber }
}

interface RefundMonitorResponse {
    caseId: string;
    refundNo: string;
    claimNo: string;
    caseNo: string;
    createdDate: string;
    customerName: string;
    totalNetPaidAmount: number;
    refundAmount: number;
    refundStatusId: number;
    refundStatusNameTH: string;
}

interface RefundTransactionResponseDto {
    transactionDate: string;
    claimTransactionTypeName: string;
    createdByFullName: string;
    amountTotal: number;
    remark: string;
}
```

## Known Issues / Reminders
- FormikDateTimePicker NOT exported from `_common` - must import directly from `@mui/x-date-pickers/DateTimePicker` or custom path
- `TransferHistory` component has loading state with `Backdrop/CircularProgress`
- `ClaimSummaryHeader` uses Field component with Link for claimNo
- `ReceivingAccountCard` expects `addedDate` prop (map from `createdAccoutDetailDate` or `createdDate` in swagger)
- Search Dialog `showRefundStatusHint` shows hint below search field for refund page
- **NEVER use column `options.customHeadRender`** — mui-datatables replaces the whole `<th>` with the returned JSX, so it loses the header background color from `StandardDataTable` (`color="primary"` = blue, grey). This caused the amount column headers to stay white on manage/refund/detail. Use `setCellHeaderProps: () => ({ align: "right" as const })` for right-aligned headers instead.
- manage/refund/detail tables use `color="primary"` (blue columns) — see the `RightAlignedHeadCell`-free pattern above. History tables on the refund page pass `color="primary"` via the `color` prop added to `HistoryTableCard` (default grey so Adjust page is unaffected).

## User Preferences
- Tables must follow StandardDataTable template pattern
- Always use server-side pagination
- Amount columns must be right-aligned using `setCellHeaderProps` (NOT `customHeadRender`)
- Status columns use `StatusPill` component
- Date columns format: `DD/MM/YYYY HH:mm:ss`
- Empty-table text: default in ClaimFund tables = "กำลังโหลดข้อมูล..." → use `ClaimFundStandardDataTable` (wrapper of StandardDataTable, export จาก `_common` DataTable). DO NOT edit StandardDataTable/ `_common` defaults (shared by other teams).

## Refund Record Form (page manage/refund/detail "บันทึกรายการคืนเงิน")
- Fields (per HTML mockup): `refundTransferType` (dropdown จาก `/Masters/GetAdjustmentReasons?adjustmentTypeId=3`, ค่า `{ adjustmentReasonId, adjustmentReasonName }`), `refundSlipDateTime` (FormikDateTimePicker, required), `reasonId` (dropdown จาก `/Masters/GetRefundReasons`), `note` (required), `slipFile` (FormikFileUploader image/pdf, required)
- All required - validate with Thai error messages matching the mockup
- No ReceivingAccountCard/bank account card (removed per mockup)
