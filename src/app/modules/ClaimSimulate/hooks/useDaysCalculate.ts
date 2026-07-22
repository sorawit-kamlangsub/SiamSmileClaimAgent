import { useEffect, useRef, useState } from "react";
import { FormikErrors, useFormik } from "formik";
import dayjs, { Dayjs } from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../redux";
import { setDaysCalculate, setCalculateResult } from "../store/claimSimulateSlice";
import { swalError } from "../../_common";
import { useCalculateCaseClaim } from "../../../api/coreClaimApi";
import {
    CalculateCaseClaim,
    CalculateCaseClaimDtoRequest,
    CalculateCaseDisability,
} from "../../../api/coreClaimApi.client";
import { useGetDataFromApi } from "./useGetDataFromApi";

export interface DaysCalculateFormValues {
    claimCause: number | undefined;
    coverageType: number | undefined;
    medicalType: number | undefined;
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
    const errors: FormikErrors<DaysCalculateFormValues> = {};

    if (!values.claimCause) {
        errors.claimCause = "โปรดระบุ";
    }

    if (!values.coverageType) {
        errors.coverageType = "โปรดระบุ";
    }

    if (!values.medicalType) {
        errors.medicalType = "โปรดระบุ";
    }

    if (!values.dateHappen) {
        errors.dateHappen = "โปรดระบุ";
    }

    if (!values.admitDate) {
        errors.admitDate = "โปรดระบุ";
    }

    if (!values.dischargeDate) {
        errors.dischargeDate = "โปรดระบุ";
    }

    if (values.isContinuous && !values.continuousFromClaimNo) {
        errors.continuousFromClaimNo = "โปรดระบุ";
    }

    const bedDays = calcIpdDays(values.admitDate, values.dischargeDate);

    if ((values.ipdDays ?? 0) > bedDays) {
        errors.ipdDays = "จำนวนวัน IPD ต้องไม่เกินจำนวนวันนอน";
    }

    if ((values.icuDays ?? 0) > bedDays) {
        errors.icuDays = "จำนวนวัน ICU ต้องไม่เกินจำนวนวันนอน";
    }

    const totalDays = (values.ipdDays ?? 0) + (values.icuDays ?? 0);

    if (totalDays > bedDays) {
        errors.ipdDays = "จำนวนวัน IPD รวมกับ ICU ต้องเท่ากับจำนวนวันนอน";
        errors.icuDays = "จำนวนวัน IPD รวมกับ ICU ต้องเท่ากับจำนวนวันนอน";
    } else if (totalDays < bedDays) {
        errors.ipdDays = "จำนวนวัน IPD รวมกับ ICU ต้องเท่ากับจำนวนวันนอน";
        errors.icuDays = "จำนวนวัน IPD รวมกับ ICU ต้องเท่ากับจำนวนวันนอน";
    }

    return errors;
};

const COVERAGE_TYPE_DISABILITY = 4;

export const useDaysCalculate = () => {
    const dispatch = useDispatch();
    const { daysCalculate, filledItems, medicalTypeId, header, selectedInsured } = useSelector(
        (s: RootState) => s.claimsimulate
    );

    const { claimContinueOptions } = useGetDataFromApi(selectedInsured?.policyCode);

    const [openConfirm, setOpenConfirm] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);

    const onSuccessCallback = () => {};
    const onErrorCallback = (error: string) => swalError("Error", error);
    const calculateCaseClaim = useCalculateCaseClaim(onSuccessCallback, onErrorCallback);

    const formik = useFormik<DaysCalculateFormValues>({
        initialValues: {
            claimCause: daysCalculate.claimCause,
            coverageType: daysCalculate.coverageType,
            medicalType: daysCalculate.medicalType,
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
                    claimCause: values.claimCause,
                    coverageType: values.coverageType,
                    medicalType: values.medicalType,
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
                claimCause: patch.claimCause ?? formik.values.claimCause,
                coverageType: patch.coverageType ?? formik.values.coverageType,
                medicalType: patch.medicalType ?? formik.values.medicalType,
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

    const prevBedDaysRef = useRef(calcIpdDays(daysCalculate.admitDate, daysCalculate.dischargeDate));
    const ipdAutoSetRef = useRef(Boolean(daysCalculate.ipdDays));

    useEffect(() => {
        const days = calcIpdDays(formik.values.admitDate, formik.values.dischargeDate);

        if (days !== prevBedDaysRef.current) {
            if (!ipdAutoSetRef.current) {
                formik.setFieldValue("ipdDays", days);
                formik.setFieldValue("bedDays", days);
                ipdAutoSetRef.current = true;
                syncToRedux({
                    dateHappen: formik.values.dateHappen,
                    admitDate: formik.values.admitDate,
                    dischargeDate: formik.values.dischargeDate,
                    ipdDays: days,
                    bedDays: days,
                });
            } else {
                formik.setFieldValue("bedDays", days);
                syncToRedux({
                    dateHappen: formik.values.dateHappen,
                    admitDate: formik.values.admitDate,
                    dischargeDate: formik.values.dischargeDate,
                    bedDays: days,
                });
            }
        } else {
            syncToRedux({
                dateHappen: formik.values.dateHappen,
                admitDate: formik.values.admitDate,
                dischargeDate: formik.values.dischargeDate,
                bedDays: days,
            });
        }

        prevBedDaysRef.current = days;
    }, [formik.values.dateHappen, formik.values.admitDate, formik.values.dischargeDate]);

    const handleIpdDaysChange = (value: number) => {
        ipdAutoSetRef.current = true;
        formik.setFieldValue("ipdDays", value, true);
        formik.setFieldTouched("ipdDays", true, false);
        syncToRedux({ ipdDays: value });
    };

    const handleIcuDaysChange = (value: number) => {
        formik.setFieldValue("icuDays", value, true);
        formik.setFieldTouched("icuDays", true, false);
        syncToRedux({ icuDays: value });
    };

    const validateDaysCalculate = async () => {
        const errors = await formik.validateForm();
        if (Object.keys(errors).length > 0) {
            formik.setTouched(
                Object.keys(errors).reduce((acc, key) => ({ ...acc, [key]: true }), {} as Record<string, boolean>)
            );
            return false;
        }
        return true;
    };

    const handleCalculate = async () => {
        const isValid = await validateDaysCalculate();
        if (!isValid) return;

        const selectedContinueClaimNo = formik.values.isContinuous
            ? claimContinueOptions.find((opt) => opt.claimId === formik.values.continuousFromClaimNo)?.claimNo
            : undefined;

        const isDisabilityCoverage = header.coverageType === COVERAGE_TYPE_DISABILITY;

        const disabilityList: CalculateCaseDisability[] = isDisabilityCoverage
            ? filledItems.map((item) => ({
                  standardMedicalExpenseId: item.standardMedicalExpenseId,
                  bodyPartId: item.bodyPartId,
                  originalAmount: item.claimAmount,
                  discountAmount: item.discount,
                  nonCoverAmount: item.notCovered,
                  disabilityPercent: undefined,
                  reasonId: item.reason,
                  remark: item.remark,
              }))
            : [];

        const calculateDetail: CalculateCaseClaim = {
            productId: selectedInsured?.productId,
            coverageTypeId: header.coverageType,
            medicalTypeId: medicalTypeId,
            incidentTypeId: header.claimCause,
            occurrenceDate: formik.values.dateHappen,
            ipdCount: formik.values.ipdDays,
            icuCount: formik.values.icuDays,
            continueClaimNo: formik.values.isContinuous ? selectedContinueClaimNo : undefined,
            expenseList: isDisabilityCoverage
                ? []
                : filledItems.map((item) => ({
                      standardMedicalExpenseId: item.standardMedicalExpenseId,
                      description: item.description,
                      originalAmount: item.claimAmount,
                      discountAmount: item.discount,
                      nonCoverAmount: item.notCovered,
                      reasonId: item.reason,
                      remark: item.remark,
                  })),
            disabilityList,
        };

        const payload: CalculateCaseClaimDtoRequest = {
            caseAdjudicationId: undefined,
            isSimulateCase: true,
            isCheckIncludeCompensate: false,
            isCheckIncludeCompensateAll: false,
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
        handleIpdDaysChange,
        handleIcuDaysChange,
        handleCalculate,
        validateDaysCalculate,
        handleContinuousChange,
        handleConfirm,
        handleCloseConfirm: () => setOpenConfirm(false),
    };
};
