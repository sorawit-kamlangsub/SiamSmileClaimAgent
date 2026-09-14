import { useFormik } from "formik";
import { useGetAdditionalTransferAccountDetail } from "../adjustTransferMonitorAPI";

type useAdditionalTransferAccountDetailHookProp = {
    paymentId: string;
};

type FormikValueType = {
    relationship: number | undefined;
    bankId: number | undefined;
    accountNo: string;
    accountName: string;
};

const useAdditionalTransferAccountDetailHook = ({ paymentId }: useAdditionalTransferAccountDetailHookProp) => {
    const formik = useFormik<FormikValueType>({
        initialValues: { relationship: undefined, bankId: undefined, accountNo: "", accountName: "" },
        onSubmit: (values) => {
            // TODO: call the "transfer again" API with the new account
            console.log(values);
        },
    });

    const { data: additionalTransferAccountDetailData, isLoading: isAdditionalTransferAccountDetailLoading } =
        useGetAdditionalTransferAccountDetail(paymentId);
    return {
        formik,
        dataDetail: additionalTransferAccountDetailData?.data?.[0],
        isAdditionalTransferAccountDetailLoading,
    };
};

export default useAdditionalTransferAccountDetailHook;
