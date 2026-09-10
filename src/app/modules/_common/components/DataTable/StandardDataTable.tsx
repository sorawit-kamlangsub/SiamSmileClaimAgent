import {
    CircularProgress,
    PaletteColor,
    PaletteOptions,
    SxProps,
    Theme,
    ThemeProvider,
    Typography,
    createTheme,
    styled,
    useTheme,
} from "@mui/material";
import { Property } from "csstype";
import MUIDataTable, { MUIDataTableOptions, MUIDataTableProps } from "mui-datatables";
import React from "react";
import { PaginationResultDto, PaginationSortableDto } from "../../types";

const StyledMUIDataTable = styled(MUIDataTable)();

type StandardDataTableProps = {
    /**
     * ชื่อของตาราง เป็นตัวเล็กทั้งหมด (ใช้ในการ test)
     */
    name: string;

    /**
     * หัวตาราง
     */
    title?: string;

    /**
     * ข้อมูลที่จะแสดงในตาราง
     */
    data?: { [key: string]: any }[];

    /**
     * isLoading สำหรับแสดง loading จาก react query
     * @default false
     */
    isLoading?: boolean;

    /**
     * pagination ของตารางจาก response ของ api
     */
    paginated?: PaginationResultDto;

    /**
     * จำนวนแถวต่อหน้า เป็น array ของ number
     * @default [5, 10, 15, 20, 30, 50]
     */
    rowsPerPage?: number[];

    /**
     * ฟังก์ชันสำหรับ set pagination ของตาราง
     * @param paginated
     */
    setPaginated?: React.Dispatch<React.SetStateAction<PaginationSortableDto>>;

    /**
     * สีของตาราง (หากไม่ set จะใช้สีเทา)
     * @default undefined
     */
    color?: keyof PaletteOptions;

    /**
     * แสดง toolbar ของตาราง
     * @default true
     */
    displayToolbar?: boolean;

    /**
     * แสดง footer ของตาราง
     * @default true
     */
    displayFooter?: boolean;

    /**
     * จัดตำแหน่งของหัวตาราง
     * @default "flex-start"
     */
    columnHeaderAlign?: Property.JustifyContent;

    disableToolbarSelect?: boolean;

    /**
     * ฟังก์ชันสำหรับเลือกแถวในตาราง
     * @param currentRowsSelected
     * @param allRowsSelected
     */
    onRowSelectedIndex?:
        | ((currentRowsSelected: any[], allRowsSelected: any[], rowsSelected?: any[] | undefined) => void)
        | undefined;

    rowsSelected?: any[];

    options?: MUIDataTableOptions;
    sx?: SxProps<Theme>;
    rowHover?: boolean;
    rowBackgroundColor?: boolean;
    hideBorderBottom?: boolean;
} & Omit<MUIDataTableProps, "title" | "options">;

const StandardDataTable = ({
    name,
    title,
    isLoading = false,
    onRowSelectedIndex,
    rowsSelected,
    paginated = {
        totalAmountRecords: 0,
        currentPage: 0,
        recordsPerPage: 5,
    },
    rowsPerPage,
    setPaginated,
    color,
    displayToolbar = true,
    disableToolbarSelect = true,
    displayFooter = true,
    columnHeaderAlign = "flex-start",
    options,
    sx,
    rowHover = false,
    rowBackgroundColor = false,
    hideBorderBottom = false,
    ...muiDataTableProps
}: StandardDataTableProps) => {
    const theme = useTheme();

    const { totalAmountRecords, currentPage, recordsPerPage } = paginated;

    const defaultOptions: MUIDataTableOptions = {
        filterType: "checkbox",
        jumpToPage: true,
        print: false,
        download: false,
        filter: false,
        search: false,
        viewColumns: false,
        selectableRows: "none",
        rowsSelected: rowsSelected,
        serverSide: true,
        selectableRowsOnClick: false,
        onRowSelectionChange: onRowSelectedIndex,
        count: totalAmountRecords,
        page: currentPage ? currentPage - 1 : 0,
        // ห้ามเป็น 0: บาง response ตอนไม่มีข้อมูลส่ง recordsPerPage เป็น 0 มาจริง ๆ (ไม่ใช่ null/undefined)
        // ถ้าเป็น 0 mui-datatables จะคำนวณ Math.ceil(count/0) = NaN แล้ว "page >= NaN" เป็น false เสมอ
        // ทำให้ปุ่มเปลี่ยนหน้าไม่ถูก disable แม้ไม่มีข้อมูล
        rowsPerPage: recordsPerPage || (rowsPerPage ?? [5, 10, 15, 20, 30, 50])[0],
        rowsPerPageOptions: rowsPerPage ?? [5, 10, 15, 20, 30, 50],
        responsive: "standard",
        rowHover: rowHover,
        onChangePage: (currentPage) => {
            setPaginated &&
                setPaginated((previousState) => ({
                    ...previousState,
                    page: currentPage + 1,
                    recordsPerPage: recordsPerPage,
                }));
        },
        onChangeRowsPerPage: (numberOfRows) => {
            setPaginated &&
                setPaginated({
                    page: 1,
                    recordsPerPage: numberOfRows,
                });
        },
        onColumnSortChange: (changedColumn, direction) => {
            setPaginated &&
                setPaginated({
                    page: 1,
                    recordsPerPage: recordsPerPage,
                    orderingField: `${changedColumn}`,
                    ascendingOrder: direction === "asc" ? true : false,
                });
        },
        onFilterChange: (changedColumn) => {
            setPaginated &&
                setPaginated({
                    page: 1,
                    recordsPerPage: recordsPerPage,
                    orderingField: `${changedColumn}`,
                    ascendingOrder: true,
                });
        },
        textLabels: {
            body: {
                noMatch: "ไม่พบข้อมูล",
                toolTip: "Sort",
                columnHeaderTooltip: (column) => `จัดเรียงจาก ${column.label}`,
            },
            pagination: {
                next: "ถัดไป",
                previous: "ย้อนกลับ",
                rowsPerPage: "ข้อมูลต่อหน้า",
                displayRows: "จาก",
                jumpToPage: "หน้า",
            },
            viewColumns: {
                title: "แสดง คอลัมน์",
                titleAria: "แสดง/ซ่อน คอลัมน์",
            },
            toolbar: {
                search: "ค้นหา",
                downloadCsv: "ดาวน์โหลด CSV",
                print: "พิมพ์",
                viewColumns: "แสดง คอลัมน์",
                filterTable: "กรองข้อมูล",
            },
            selectedRows: {
                text: "รายการที่เลือก",
                delete: "ลบ",
                deleteAria: "ลบรายการที่เลือก",
            },
        },
    };

    const contrastOrDefault =
        (color ? (theme.palette[color as keyof PaletteOptions] as PaletteColor).contrastText : "#000000") +
        " !important";
    const mainOrDefault =
        (color ? (theme.palette[color as keyof PaletteOptions] as PaletteColor).main : "#e0e0e0") + " !important";
    const colorAndIcon = {
        color: contrastOrDefault,
        "& svg": {
            color: contrastOrDefault,
        },
    };
    const tableTheme = createTheme({
        ...theme,
        components: {
            MuiTableCell: {
                styleOverrides: {
                    head: {
                        backgroundColor: mainOrDefault,
                        color: contrastOrDefault,
                    },
                    paddingCheckbox: {
                        "& svg": {
                            color: mainOrDefault,
                        },
                        backgroundColor: "#fff", // *? สีพื้นหลัง Checkbox
                    },
                    root: rowBackgroundColor
                        ? {
                              color: "inherit", // รับสีจาก row
                              borderRight: "1px solid #e0e0e0", // เพิ่มเส้นขอบขวาแต่ละ cell
                              "&:last-of-type": {
                                  borderRight: "none", // cell สุดท้ายไม่ต้องมีขอบขวา
                              },
                          }
                        : hideBorderBottom
                        ? { borderBottom: "none" }
                        : {},
                },
            },
            MUIDataTableHeadCell: {
                styleOverrides: {
                    root: { ...colorAndIcon },
                    sortLabelRoot: { ...colorAndIcon },
                    sortActive: { ...colorAndIcon },
                    toolButton: {
                        width: "100%",
                        m: 0,
                        justifyContent: columnHeaderAlign ? columnHeaderAlign + "!important" : undefined,
                    },
                },
            },
            MUIDataTableToolbar: {
                styleOverrides: {
                    root: {
                        display: displayToolbar ? "auto" : "none",
                    },
                    icon: {
                        "&:hover": {
                            color:
                                (color
                                    ? (theme.palette[color as keyof PaletteOptions] as PaletteColor).main
                                    : "#000000") + " !important",
                        },
                    },
                },
            },
            MUIDataTableToolbarSelect: {
                styleOverrides: {
                    root: {
                        display: disableToolbarSelect ? "none" : "unset",
                        "& .MuiTypography-root": {
                            fontSize: theme.typography.body1.fontSize,
                            fontWeight: theme.typography.h6.fontWeight,
                            lineHeight: theme.typography.h6.lineHeight,
                            margin: theme.spacing(1, 0),
                        },
                    },
                },
            },
            MuiTableFooter: {
                styleOverrides: {
                    root: {
                        display: displayFooter ? "auto" : "none",
                        [theme.breakpoints.down("md")]: {
                            "& .MuiTableCell-root, & .MuiToolbar-root": {
                                padding: 0,
                            },
                        },
                    },
                },
            },
            MUIDataTableHeadRow: {
                styleOverrides: {
                    root: {
                        "& th": {
                            "& svg": {
                                color: contrastOrDefault,
                            },
                        },
                    },
                },
            },
            MuiTableRow: {
                styleOverrides: {
                    root: rowBackgroundColor
                        ? {
                              "&:nth-of-type(even)": {
                                  backgroundColor: "#f0f0f0",
                                  borderBottom: "1px solid #bdbdbd",
                              },
                              "&:nth-of-type(odd)": {
                                  backgroundColor: "#f9f9f9",
                                  color: "#007AC1",
                                  borderBottom: "1px solid #bdbdbd",
                              },
                          }
                        : {},
                },
            },
        },
    });

    return (
        <ThemeProvider theme={tableTheme}>
            <div id={`${name}-data-table`}>
                <StyledMUIDataTable
                    options={{ ...defaultOptions, ...options }}
                    {...muiDataTableProps}
                    title={
                        title && (
                            <Typography variant="h6" align="left">
                                {title}&nbsp;
                                {isLoading && <CircularProgress size={24}></CircularProgress>}
                            </Typography>
                        )
                    }
                    sx={sx}
                />
            </div>
        </ThemeProvider>
    );
};

export default StandardDataTable;
