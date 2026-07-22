import { MUIDataTableColumn } from "mui-datatables";
import { Button, Grid, IconButton, LinearProgress, Tooltip } from "@mui/material";
import { Visibility } from "@mui/icons-material";

import { useEffect } from "react";
import { useGetDocumentType } from "../../../../api/coreClaimApi";
import { cellAlignOptions, defaultOptionStandardDataTable, handleClickLink } from "../../../../functionHelpers";
import CustomPaper from "../../../_common/components/CustomComponent/CustomPaper";
import { StandardDataTable } from "../../../_common";
import { claimPHSelector, setDocumentDetailById } from "../../store/claimPHSlice";
import { useAppDispatch, useAppSelector } from "../../../../../redux";
import { DOC_STORAGE_URL } from "../../../../../Const";
import { GetDocumentSubTypeDtoResponse } from "../../../../api/coreClaimApi.client";
import { useGetDocumentById } from "../../../../api/docstorageApi";
import { HeadingWithColor } from "../../../_common/components/CustomComponent/HeadingWithColor";
import AttachFileIcon from "@mui/icons-material/AttachFile";

type DocumentScanTableProps = {
    productId?: number | undefined;
    aplicationCode?: string | undefined;
    documentTypeId?: number | undefined;
};

const DocumentScanTable = ({ aplicationCode, documentTypeId }: DocumentScanTableProps) => {
    const { isEnabled } = useAppSelector(claimPHSelector);
    const documentSubType = (): number => {
        if (documentTypeId === 15) {
            //เอกสารประกอบการพิจารณาเคลม
            return 220;
        }
        return 0;
    };

    const { data, isLoading } = useGetDocumentType(
        {
            documentTypeId: documentTypeId ?? 0,
            documentPrefix: "DOC",
            documentSubTypeIdList: [documentSubType()],
        },
        isEnabled
    );
    const enrichedData = data?.data || [];

    const columns: MUIDataTableColumn[] = [
        {
            name: "documentCode",
            label: "รหัสเอกสาร",
            options: {
                filter: false,
                sort: false,
                //display: documentTypeId === 4 ? false : true,
                ...cellAlignOptions({ align: "center" }),
            },
        },
        {
            name: "documentSubTypeName",
            label: "ประเภทเอกสาร",
            options: { filter: false, sort: false, ...cellAlignOptions({ align: "center" }) },
        },
        {
            name: "",
            label: "สแกนเอกสาร",
            options: {
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: (_value, tableMeta) => {
                    const { documentId, documentCode } = enrichedData[tableMeta.rowIndex] || {};
                    const prefixcode =
                        aplicationCode !== undefined &&
                        aplicationCode !== null &&
                        aplicationCode !== "" &&
                        aplicationCode !== " "
                            ? aplicationCode
                            : documentCode;
                    return (
                        <Grid container alignItems="center" justifyContent="center">
                            <Tooltip title="แนบเอกสาร" arrow placement="top" enterDelay={100} leaveDelay={50}>
                                <Grid
                                    item
                                    xs={12}
                                    sm={10}
                                    md={9}
                                    lg={5}
                                    sx={{ display: "flex", justifyContent: "center" }}
                                >
                                    <Button
                                        size="small"
                                        variant="contained"
                                        sx={{ width: documentTypeId === 4 ? "170px" : "150px" }}
                                        // fullWidth
                                        onClick={() => {
                                            const url = `${DOC_STORAGE_URL}/document/scan?documentId=${documentId}&documentCode=${documentCode}&documentSubType=${documentSubType()}&mainIndex=${prefixcode}&searchIndex=${prefixcode}`;
                                            handleClickLink(url);
                                        }}
                                    >
                                        สแกนเอกสาร
                                    </Button>
                                </Grid>
                            </Tooltip>
                        </Grid>
                    );
                },
            },
        },
        {
            name: "fileCount",
            label: "จำนวนเอกสาร",
            options: {
                filter: false,
                sort: false,
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: (_value, tableMeta) => {
                    const docData = data?.data?.[tableMeta.rowIndex] || {};

                    return <FileCount docData={docData} />;
                },
            },
        },
        {
            name: "documentId",
            label: "รายละเอียด",
            options: {
                ...cellAlignOptions({ align: "center" }),
                customBodyRender: (_value) => {
                    return (
                        <Grid container alignItems="center" justifyContent="center">
                            <Tooltip title="ดูรายละเอียด" arrow placement="top" enterDelay={100} leaveDelay={50}>
                                <IconButton
                                    aria-label="delete"
                                    size="small"
                                    sx={{ backgroundColor: "#E2F2FF" }}
                                    onClick={() => {
                                        const url = `${DOC_STORAGE_URL}/document/${_value}/preview`;
                                        handleClickLink(url);
                                    }}
                                >
                                    <Visibility color="primary" />
                                </IconButton>
                            </Tooltip>
                        </Grid>
                    );
                },
            },
        },
    ];
    return (
        <>
            {documentTypeId === 15 ? (
                <CustomPaper>
                    <HeadingWithColor text="สแกนเอกสาร" color="blue" icon={<AttachFileIcon sx={{ fontSize: 27 }} />} />
                    {isLoading ? (
                        <LinearProgress sx={{ height: "5px" }} />
                    ) : (
                        <StandardDataTable
                            name="scanDocumentTable"
                            title=""
                            data={enrichedData}
                            isLoading={isLoading}
                            columns={columns}
                            color="primary"
                            columnHeaderAlign="center"
                            displayToolbar={false}
                            displayFooter={false}
                            options={defaultOptionStandardDataTable}
                        />
                    )}
                </CustomPaper>
            ) : (
                <>
                    {isLoading ? (
                        <LinearProgress sx={{ height: "5px" }} />
                    ) : (
                        <StandardDataTable
                            name="scanDocumentTable"
                            title=""
                            data={enrichedData}
                            isLoading={isLoading}
                            columns={columns}
                            color="primary"
                            columnHeaderAlign="center"
                            displayToolbar={false}
                            displayFooter={false}
                            options={defaultOptionStandardDataTable}
                        />
                    )}
                </>
            )}
        </>
    );
};

export default DocumentScanTable;

type FileCountProps = {
    docData: GetDocumentSubTypeDtoResponse;
};

const FileCount = ({ docData }: FileCountProps) => {
    const dispatch = useAppDispatch();
    const { documentId } = docData;
    const { data: documentData } = useGetDocumentById(documentId ?? "");

    useEffect(() => {
        dispatch(setDocumentDetailById({ ...docData, docDetail: documentData?.data ?? {} }));
    }, [documentData]);

    const fileCount = documentData?.data?.fileCount ?? 0;
    return <>{fileCount}</>;
};
