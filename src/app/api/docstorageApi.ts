import axios from "axios";
import { DOCSTORAGE_API_URL } from "../../Const";
import {
    DocumentByIdResponseDtoServiceResponse,
    DocumentClient,
    DocumentUploaderClient,
    FileParameter,
    UploadResponseDtoServiceResponse,
} from "./docstorageApi.client";
import { useMutation, useQuery } from "@tanstack/react-query";

const docStorageClient = new DocumentClient(DOCSTORAGE_API_URL, axios);
const documentUploaderClient = new DocumentUploaderClient(DOCSTORAGE_API_URL, axios);
const getDocumentByIdQueryKey = "GetDocumentById";
const getDocumentListByIdsQueryKey = "GetDocumentListByIds";
const getDocumentFileByDocumentIdQueryKey = "GetDocumentFileByDocumentId";

export const useGetDocumentById = (documentId: string) => {
    return useQuery<DocumentByIdResponseDtoServiceResponse, Error>(
        [getDocumentByIdQueryKey, documentId],
        async () => {
            const response = await docStorageClient.getDocumentById(documentId);
            return response;
        },
        {
            enabled: documentId == "" ? false : true,
            refetchOnWindowFocus: true,
            staleTime: 0,
        }
    );
};

/**
 * รายละเอียดเอกสารหลาย DocumentId พร้อมกัน (GET /document/documentid/list?documentIds=...)
 * ใช้เติมชื่อ (documentTypeName) + จำนวนไฟล์จริง + ข้อมูลลิงก์แนบเอกสารให้ตาราง "ตรวจสอบเอกสาร"
 * (documentId มาจาก useGetCaseReviewOverview)
 *
 * staleTime 0 + refetchOnWindowFocus : ผู้พิจารณาไปแนบเอกสารที่หน้า DocStorage แล้วกลับมา
 * ต้องเห็นจำนวนไฟล์ล่าสุด (เงื่อนไขเปิด modal / กดถัดไป อิงจำนวนไฟล์)
 */
export const useGetDocumentListByIds = (documentIds: string[]) => {
    return useQuery(
        [getDocumentListByIdsQueryKey, documentIds],
        () => docStorageClient.getDocumentByMainIndex(documentIds),
        {
            enabled: documentIds.length > 0,
            staleTime: 0,
            refetchOnWindowFocus: true,
        }
    );
};

/**
 * ไฟล์เอกสารทั้งหมดของ DocumentId เดียว (GET /document/{documentId}/documentFile)
 * เรียกตอนเปิด modal ดูรายละเอียดเอกสาร — ส่ง recordsPerPage สูงเพื่อให้ได้ครบทุกไฟล์ (ไม่โดน paginate)
 */
export const useGetDocumentFileByDocumentId = (documentId?: string) => {
    return useQuery(
        [getDocumentFileByDocumentIdQueryKey, documentId],
        () => docStorageClient.getDocumentFileByDocumentId(documentId as string, 1, 100),
        {
            enabled: !!documentId,
            staleTime: 0,
            refetchOnWindowFocus: true,
        }
    );
};

export interface documentCreatedRequest {
    documentCode?: string | undefined;
    documentId?: string | undefined;
    documentSubTypeId?: number | undefined;
    mainIndex?: string | undefined;
    searchIndex?: string | undefined;
    documentIndexId?: number[] | undefined;
    documentIndexValue?: string[] | undefined;
    fileUploads?: FileParameter[] | undefined;
}

export const useCreateDocumentToDocStorage = (
    onSuccessCallback?: (response: UploadResponseDtoServiceResponse) => void,
    onErrorCallback?: (error: string) => void
) => {
    return useMutation(
        (body?: documentCreatedRequest | undefined) =>
            documentUploaderClient.documentCreate(
                body?.documentCode,
                body?.documentId,
                body?.documentSubTypeId,
                body?.mainIndex,
                body?.searchIndex,
                body?.documentIndexId,
                body?.documentIndexValue,
                body?.fileUploads
            ),
        {
            onSuccess: (response) => {
                if (!response.isSuccess)
                    onErrorCallback?.(response.message || response.exceptionMessage || "Unknown error");
                else onSuccessCallback?.(response);
            },
            onError: (error: Error) => {
                onErrorCallback?.(error.message);
            },
        }
    );
};
