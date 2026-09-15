import React from "react";
import { Box, Typography } from "@mui/material";
import { MUIDataTableColumn } from "mui-datatables";
import { PaletteOptions } from "@mui/material/styles";
import { PaginationResultDto, PaginationSortableDto, ClaimFundStandardDataTable } from "../../../_common";

export interface HistoryTableCardProps {
    title: string;
    name: string;
    columns: MUIDataTableColumn[];
    data: any[];
    paginated: PaginationSortableDto;
    setPaginated: React.Dispatch<React.SetStateAction<PaginationSortableDto>>;
    color?: keyof PaletteOptions;
    isLoading?: boolean;
    isError?: boolean;
    error?: unknown;
}

const HistoryTableCard = ({
    title,
    name,
    columns,
    data,
    paginated,
    setPaginated,
    color = "grey",
    isLoading,
    isError,
    error,
}: HistoryTableCardProps) => {
    // Client-side pagination, same reasoning as ClaimListByClaimSearchTable:
    // the API returns the full matching list in one shot, so we slice it
    // here to match the current page/recordsPerPage.
    const startIndex = paginated.page ? (paginated.page - 1) * (paginated.recordsPerPage ?? 0) : 0;
    const pagedData = data.slice(startIndex, startIndex + (paginated.recordsPerPage ?? 0));

    const paginationResult: PaginationResultDto = {
        totalAmountRecords: data.length,
        totalAmountPages: Math.ceil(data.length / (paginated.recordsPerPage ?? 0)) || 0,
        currentPage: paginated.page,
        recordsPerPage: paginated.recordsPerPage,
        pageIndex: paginated.page ? paginated.page - 1 : 0,
    };

    return (
        <Box
            sx={{
                backgroundColor: "#FFFFFF",
                borderRadius: "10px",
                border: "1px solid #E0E0E0",
                overflow: "hidden",
            }}
        >
            <Box sx={{ padding: "16px 24px" }}>
                <Typography sx={{ fontWeight: 700, color: "#212121" }}>{title}</Typography>
            </Box>

            <ClaimFundStandardDataTable
                name={name}
                title=""
                data={pagedData}
                columns={columns}
                paginated={paginationResult}
                setPaginated={setPaginated}
                color={color}
                isLoading={isLoading}
                isError={isError}
                error={error}
            />
        </Box>
    );
};

export default HistoryTableCard;
