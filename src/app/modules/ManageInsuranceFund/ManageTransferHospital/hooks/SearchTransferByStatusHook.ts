import { useState } from "react";
import { useFormik } from "formik";

type FormikValueType = {
    statusId: number | undefined;
    searchDetail: string;
};
const useSearchTransferByStatusHook = () => {
    const [submittedSearch, setSubmittedSearch] = useState<{
        values: FormikValueType;
        requestId: number;
    }>();
    const defaultValue: FormikValueType = {
        statusId: undefined,
        searchDetail: "",
    };
    const formik = useFormik<FormikValueType>({
        initialValues: defaultValue,
        onSubmit: (values) => {
            setSubmittedSearch((previous) => ({
                values,
                requestId: (previous?.requestId ?? 0) + 1,
            }));
        },
    });
    return { formik, submittedSearch };
};

export default useSearchTransferByStatusHook;
