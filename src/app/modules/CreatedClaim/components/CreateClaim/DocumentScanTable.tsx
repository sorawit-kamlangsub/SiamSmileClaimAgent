import { MUIDataTableColumn } from "mui-datatables";
import { Box, Button, Grid, IconButton, LinearProgress, Tooltip } from "@mui/material";
import { Visibility } from "@mui/icons-material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useGetDocumentByCaseId, useGetDocumentType } from "../../../../api/coreClaimApi";
import { cellAlignOptions, defaultOptionStandardDataTable, handleClickLink } from "../../../../functionHelpers";
import CustomPaper from "../../../_common/components/CustomComponent/CustomPaper";
import { StandardDataTable } from "../../../_common";
import { claimPHSelector, setDocument, setDocumentDetailById } from "../../store/claimPHSlice";
import { useAppDispatch, useAppSelector } from "../../../../../redux";
import { DOC_STORAGE_URL } from "../../../../../Const";
import { CaseDocumentV2Request, GetDocumentSubTypeDtoResponse } from "../../../../api/coreClaimApi.client";
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
// 12 ใบเสร็จโรงพยาบาล
// 13 เอกสารประกอบการเปลี่ยนบัญชี

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
    | "เอกสารประกอบการพิจารณาเคลม"
    | "ใบเสร็จโรงพยาบาล"
    | "เอกสารประกอบการเปลี่ยนบัญชี";

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
    ใบเสร็จโรงพยาบาล: 12,
    เอกสารประกอบการเปลี่ยนบัญชี: 13,
};

type DocumentScanTableProps = {
    productTypeId: number;
    aplicationCode?: string | undefined;
    documentType?: DocumentTypeKey | undefined;
    Header?: string;
    rejectClaim?: boolean;
    /** caseId ของเคสที่กำลังพิจารณา — ถ้าส่งมาจะดึงเอกสารที่ลูกค้าแนบไว้จริงมาทับแถวของ master (ไม่ส่ง = พฤติกรรมเดิม) */
    caseId?: string;
    claimSourceId?: number;
    onAttachedDocumentsChange?: (docs: CaseDocumentV2Request[]) => void;
    /**
     * บังคับยิง GET master document type ใหม่ทุกครั้งที่ตารางนี้ mount แทนการ cache ตลอดไป (default false)
     * ต้องเปิดสำหรับตารางที่ endpoint คืน documentCode เฉพาะเคส (เช่น "เอกสารประกอบการปฏิเสธ" ที่ไม่ได้ส่ง
     * caseId มา merge ทับ) ไม่งั้นสองเคสที่ productTypeId ตรงกันจะเห็น documentCode ของเคสก่อนหน้าค้างอยู่
     */
    alwaysFreshMasterList?: boolean;
    /** ไม่ครอบด้วย CustomPaper (เหลือแค่ระยะ mt: 1) — ใช้เมื่อตารางอยู่ภายใน section/dialog ที่มีกรอบอยู่แล้ว (default false) */
    disablePaper?: boolean;
    /**
     * แสดงเฉพาะเอกสารของเคสที่ claimDocumentTypeId ตรงกับ documentType ของตารางนี้ (default false = แสดงทุกประเภท)
     * ใช้เมื่อหน้าเดียวมีหลายตารางแยกตามประเภทเอกสาร เช่น พิจารณา D&D (ประกอบการพิจารณาเคลม / ประกอบการเปลี่ยนบัญชี)
     */
    filterCaseDocumentsByType?: boolean;
};

const DocumentScanTable = ({
    aplicationCode,
    documentType = "เอกสารประกอบการพิจารณาเคลม",
    rejectClaim,
    productTypeId,
    Header,
    caseId,
    claimSourceId,
    onAttachedDocumentsChange,
    alwaysFreshMasterList = false,
    disablePaper = false,
    filterCaseDocumentsByType = false,
}: DocumentScanTableProps) => {
    const { isEnabled } = useAppSelector(claimPHSelector);
    const dispatch = useAppDispatch();
    const [fileCountByDocId, setFileCountByDocId] = useState<Record<string, number>>({});

    const handleFileCountChange = useCallback((documentId: string, fileCount: number) => {
        setFileCountByDocId((prev) => (prev[documentId] === fileCount ? prev : { ...prev, [documentId]: fileCount }));
    }, []);

    const { data, isLoading: isMasterLoading } = useGetDocumentType(
        {
            documentTypeId: documentTypeId[documentType],
            documentPrefix: "DOC",
            productTypeId: productTypeId,
        },
        isEnabled,
        alwaysFreshMasterList
    );

    // ดึงเอกสารที่ลูกค้าแนบไว้จริงของเคสนี้ (documentId ตัวจริงที่เก็บไฟล์) มา merge ทับรายการ master
    // ด้านบน — ถ้าไม่ส่ง caseId มา (เช่นตอนสแกนเอกสารปฏิเสธ/ตอนสร้างเคลมที่ยังไม่มี caseId) query
    // จะไม่ยิงเลยเพราะ enabled: !!caseId ใน useGetDocumentByCaseId ทำให้พฤติกรรมเดิมไม่เปลี่ยน
    //
    // รอ productTypeId ให้พร้อมก่อนค่อยส่ง caseId จริงเข้าไป : ที่ ClaimDetailsTab caseId มาจาก
    // detail?.caseId (พร้อมทันทีที่โหลดรายละเอียดเคลมเสร็จ) ส่วน productTypeId มาจาก
    // customerDetail?.productTypeId ?? 0 ซึ่ง customerDetail ต้องรอ detail.customerId ก่อนถึงยิง
    // จึงมาถึงทีหลังเสมอ ถ้าไม่ guard ตรงนี้ query จะยิงรอบแรกด้วย productTypeId=0 ก่อน แล้วพอ
    // customerDetail มาค่อยยิงซ้ำอีกรอบด้วยค่าจริง (query key เปลี่ยนเพราะ productTypeId อยู่ในคีย์)
    const { data: caseDocumentData, isLoading: isCaseDocumentLoading } = useGetDocumentByCaseId(
        productTypeId ? caseId ?? "" : "",
        productTypeId,
        claimSourceId,
        undefined,
        undefined,
        undefined,
        1,
        100
    );

    // useGetDocumentByCaseId เป็น enabled: !!caseId — ถ้าไม่ส่ง caseId มา (เช่นตารางเอกสารประกอบการปฏิเสธ)
    // query นี้ถูก disable ถาวรและไม่เคยยิงเลย แต่ react-query v4 ให้ query ที่ disable ตั้งแต่แรกค้างสถานะ
    // isLoading=true ตลอดไป (ไม่มีทาง resolve เป็น false) ถ้ารวมเข้า isLoading ตรงๆ ตารางจะค้างที่
    // LinearProgress ตลอดกาลทั้งที่ master list โหลดเสร็จแล้ว จึงต้องนับ isCaseDocumentLoading เฉพาะตอน
    // query นี้ enabled จริงเท่านั้น
    const isCaseDocumentEnabled = !!productTypeId && !!caseId;
    const isLoading = isMasterLoading || (isCaseDocumentEnabled && isCaseDocumentLoading);

    // match ด้วย documentSubTypeId — แถว master ที่ลูกค้าแนบเอกสารมาแล้วจะถูกทับด้วย documentId/
    // documentCode ตัวจริงของเคส ส่วนเอกสารที่ลูกค้าแนบเป็นประเภทที่ไม่อยู่ใน master ของ productTypeId
    // นี้ (หาคู่ไม่เจอ) จะต่อท้ายไว้แทนที่จะทิ้ง
    const enrichedData: GetDocumentSubTypeDtoResponse[] = useMemo(() => {
        const masterRows = data?.data ?? [];
        const caseRows = (caseDocumentData?.data ?? []).filter(
            (caseRow) => !filterCaseDocumentsByType || caseRow.claimDocumentTypeId === documentTypeId[documentType]
        );
        const usedCaseRowIndexes = new Set<number>();

        const merged = masterRows.map((masterRow) => {
            const caseRowIndex = caseRows.findIndex(
                (caseRow, idx) =>
                    !usedCaseRowIndexes.has(idx) && caseRow.documentSubTypeId === masterRow.documentSubTypeId
            );
            if (caseRowIndex === -1) return masterRow;
            usedCaseRowIndexes.add(caseRowIndex);
            const caseRow = caseRows[caseRowIndex];
            return { ...masterRow, documentId: caseRow.documentId, documentCode: caseRow.documentCode };
        });

        const extraCaseRows: GetDocumentSubTypeDtoResponse[] = caseRows
            .filter((_caseRow, idx) => !usedCaseRowIndexes.has(idx))
            .map((caseRow) => ({
                documentId: caseRow.documentId,
                documentCode: caseRow.documentCode,
                documentSubTypeId: caseRow.documentSubTypeId,
                documentSubTypeName: caseRow.claimDocumentTypeName,
                documentTypeId: caseRow.claimDocumentTypeId,
            }));

        return [...merged, ...extraCaseRows];
    }, [data, caseDocumentData, filterCaseDocumentsByType, documentType]);

    useEffect(() => {
        if (enrichedData.length > 0) {
            dispatch(setDocument(enrichedData));
        }
    }, [enrichedData]);

    useEffect(() => {
        if (!onAttachedDocumentsChange) return;

        const attachedDocs: CaseDocumentV2Request[] = enrichedData
            .filter((d) => (fileCountByDocId[d.documentId ?? ""] ?? 0) > 0)
            .map((d) => ({
                documentId: d.documentId,
                documentNo: d.documentCode,
                documentSubTypeId: d.documentSubTypeId,
                claimDocumentTypeId: d.documentTypeId ?? documentTypeId[documentType],
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
                    const docData = enrichedData[tableMeta.rowIndex] || {};

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
    const content = (
        <>
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
        </>
    );

    return disablePaper ? <Box sx={{ mt: 2 }}>{content}</Box> : <CustomPaper sx={{ mt: 1 }}>{content}</CustomPaper>;
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
        // รอผล query จริงก่อนค่อย dispatch — เดิม effect นี้ยิงทันทีตอน mount ด้วย docDetail ว่างเปล่า
        // (documentData ยังเป็น undefined) แล้วยิงซ้ำอีกครั้งตอน query resolve จริง กลายเป็น 2 dispatch/แถวเอกสาร
        // พอมีหลายแถวพร้อมกันในหน้ารายละเอียดค่าใช้จ่าย จะยิง action รัวๆ เกินจำเป็นตอนโหลดหน้า
        if (!documentData) return;
        dispatch(setDocumentDetailById({ ...docData, docDetail: documentData.data ?? {} }));
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
