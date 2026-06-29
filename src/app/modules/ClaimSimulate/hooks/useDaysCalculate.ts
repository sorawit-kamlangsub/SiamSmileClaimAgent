import { useState } from "react";
import { useFormik } from "formik";
import dayjs, { Dayjs } from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../redux";
import { setDaysCalculate, setCalculateResult } from "../store/claimSimulateSlice";
import { swalError } from "../../_common";
import { useCalculateCaseClaim } from "../../../api/coreClaimApi";
import { CalculateCaseClaim, CalculateCaseClaimDtoRequest } from "../../../api/coreClaimApi.client";

export interface DaysCalculateFormValues {
    treatmentType: number | undefined;
    dateHappen: Dayjs | undefined;
    admitDate: Dayjs | undefined;
    dischargeDate: Dayjs | undefined;
    ipdDays: number;
    icuDays: number;
    bedDays: number;
    isContinuous: boolean;
    continuousFromClaimNo: string;
}

// - admit → discharge < 6 ชม = 0 วัน (ไม่นับ)
// - admit → discharge >= 6 ชม แต่ < 1 วัน = 1 วัน
// - 1 วัน 0 ชม - 1 วัน 5 ชม 59 นาที = 1 วัน
// - 1 วัน 6 ชม ขึ้นไป = 2 วัน
// สรุป: ทุก 1 วัน + >=6 ชม จะปัดขึ้น 1
const calcIpdDays = (admit: Dayjs | undefined, discharge: Dayjs | undefined): number => {
    if (!admit || !discharge) return 0;

    const diffMinutes = dayjs(discharge).diff(dayjs(admit), "minute");
    if (diffMinutes <= 0) return 0;

    const SIX_HOURS_IN_MINUTES = 6 * 60;
    const FULL_DAY_IN_MINUTES = 24 * 60;

    const fullDays = Math.floor(diffMinutes / FULL_DAY_IN_MINUTES);
    const remainingMinutes = diffMinutes % FULL_DAY_IN_MINUTES;

    const extraDay = remainingMinutes >= SIX_HOURS_IN_MINUTES ? 1 : 0;

    if (fullDays === 0 && extraDay === 0) return 0;

    return fullDays + extraDay;
};

const validate = (values: DaysCalculateFormValues) => {
    const errors: Partial<Record<keyof DaysCalculateFormValues, string>> = {};
    if (!values.treatmentType) errors.treatmentType = "โปรดระบุ";
    if (!values.dateHappen) errors.dateHappen = "โปรดระบุ";
    if (!values.admitDate) errors.admitDate = "โปรดระบุ";
    if (!values.dischargeDate) errors.dischargeDate = "โปรดระบุ";
    if (values.isContinuous && !values.continuousFromClaimNo) errors.continuousFromClaimNo = "โปรดระบุ";
    return errors;
};

export const useDaysCalculate = () => {
    const dispatch = useDispatch();
    const { daysCalculate, filledItems, medicalTypeId, selectedInsured } = useSelector(
        (s: RootState) => s.claimsimulate
    );

    const [openConfirm, setOpenConfirm] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);

    const onSuccessCallback = () => {};
    const onErrorCallback = (error: string) => swalError("Error", error);
    const calculateCaseClaim = useCalculateCaseClaim(onSuccessCallback, onErrorCallback);

    const formik = useFormik<DaysCalculateFormValues>({
        initialValues: {
            treatmentType: daysCalculate.treatmentType,
            dateHappen: daysCalculate.dateHappen,
            admitDate: daysCalculate.admitDate,
            dischargeDate: daysCalculate.dischargeDate,
            ipdDays: daysCalculate.ipdDays || 0,
            icuDays: daysCalculate.icuDays || 0,
            bedDays: daysCalculate.bedDays || 0,
            isContinuous: daysCalculate.isContinuous,
            continuousFromClaimNo: daysCalculate.continuousFromClaimNo || "",
        },
        validate,
        onSubmit: (values) => {
            dispatch(
                setDaysCalculate({
                    treatmentType: values.treatmentType,
                    dateHappen: values.dateHappen,
                    admitDate: values.admitDate,
                    dischargeDate: values.dischargeDate,
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
                dateHappen: patch.dateHappen !== undefined ? patch.dateHappen : formik.values.dateHappen,
                admitDate: patch.admitDate !== undefined ? patch.admitDate : formik.values.admitDate,
                dischargeDate: patch.dischargeDate !== undefined ? patch.dischargeDate : formik.values.dischargeDate,
                ipdDays: patch.ipdDays ?? formik.values.ipdDays,
                icuDays: patch.icuDays ?? formik.values.icuDays,
                bedDays: patch.bedDays ?? formik.values.bedDays,
                isContinuous: patch.isContinuous ?? formik.values.isContinuous,
                continuousFromClaimNo: patch.continuousFromClaimNo ?? formik.values.continuousFromClaimNo,
            })
        );
    };

    const recalcAndSync = (admit: Dayjs | undefined, discharge: Dayjs | undefined) => {
        const days = calcIpdDays(admit, discharge);
        formik.setFieldValue("ipdDays", days);
        formik.setFieldValue("bedDays", days);
        syncToRedux({ admitDate: admit, dischargeDate: discharge, ipdDays: days, bedDays: days });
    };

    const handleAdmitDateChange = (date: Dayjs | undefined) => {
        formik.setFieldValue("admitDate", date);
        recalcAndSync(date, formik.values.dischargeDate);
    };

    const handleDischargeDateChange = (date: Dayjs | undefined) => {
        formik.setFieldValue("dischargeDate", date);
        recalcAndSync(formik.values.admitDate, date);
    };

    const handleDateHappenChange = (date: Dayjs | undefined) => {
        formik.setFieldValue("dateHappen", date);
        syncToRedux({ dateHappen: date });
    };

    const handleCalculate = async () => {
        const errors = await formik.validateForm();
        if (Object.keys(errors).length > 0) {
            formik.setTouched(Object.keys(errors).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
            return;
        }

        const days = calcIpdDays(formik.values.admitDate, formik.values.dischargeDate);
        formik.setFieldValue("ipdDays", days);
        formik.setFieldValue("bedDays", days);
        syncToRedux({ ipdDays: days, bedDays: days });

        const calculateDetail: CalculateCaseClaim = {
            productId: 44,
            medicalTypeId: medicalTypeId,
            coverageTypeId: formik.values.treatmentType,
            incidentTypeId: 2,
            occurrenceDate: formik.values.dateHappen,
            ipdCount: formik.values.ipdDays,
            icuCount: formik.values.icuDays,
            continueClaimNoe: formik.values.isContinuous ? formik.values.continuousFromClaimNo : undefined,
            // occurrenceDate: formik.values.dateHappen,
            // dateIn: formik.values.admitDate,
            // dateOut: formik.values.dischargeDate,
            // icuCount: formik.values.icuDays,
            expenseList: filledItems.map((item) => ({
                code: item.code,
                description: item.description,
                claimAmount: item.claimAmount,
                discount: item.discount,
                notCovered: item.notCovered,
                reason: item.reason,
                remark: item.remark,
            })),
        };

        const payload: CalculateCaseClaimDtoRequest = {
            caseId: undefined,
            isSimulateCase: true,
            jsonDetail: calculateDetail,
        };

        try {
            setIsCalculating(true);
            const res = await calculateCaseClaim.mutateAsync(payload);
            if (res?.isSuccess && res.data) {
                dispatch(setCalculateResult(res.data));
                setOpenConfirm(true);
            }
        } catch {
            // error handled ใน onErrorCallback
        } finally {
            setIsCalculating(false);
        }
    };

    const handleContinuousChange = (checked: boolean) => {
        formik.setFieldValue("isContinuous", checked);
        if (!checked) formik.setFieldValue("continuousFromClaimNo", "");
        syncToRedux({
            isContinuous: checked,
            ...(!checked && { continuousFromClaimNo: "" }),
        });
    };

    const handleConfirm = () => {
        setOpenConfirm(false);
        formik.handleSubmit();
    };

    return {
        formik,
        daysCalculate,
        selectedInsured,
        openConfirm,
        isCalculating,
        handleDateHappenChange,
        handleAdmitDateChange,
        handleDischargeDateChange,
        handleCalculate,
        handleContinuousChange,
        handleConfirm,
        handleCloseConfirm: () => setOpenConfirm(false),
    };
};

