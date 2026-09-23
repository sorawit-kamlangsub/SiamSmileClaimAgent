import { useFormik } from "formik";
import { NOT_FOUND_MESSAGE, mapErrorMessage, swalError, swalWarning } from "../../_common";
import { useSearchClaimOrCase } from "../dialogSearchClaimAPI";
import { useState } from "react";

type RefundClaimSearchType = {
    searchDetail: string;
};

type UseRefundDialogSearchHookProps = {
    onSearchSuccess?: (data: any) => void;
};

const useDialogSearchHook = ({ onSearchSuccess }: UseRefundDialogSearchHookProps) => {
    const [dataFromSearch, setDataFromSearch] = useState<any>([]);

    const handleSuccess = (res: any) => {
        const result = res?.data ?? [];
        setDataFromSearch(result);
        if (!result || result.length === 0) {
            swalWarning("แจ้งเตือน", NOT_FOUND_MESSAGE);
        }
        onSearchSuccess?.(result);
    };
    const handleError = (err: string) => {
        swalError("แจ้งเตือน", mapErrorMessage(err));
    };

    const { mutate: searchByClaimOrCaseMutate, isLoading: searchByClaimOrCaseIsLoading } = useSearchClaimOrCase(
        handleSuccess,
        handleError
    );

    const formik = useFormik<RefundClaimSearchType>({
        initialValues: {
            searchDetail: "",
        },

        onSubmit: (value) => {
            if (value.searchDetail) {
                searchByClaimOrCaseMutate({ searchDetail: value.searchDetail, });
            }
        },
    });
    return { formik, searchByClaimOrCaseIsLoading, dataFromSearch };
};

export default useDialogSearchHook;