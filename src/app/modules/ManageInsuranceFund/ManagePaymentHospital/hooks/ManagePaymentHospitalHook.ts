import { useFormik } from "formik";
import { useAppDispatch } from "../../../../../redux";
import { setDialogOpen, setManagePaymentHospitalBySearchDetail } from "../store/managePaymentHospitalSlice";

type SearchDetailType = {
    searchDetail: string;
};

const useManagePaymentHospitalHook = () => {
    const dispatch = useAppDispatch();

    const handleOpenDialog = () => {
        dispatch(setDialogOpen({ isOpen: true }));
    };

    const formik = useFormik<SearchDetailType>({
        initialValues: {
            searchDetail: "",
        },
        onSubmit: (values) => {
            dispatch(setManagePaymentHospitalBySearchDetail(values));
        },
    });
    return { handleOpenDialog, formik };
};

export default useManagePaymentHospitalHook;
