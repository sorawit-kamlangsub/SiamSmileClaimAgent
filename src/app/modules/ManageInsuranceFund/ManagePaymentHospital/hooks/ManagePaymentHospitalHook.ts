import { useFormik } from "formik";
import { useAppDispatch } from "../../../../../redux";
import { setDialogOpen, setManagePaymentHospitalBySearchDetail } from "../store/managePaymentHospitalSlice";
import { swalError, swalSuccess, swalWarning } from "../../../_common";
import { useGetHospitalMonitor, useUpdateHospitalSetting } from "../managePaymentHospitalAPI";
import { useState } from "react";

type SearchDetailType = {
    searchDetail: string;
};

const useManagePaymentHospitalHook = () => {
    const dispatch = useAppDispatch();
    const [submittedSearchDetail, setSubmittedSearchDetail] = useState<string>("");

    const handleOpenDialog = () => {
        dispatch(setDialogOpen({ isOpen: true }));
    };

    const handleUpdateSettingSuccess = (res: any) => {
        if (res?.data?.isSuccess) {
            swalSuccess("ทำรายการสำเร็จ", "");
        } else {
            swalWarning("แจ้งเตือน", res?.data?.message ?? "เกิดข้อผิดพลาด");
        }
    };

    const handleError = (err: string) => {
        swalError("แจ้งเตือน", err ?? "กรุณาตรวจสอบข้อมูล");
    };

    const { mutate: updateHospitalSettingMutate, isLoading: isUpdateHospitalSettingLoading } = useUpdateHospitalSetting(
        handleUpdateSettingSuccess,
        handleError
    );

    const formik = useFormik<SearchDetailType>({
        initialValues: {
            searchDetail: "",
        },
        onSubmit: (values) => {
            dispatch(setManagePaymentHospitalBySearchDetail(values));
            setSubmittedSearchDetail(values.searchDetail);
        },
    });

    const { data: hospitalData, isLoading: isGetHospitalLoading } = useGetHospitalMonitor(submittedSearchDetail);

    return {
        hospitalData: hospitalData?.data,
        handleOpenDialog,
        formik,
        isGetHospitalLoading,
        updateHospitalSettingMutate,
        isUpdateHospitalSettingLoading,
    };
};

export default useManagePaymentHospitalHook;
