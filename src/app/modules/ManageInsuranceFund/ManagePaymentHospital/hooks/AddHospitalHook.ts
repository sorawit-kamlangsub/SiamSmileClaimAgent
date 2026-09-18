import { FormikErrors, useFormik } from "formik";
import { swalConfirm, swalError, swalSuccess } from "../../../_common";
import { useAddHospital } from "../addHospitalAPI";
import { setDialogOpen } from "../store/managePaymentHospitalSlice";
import { useAppDispatch } from "../../../../../redux";

type FormikDefaultValueType = {
    hospitalId: number;
    hospitalName: string; // required, minLength 1
    hospitalId_selectedText: string;
    autoPayDelayDays: number;
    holdStatusId: boolean;
    isAutoPay: boolean;
};

const defaultValue: FormikDefaultValueType = {
    hospitalId: 0,
    hospitalName: "", // required, minLength 1
    hospitalId_selectedText: "",
    autoPayDelayDays: 0,
    holdStatusId: false,
    isAutoPay: true,
};

const useAddHospitalHook = () => {
    const dispatch = useAppDispatch();

    const handleCloseDialog = () => {
        dispatch(setDialogOpen({ isOpen: false }));
    };
    const handleAddSuccess = () => {
        swalSuccess("ทำรายการสำเร็จ", "", "ยืนยัน").then((res) => {
            if (res.isConfirmed) {
                handleCloseDialog();
            }
        });
    };

    const handleError = (err: string) => {
        swalError("แจ้งเตือน", err);
    };

    const { mutate: mutateAddHospital, isLoading: isAddHospitalLoading } = useAddHospital(
        handleAddSuccess,
        handleError
    );

    const formik = useFormik<FormikDefaultValueType>({
        enableReinitialize: true,
        initialValues: defaultValue,
        validate: (values) => {
            const errors: FormikErrors<FormikDefaultValueType> = {};

            if (!values.hospitalId) {
                errors.hospitalId = "กรุณากรอกข้อมูล";
            }

            if (!values.autoPayDelayDays) {
                errors.autoPayDelayDays = "กรุณากรอกข้อมูล";
            }

            return errors;
        },
        onSubmit: (values) => {
            const payload = {
                hospitalId: values.hospitalId,
                hospitalName: values.hospitalId_selectedText,
                autoPayDelayDays: values.autoPayDelayDays,
                holdStatusId: values.holdStatusId ? 2 : 1,
                isAutoPay: values.isAutoPay,
            };
            swalConfirm("ยืนยันทำรายการ", "", "ยืนยัน", "ยกเลิก").then((res) => {
                if (res.isConfirmed) {
                    mutateAddHospital(payload);
                }
            });
        },
    });

    return { formik, isAddHospitalLoading };
};

export default useAddHospitalHook;
