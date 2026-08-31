import { useFormik } from "formik";
import { swalError } from "../../_common";
import { useSearchClaimOrCase } from "../refundAPI";
import { useRef, useState } from "react";

type RefundClaimSearchType = {
    searchDetail: string;
};

type UseRefundDialogSearchHookProps = {
    onSearchSuccess?: (data: any) => void;
};

const useRefundDialogSearchHook = ({ onSearchSuccess }: UseRefundDialogSearchHookProps) => {
    const [dataFromSearch, setDataFromSearch] = useState<any>([]);

    const handleSuccess = (res: any) => {
        setDataFromSearch(res.data);
        onSearchSuccess?.(res.data);
    };
    const handleError = (err: string) => {
        swalError("แจ้งเตือน", err);
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
                searchByClaimOrCaseMutate({ searchDetail: value.searchDetail });
            }
        },
    });
    return { formik, searchByClaimOrCaseIsLoading, dataFromSearch };
};

export default useRefundDialogSearchHook;
