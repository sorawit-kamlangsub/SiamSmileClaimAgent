import { MUIDataTableColumn } from "mui-datatables";
import { Button, Grid, IconButton, LinearProgress, Tooltip } from "@mui/material";
import { Visibility } from "@mui/icons-material";
import { useCallback, useEffect, useState } from "react";
import { useGetDocumentType } from "../../../../api/coreClaimApi";
import { cellAlignOptions, defaultOptionStandardDataTable, handleClickLink } from "../../../../functionHelpers";
import CustomPaper from "../../../_common/components/CustomComponent/CustomPaper";
import { StandardDataTable } from "../../../_common";
import { claimPHSelector, setDocument, setDocumentDetailById } from "../../store/claimPHSlice";
import { useAppDispatch, useAppSelector } from "../../../../../redux";
import { DOC_STORAGE_URL } from "../../../../../Const";
import {
    CaseDocumentV2Request,
    GetDocumentSubTypeDtoResponse,
} from "../../../../api/coreClaimApi.client";
import { useGetDocumentById } from "../../../../api/docstorageApi";
import { HeadingWithColor } from "../../../_common/components/CustomComponent/HeadingWithColor";
import AttachFileIcon from "@mui/icons-material/AttachFile";

// ประเภทเอกสาร (type)
// 1  บัตรประชาชน
// 2  แบบฟอร์ม A
// 3  แบบฟอร์ม B
// 4  ใบแจ้งหนี้
// 5  รายละเอียดใบแจ้งหนี้
// 6  ผลการตรวจ LAB, EKG, X-ray และอื่นๆ
// 7  ชุดรวมเอกสาร
// 8  อื่นๆ
// 9  ใบแจ้งปฏิเสธสินไหม
// 10 คู่สัญญาโรงพยาบาล
// 11 เอกสารประกอบการพิจารณาเคลม

type DocumentTypeKey =
    | "บัตรประชาชน"
    | "แบบฟอร์ม A"
    | "แบบฟอร์ม B"
    | "ใบแจ้งหนี้"
    | "รายละเอียดใบแจ้งหนี้"
    | "ผลการตรวจ LAB, EKG, X-ray และอื่นๆ"
    | "ชุดรวมเอกสาร"
    | "อื่นๆ"
    | "ใบแจ้งปฏิเสธสินไหม"
    | "คู่สัญญาโรงพยาบาล"
    | "เอกสารประกอบการพิจารณาเคลม";

export const documentTypeId: Record<DocumentTypeKey, number> = {
    บัตรประชาชน: 1,
    "แบบฟอร์ม A": 2,
    "แบบฟอร์ม B": 3,
    ใบแจ้งหนี้: 4,
    รายละเอียดใบแจ้งหนี้: 5,
    "ผลการตรวจ LAB, EKG, X-ray และอื่นๆ": 6,
    ชุดรวมเอกสาร: 7,
    อื่นๆ: 8,
    ใบแจ้งปฏิเสธสินไหม: 9,
    คู่สัญญาโรงพยาบาล: 10,
    เอกสารประกอบการพิจารณาเคลม: 11,
};

type DocumentScanTableProps = {
    productTypeId: number;
    aplicationCode?: string | undefined;
    documentType?: DocumentTypeKey | undefined;
    Header?: string;
    rejectClaim?: boolean;
    onAttachedDocumentsChange?: (docs: CaseDocumentV2Request[]) => void;
};

const DocumentScanTable = ({
    aplicationCode,
    documentType = "เอกสารประกอบการพิจารณาเคลม",
    rejectClaim,
    productTypeId,
    Header,
    onAttachedDocumentsChange,
}: DocumentScanTableProps) => {
    const { isEnabled } = useAppSelector(claimPHSelector);
    const dispatch = useAppDispatch();
    const [fileCountByDocId, setFileCountByDocId] = useState<Record<string, number>>({});

    const handleFileCountChange = useCallback((documentId: string, fileCount: number) => {
        setFileCountByDocId((prev) => (prev[documentId] === fileCount ? prev : { ...prev, [documentId]: fileCount }));
    }, []);

    const { data, isLoading } = useGetDocumentType(
        {
            documentTypeId: documentTypeId[documentType],
            documentPrefix: "DOC",
            productTypeId: productTypeId,
        },
        isEnabled
    );
    const enrichedData = data?.data || [];

    useEffect(() => {
        if (enrichedData.length > 0) {
            dispatch(setDocument(enrichedData));
        }
    }, [data]);

    useEffect(() => {
        if (!onAttachedDocumentsChange) return;

        const attachedDocs: CaseDocumentV2Request[] = enrichedData
            .filter((d) => (fileCountByDocId[d.documentId ?? ""] ?? 0) > 0)
            .map((d) => ({
                documentId: d.documentId,
                documentNo: d.documentCode,
                documentSubTypeId: d.documentSubTypeId,
            }));

        onAttachedDocumentsChange(attachedDocs);
    }, [fileCountByDocId, enrichedData]);

    const columns: MUIDataTableColumn[] = [
        {
            name: "documentCode",
            label: "รหัสเอกสาร",
            options: {
                filter: false,
                sort: false,
                display: rejectClaim ? false : true,
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
                    const { documentId, documentCode, documentSubTypeId } = enrichedData[tableMeta.rowIndex] || {};
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
                                        sx={{ width: "170px" }}
                                        onClick={() => {
                                            const url = `${DOC_STORAGE_URL}/document/scan?documentId=${documentId}&documentCode=${documentCode}&documentSubType=${documentSubTypeId}&mainIndex=${prefixcode}&searchIndex=${prefixcode}`;
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

                    return <FileCount docData={docData} onFileCountChange={handleFileCountChange} />;
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
            <CustomPaper sx={{ mt: 1 }}>
                {!!Header && (
                    <HeadingWithColor text={Header} color="blue" icon={<AttachFileIcon sx={{ fontSize: 27 }} />} />
                )}
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
        </>
    );
};

export default DocumentScanTable;

type FileCountProps = {
    docData: GetDocumentSubTypeDtoResponse;
    onFileCountChange?: (documentId: string, fileCount: number) => void;
};

const FileCount = ({ docData, onFileCountChange }: FileCountProps) => {
    const dispatch = useAppDispatch();
    const { documentId } = docData;
    const { data: documentData, refetch } = useGetDocumentById(documentId ?? "");

    useEffect(() => {
        dispatch(setDocumentDetailById({ ...docData, docDetail: documentData?.data ?? {} }));
    }, [documentData]);

    useEffect(() => {
        if (!documentId) return;

        const refreshDocument = () => {
            if (document.visibilityState === "visible") {
                void refetch();
            }
        };

        // รองรับกรณีเปิดหน้าสแกนเอกสารแล้วกลับมาหน้านี้ โดย query key เดิมไม่เปลี่ยน
        window.addEventListener("focus", refreshDocument);
        window.addEventListener("pageshow", refreshDocument);
        document.addEventListener("visibilitychange", refreshDocument);

        return () => {
            window.removeEventListener("focus", refreshDocument);
            window.removeEventListener("pageshow", refreshDocument);
            document.removeEventListener("visibilitychange", refreshDocument);
        };
    }, [documentId, refetch]);

    const fileCount = documentData?.data?.fileCount ?? 0;

    useEffect(() => {
        if (documentId) onFileCountChange?.(documentId, fileCount);
    }, [documentId, fileCount]);

    return <>{fileCount}</>;
};
