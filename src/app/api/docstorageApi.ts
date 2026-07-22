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
