import { useState } from "react";
import { useFormik } from "formik";
import dayjs, { Dayjs } from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../../redux";
import { setDaysCalculate } from "../../store/claimSimulateSlice";


export interface DaysCalculateFormValues {
    treatmentType: string;
    admitDate: Dayjs | null;
    dischargeDate: Dayjs | null;
    ipdDays: number;
    icuDays: number;
    bedDays: number;
    isContinuous: boolean;
    continuousFromClaimNo: string;
}


const toDayjsOrNull = (dateStr: string): Dayjs | null => (dateStr ? dayjs(dateStr) : null);

const toDateString = (date: Dayjs | null): string => (date ? dayjs(date).format("YYYY-MM-DD") : "");

const calcIpdDays = (admit: Dayjs | null, discharge: Dayjs | null): number => {
    if (!admit || !discharge) return 0;
    const diff = dayjs(discharge).diff(dayjs(admit), "day");
    return diff > 0 ? diff : 0;
};


const validate = (values: DaysCalculateFormValues) => {
    const errors: Partial<Record<keyof DaysCalculateFormValues, string>> = {};
    if (!values.treatmentType) errors.treatmentType = "โปรดระบุ";
    if (!values.admitDate) errors.admitDate = "โปรดระบุ";
    if (!values.dischargeDate) errors.dischargeDate = "โปรดระบุ";
    if (values.isContinuous && !values.continuousFromClaimNo) errors.continuousFromClaimNo = "โปรดระบุ";
    return errors;
};


export const useDaysCalculate = () => {
    const dispatch = useDispatch();
    const { daysCalculate } = useSelector((s: RootState) => s.claimsimulate);
    const [openConfirm, setOpenConfirm] = useState(false);

    const formik = useFormik<DaysCalculateFormValues>({
        initialValues: {
            treatmentType: daysCalculate.treatmentType,
            admitDate: toDayjsOrNull(daysCalculate.admitDate),
            dischargeDate: toDayjsOrNull(daysCalculate.dischargeDate),
            ipdDays: daysCalculate.ipdDays,
            icuDays: daysCalculate.icuDays,
            bedDays: daysCalculate.bedDays,
            isContinuous: daysCalculate.isContinuous,
            continuousFromClaimNo: daysCalculate.continuousFromClaimNo,
        },
        validate,
        onSubmit: (values) => {
            dispatch(
                setDaysCalculate({
                    treatmentType: values.treatmentType,
                    admitDate: toDateString(values.admitDate),
                    dischargeDate: toDateString(values.dischargeDate),
                    ipdDays: values.ipdDays,
                    icuDays: values.icuDays,
                    bedDays: values.bedDays,
                    isContinuous: values.isContinuous,
                    continuousFromClaimNo: values.continuousFromClaimNo,
                })
            );
        },
    });

    const syncToRedux = (patch: Partial<DaysCalculateFormValues>) => {
        dispatch(
            setDaysCalculate({
                treatmentType: patch.treatmentType ?? formik.values.treatmentType,
                admitDate: toDateString(patch.admitDate !== undefined ? patch.admitDate : formik.values.admitDate),
                dischargeDate: toDateString(
                    patch.dischargeDate !== undefined ? patch.dischargeDate : formik.values.dischargeDate
                ),
                ipdDays: patch.ipdDays ?? formik.values.ipdDays,
                icuDays: patch.icuDays ?? formik.values.icuDays,
                bedDays: patch.bedDays ?? formik.values.bedDays,
                isContinuous: patch.isContinuous ?? formik.values.isContinuous,
                continuousFromClaimNo: patch.continuousFromClaimNo ?? formik.values.continuousFromClaimNo,
            })
        );
    };

    const handleAdmitDateChange = (date: Dayjs | null) => {
        formik.setFieldValue("admitDate", date);
        syncToRedux({ admitDate: date });
    };

    const handleDischargeDateChange = (date: Dayjs | null) => {
        formik.setFieldValue("dischargeDate", date);
        syncToRedux({ dischargeDate: date });
    };

    const handleCalculate = () => {
        const days = calcIpdDays(formik.values.admitDate, formik.values.dischargeDate);
        formik.setFieldValue("ipdDays", days);
        formik.setFieldValue("bedDays", days);
        syncToRedux({ ipdDays: days, bedDays: days });
        setOpenConfirm(true);
    };

    const handleContinuousChange = (checked: boolean) => {
        formik.setFieldValue("isContinuous", checked);
        if (!checked) formik.setFieldValue("continuousFromClaimNo", "");
        syncToRedux({ isContinuous: checked, ...(!checked && { continuousFromClaimNo: "" }) });
    };

    const handleConfirm = () => {
        setOpenConfirm(false);
        formik.handleSubmit();
    };

    return {
        formik,
        daysCalculate,
        openConfirm,
        handleAdmitDateChange,
        handleDischargeDateChange,
        handleCalculate,
        handleContinuousChange,
        handleConfirm,
        handleCloseConfirm: () => setOpenConfirm(false),
    };
};

