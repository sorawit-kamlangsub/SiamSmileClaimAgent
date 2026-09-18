import { useFormik } from "formik";
import { useAppDispatch } from "../../../../../redux";
import { setDialogOpen, setManagePaymentHospitalBySearchDetail } from "../store/managePaymentHospitalSlice";
import { useState } from "react";
import { swalError } from "../../../_common";
import { useGetHospitalMonitor } from "../managePaymentHospitalAPI";
import { HospitalPaySettingRow } from "./HospitalManagementDataTableHook";

type SearchDetailType = {
    searchDetail: string;
};

const useManagePaymentHospitalHook = () => {
    const dispatch = useAppDispatch();
    const [hospitalData, setHospitalData] = useState<HospitalPaySettingRow[]>([]);

    const handleOpenDialog = () => {
        dispatch(setDialogOpen({ isOpen: true }));
    };

    const handleSearchSuccess = (res: any) => {
        setHospitalData(res?.data ?? []);
    };

    const handleError = (err: string) => {
        swalError("แจ้งเตือน", err ?? "กรุณาตรวจสอบข้อมูล");
    };

    const { mutate: getHospitalMutate, isLoading: isGetHospitalLoading } = useGetHospitalMonitor(
        handleSearchSuccess,
        handleError
    );

    const formik = useFormik<SearchDetailType>({
        initialValues: {
            searchDetail: "",
        },
        onSubmit: (values) => {
            dispatch(setManagePaymentHospitalBySearchDetail(values));
            getHospitalMutate(values);
        },
    });
    return { hospitalData, handleOpenDialog, formik, isGetHospitalLoading };
};

export default useManagePaymentHospitalHook;
