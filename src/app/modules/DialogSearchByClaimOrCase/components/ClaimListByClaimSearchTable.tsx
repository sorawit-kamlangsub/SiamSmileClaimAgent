import { Box, Button, Grid } from "@mui/material";
import { PaginationResultDto, PaginationSortableDto, StandardDataTable } from "../../_common";
import useClaimListByClaimSearchDataTableHook, {
    ClaimSearchResultRow,
} from "../hooks/ClaimListByClaimSearchDataTableHook";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";

type ClaimListByClaimSearchProps = {
    claimData: any;
    buttonText: string;
};

const ClaimListByClaimSearchTable = ({ claimData, buttonText }: ClaimListByClaimSearchProps) => {
    const navigate = useNavigate();

    const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
    const [paginated, setPaginated] = useState<PaginationSortableDto>({
        page: 1,
        recordsPerPage: 10,
    });

    const handleSelectCase = (row: ClaimSearchResultRow) => {
        setSelectedCaseId(row.caseId);
    };

    const handleNavigate = () => {
        if (selectedCaseId) {
            navigate(`detail/${selectedCaseId}`);
        }
        // console.log(selectedCaseId);
    };

    const { columns } = useClaimListByClaimSearchDataTableHook({
        data: claimData,
        selectedCaseId,
        onSelect: handleSelectCase,
    });

    //NOTE - Make Pagination work with data from search when data not have pagination
    const startIndex = ((paginated.page ?? 0) - 1) * (paginated.recordsPerPage ?? 0);
    const pagedClaimData = (claimData ?? []).slice(startIndex, startIndex + (paginated.recordsPerPage ?? 0));

    const paginationResult: PaginationResultDto = useMemo(
        () => ({
            totalAmountRecords: claimData?.length ?? 0,
            totalAmountPages: Math.ceil((claimData?.length ?? 0) / (paginated.recordsPerPage ?? 0)) || 0,
            currentPage: paginated.page,
            recordsPerPage: paginated.recordsPerPage,
            pageIndex: (paginated.page ?? 0) - 1 < 0 ? 0 : (paginated.page ?? 1) - 1,
        }),
        [claimData, paginated]
    );

    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={12} lg={12}>
                    <StandardDataTable
                        name="claimSearchResult"
                        title=""
                        data={pagedClaimData ?? []}
                        columns={columns}
                        paginated={paginationResult}
                        setPaginated={setPaginated}
                        options={{
                            setRowProps: (_row: any, dataIndex: number) => {
                                const isSelected = claimData[dataIndex]?.caseId === selectedCaseId;
                                return {
                                    sx: {
                                        backgroundColor: isSelected ? "#E3F2FD" : "transparent",
                                    },
                                };
                            },
                        }}
                    />
                </Grid>
            </Grid>

            <Box sx={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
                <Button
                    variant="contained"
                    disabled={!selectedCaseId}
                    onClick={handleNavigate}
                    sx={{
                        backgroundColor: "#66BB6A",
                        textTransform: "none",
                        paddingX: "32px",
                        "&:hover": { backgroundColor: "#4CAF50" },
                        "&.Mui-disabled": {
                            backgroundColor: "#C8E6C9",
                            color: "#FFFFFF",
                        },
                    }}
                >
                    {buttonText}
                </Button>
            </Box>
        </>
    );
};

export default ClaimListByClaimSearchTable;
