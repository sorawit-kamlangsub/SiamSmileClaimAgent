import { useFormik } from "formik";
import { useGetCurrentSettingHistory, useUpdateSetting } from "../../manageClaimFundAPI";
import { useEffect, useRef } from "react";
import { swalError } from "../../../_common";

export type FormikDefaultValueType = {
    transferAutoStatus: boolean;
};

const useManageAutoTransferHook = () => {
    const { data: currentSettingData, isLoading: currentSettingIsLoading } = useGetCurrentSettingHistory();
    const serverValueRef = useRef<boolean | undefined>(currentSettingData?.data?.isAutoTransfer);
    const initialSyncDoneRef = useRef(false);

    const handleSuccess = () => {};

    const handleError = (err: string) => {
        swalError("แจ้งเตือน", err);
    };

    const { mutate: updateSettingMutate, isLoading: updateSettingIsLoading } = useUpdateSetting(
        handleSuccess,
        handleError
    );

    const formik = useFormik<FormikDefaultValueType>({
        initialValues: {
            transferAutoStatus: currentSettingData?.data?.isAutoTransfer ?? false,
        },
        onSubmit: () => {},
    });

    useEffect(() => {
        if (currentSettingData?.data) {
            formik.setValues({ transferAutoStatus: !!currentSettingData.data.isAutoTransfer });
        }
    }, [currentSettingData]);

    useEffect(() => {
        if (!initialSyncDoneRef.current && currentSettingData?.data) {
            // initialize refs once
            serverValueRef.current = !!currentSettingData.data.isAutoTransfer;
            initialSyncDoneRef.current = true;
            return;
        }

        if (!initialSyncDoneRef.current) return;

        const prevServer = serverValueRef.current;
        const current = formik.values.transferAutoStatus;

        if (prevServer !== undefined && prevServer !== current) {
            updateSettingMutate({ paytransferSettingId: currentSettingData!.data.paytransferSettingId });
            // update serverValueRef if response implies success (or in onSuccess callback)
            serverValueRef.current = current;
        }
    }, [formik.values.transferAutoStatus, currentSettingData, updateSettingMutate]);

    return { formik, updateSettingMutate, currentSettingData, currentSettingIsLoading, updateSettingIsLoading };
};

export default useManageAutoTransferHook;
