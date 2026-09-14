# `_common` (`src/app/modules/_common`)

Cross-cutting UI/helpers. Barrel `index.ts` re-exports `components/`, `commonFunctions`,
`commonValidators`, `sweetAlert`, `types` — but **`components/index.ts` itself only re-exports
`ExternalLink`, `LoadingPlaceHolder`, `CustomFormik/*`, `DataTable/*`. `CustomComponent/*` and
`ClaimAgent/*` are NOT in the barrel** — always deep-import those, e.g.
`import CustomPaper from ".../_common/components/CustomComponent/CustomPaper"`.

## `components/DataTable/`

- `StandardDataTable.tsx` — the project's `mui-datatables` wrapper: Thai `textLabels`,
  server-side pagination wiring (`onChangePage`/`onChangeRowsPerPage`/`onColumnSortChange`/
  `onFilterChange` all call `setPaginated`), themed header color via `color` prop. Key props:
  `name` (required, id'd as `${name}-data-table`), `data`, `columns` (from `MUIDataTableProps`),
  `isLoading`, `paginated: PaginationResultDto`, `setPaginated`, `color`, `displayToolbar`,
  `displayFooter`, `columnHeaderAlign`, `options` (merged **after** defaults, so it overrides
  them), `rowHover`, `rowBackgroundColor`. Defaults: `serverSide: true`, `selectableRows: "none"`,
  print/download/filter/search/viewColumns off, `responsive: "standard"` (gives horizontal
  scroll on narrow viewports for free).
- `ColumnDateTime.tsx`, `ColumnIsActive.tsx`, `ColumnNumber.tsx`, `ColumnLastModified.tsx` — cell
  renderers (date+BE-year, boolean Chip, thousand-separated number, "user + date" combo).

`cellAlignOptions(options)` and `defaultOptionStandardDataTable` / `smallSizeFooter` live in
[`src/app/functionHelpers.ts`](../../src/app/functionHelpers.ts), **not** in this folder — import
from there.

## `components/CustomFormik/`

All in the barrel except the ones noted: `FormikAutocomplete`, `FormikAutocompleteApi`,
`FormikAutocompleteMultiple`, `FormikCheckbox`, `FormikCheckboxGroup`, `FormikDateField`,
`FormikDropdown`, `FormikDropdownMultiple`, `FormikFileUploader`, `FormikRadioGroup`,
`FormikRating`, `FormikSlider`, `FormikSwitch`, `FormikTextField`, `FormikTextMask`,
`FormikTextMaskCardId`, `FormikTextMaskPhone`, `FormikTextNumber`.

**NOT in `CustomFormik/index.ts`, deep-import these**: `FormikDatePicker`,
`FormikDateTimePicker`, `FormikTimePicker`, `FormikMobileTimePicker`, `FormikAutocompleteApi`.

Common shape: `{ name, label, formik: FormikProps<any>, ...MUI props }`. `FormikDropdown` also
writes a sibling `${name}_selectedText` field on the form — declare that field in your values
type if you use it. `FormikDatePicker`/`FormikTimePicker` wrap MUI-X pickers with Thai locale +
Buddhist-era display baked in (`useThaiLanguage=true, useBuddhistEra=true` by default).

Infra: `MUIAdapterDayjsBE.ts` (Buddhist-era dayjs adapter), `MUIDateTimeThProvider.tsx`,
`MUILocaleTh.ts`, `FormikFocusError.tsx` (wraps fields with `focus-formik-error`'s
`<FocusError>`), `Helpers.tsx` (`handleValidationDateOrTime`).

## `components/ClaimAgent/CustomDropdown/` (deep-import, not in barrel)

API-backed dropdown wrappers — each fetches master data via a `coreClaimMastersApi.ts` hook,
prepends an optional "ทั้งหมด" option, forwards to `FormikDropdown`/`FormikAutocomplete`:
`BankAccountRelationTypeDropDown`, `BankAutocomplete`, `CD10Autocomplete` (ICD-10 diagnosis),
`CaseTypeDropDown`, `ChiefComplaintAutocomplete`, `ContactPersonTypeDropDown`,
`DocumentRecipientTypeDropDown`, `HospitalDropdown`, `MedicalTypeDropDown`,
`PaymentStatusDropDown`, `ProvinceDropdown`, `RelationTypeDropdown`,
`SchoolByProvinceAutocomplete`, `SearchTypeDropDown`, `TitlePersonDropdown`,
`UserAutocompleteApi`, `ZebraCarOwnerDropDown`, and (⚠ filename starts with a stray Thai
character U+0FBA, copy the import path verbatim) `ฺBranchAutocomplete.tsx`. Usage pattern:
`<PaymentStatusDropDown name="statusId" formik={formik} withAllOption />`.

## `components/CustomComponent/` (deep-import, not in barrel)

| File | Purpose |
|---|---|
| `CustomPaper.tsx` | `<Paper variant="outlined" sx={{p:"1.5rem", lineHeight:"50px", mb:"1.5rem"}}>` — the standard section container |
| `CustomBox.tsx` | Bordered white `<Box>` — lighter section wrapper |
| `CustomDisplayText.tsx` | `{label, value?, xs=12, sm=6, md=3, lg}` — read-only "label : value" Grid item, value bold `#007AC1`, `-` when empty |
| `CustomTypographyWithGrid.tsx` | Older fixed-breakpoint variant of `CustomDisplayText` |
| `CustomTypographyWithOutGrid.tsx` | Same label/value pair without the Grid wrapper |
| `HeadingWithColor.tsx` | Colored section heading bar, left accent border. `{text?, color?: "blue"\|"green"\|"red"\|"yellow"\|"pink"\|"orange" (default blue), button?, icon?, sx?}`; also exports `backgroundColor`/`colorLine` maps |
| `LinearLoading.tsx` | `{children, isLoading, sx}` — swaps children for `LinearProgress` inside a CustomPaper-styled Paper |

## Top-level `components/`

`ExternalLink.tsx` (react-router `Link` + external-link glyph), `LoadingPlaceHolder.tsx`
(`{children, isLoading, height=300, isError, error, isEmpty, emptyMessage}`),
`FormikFocusError.tsx`, `Helpers.tsx`.

## `sweetAlert.ts` (in the barrel) vs `customSweetAlert.ts` (deep-import only)

`sweetAlert.ts`: `swalInfo`, `swalWarning`, `swalConfirm` (returns `{isConfirmed}`), `swalError`,
`swalSuccess`, `swalWarningNotOutsideClick` — all thin `Swal.fire()` wrappers.

`customSweetAlert.ts` — richer HTML-string-based dialogs, **not** in the barrel:
`swalExtraPaymentSuccess`, `swalClaimListSuccess`, `swalConfirmAction`. Demo:
`src/app/pages/SweetAlertTestPage.tsx` (route `/test-sweetalert`).

## `types.ts` (in the barrel)

`PaginationResultDto` (`totalAmountRecords, totalAmountPages, currentPage, recordsPerPage,
pageIndex`), `PaginationDto` (`page, recordsPerPage`), `SortDto` (`orderingField,
ascendingOrder`), `PaginationSortableDto = PaginationDto & SortDto`, `ServiceResponse<T>`
(mirrors the generated `*ServiceResponse` envelope shape), `ServiceResponsePagination<T>`.

## `functionHelpers.ts` — not under `_common`, but the other universal import (`src/app/functionHelpers.ts`)

Money/number: `numberWithCommas(x, decimalPlaces=2)`, `decimalCheck`,
`handleNumberInputChange`/`handleFloatingInputChange`/`handleOnePointInputChange` (onInput
sanitizers for text fields). Date: `formatDateString(dateString?, format="DD/MM/BBBB HH:mm:ss")`
(the primary display formatter — `BBBB` = Buddhist year), `formatDate`, `toDayjsOrNull`,
`toDateString`, `toUtcOffset`, `calculatePolicyAgeText`. Table: `cellAlignOptions`,
`defaultOptionStandardDataTable`, `smallSizeFooter`, `styleColLeft`/`Center`/`Right`. Status→color
maps for `<Chip>`: `backgroundColorMapClaimStatus`/`colorMapClaimStatus`,
`...CaseStatus`, `...Decision`, `...PaymentStatus`, `...AppStatus`, `...ClaimTransactionType`
(each `Record<number, hexColor>`, keyed by the relevant status id). Enums: `IncidentType`,
`CoverageType`, `MedicalType`, `CauseOfIncident`. Misc: `formatPhone`, `decodeFromBase64`,
`AuthCheckPermission`, `cleanPayload`, `toExcel`/`toExcelPost`/`jsonToExcel`, `setBankLogo`,
`setBenefitIcons`, `PRODUCT_TYPE_GROUP`/`isProductType`.
