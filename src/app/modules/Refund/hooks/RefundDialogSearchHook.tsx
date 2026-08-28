import { useFormik } from "formik";
import { swalError } from "../../_common";
import { useSearchClaimOrCase } from "../refundAPI";
import { useState } from "react";

type RefundClaimSearchType = {
    searchDetail: string;
};

const useRefundDialogSearchHook = () => {
    const [dataFromSearch, setDataFromSearch] = useState<any>([]);
    const handleSuccess = (res: any) => {
        setDataFromSearch(res.data);
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
