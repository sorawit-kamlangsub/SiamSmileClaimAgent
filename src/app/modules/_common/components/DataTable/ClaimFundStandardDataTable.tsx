import { PaletteOptions, SxProps, Theme } from "@mui/material";
import { MUIDataTableColumn, MUIDataTableOptions } from "mui-datatables";
import React, { useEffect, useState } from "react";
import { PaginationResultDto, PaginationSortableDto } from "../../types";
import StandardDataTable from "./StandardDataTable";

const LOADING_NO_DATA_DELAY_MS = 30000;

const mapErrorMessage = (err: unknown): string => {
    const message =
        typeof err === "string"
            ? err
            : err instanceof Error
            ? err.message
            : typeof err === "object" && err !== null && "message" in err
            ? String((err as { message: unknown }).message)
            : "";

    if (!message) return "เกิดข้อผิดพลาด โปรดลองใหม่อีกครั้ง";
    if (/404|not found/i.test(message)) return "เกิดข้อผิดพลาด: ไม่พบข้อมูล (404)";
    if (/cors/i.test(message)) return "เกิดข้อผิดพลาด: การเชื่อมต่อถูกบล็อก (CORS)";
    if (/network|timeout|ECONNABORTED|timed out/i.test(message)) {
        return "เกิดข้อผิดพลาด: ไม่สามารถติดต่อเซิร์ฟเวอร์ได้หรือหมดเวลา (Timeout)";
    }
    return `เกิดข้อผิดพลาด: ${message}`;
};

type ClaimFundStandardDataTableProps = {
    name: string;
    title?: string;
    data?: { [key: string]: any }[];
    columns: MUIDataTableColumn[];
    isLoading?: boolean;
    isError?: boolean;
    error?: unknown;
    paginated?: PaginationResultDto;
    setPaginated?: React.Dispatch<React.SetStateAction<PaginationSortableDto>>;
    color?: keyof PaletteOptions;
    noMatchText?: string;
    delayNoMatch?: boolean;
    displayToolbar?: boolean;
    displayFooter?: boolean;
    sx?: SxProps<Theme>;
    options?: MUIDataTableOptions;
};

const ClaimFundStandardDataTable = ({
    name,
    title,
    data,
    columns,
    isLoading,
    isError,
    error,
    paginated,
    setPaginated,
    color,
    noMatchText,
    delayNoMatch = true,
    displayToolbar,
    displayFooter,
    sx,
    options,
}: ClaimFundStandardDataTableProps) => {
    const [minDelayReached, setMinDelayReached] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setMinDelayReached(true), LOADING_NO_DATA_DELAY_MS);
        return () => clearTimeout(timer);
    }, [isLoading]);

    const noMatch = isError
        ? mapErrorMessage(error)
        : isLoading || (delayNoMatch && !minDelayReached)
        ? "กำลังโหลดข้อมูล..."
        : noMatchText ?? "ไม่พบข้อมูล";

    return (
        <StandardDataTable
            name={name}
            title={title}
            data={data ?? []}
            columns={columns}
            isLoading={isLoading}
            paginated={paginated}
            setPaginated={setPaginated}
            color={color}
            displayToolbar={displayToolbar}
            displayFooter={displayFooter}
            sx={sx}
            options={{
                ...options,
                textLabels: {
                    body: {
                        noMatch: noMatch,
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
            }}
        />
    );
};

export default ClaimFundStandardDataTable;
