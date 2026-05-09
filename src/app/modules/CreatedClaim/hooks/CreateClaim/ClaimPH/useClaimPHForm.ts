import { useEffect } from "react";
import dayjs from "dayjs";
import { useFormik, FormikErrors } from "formik";
import { useAppDispatch, useAppSelector } from "../../../../../../redux";
import { ClaimFormValues, claimPHSelector, setClaimForm } from "../../../store/claimPHSlice";

interface Options {
    onNext: () => void;
}

export const useClaimPHForm = ({ onNext }: Options) => {
    const dispatch = useAppDispatch();
    const { form, isContinuous, oldClaim } = useAppSelector(claimPHSelector);

    const formik = useFormik<ClaimFormValues>({
        initialValues: {
            ...form,
        },
        enableReinitialize: true,
        validate: (values) => {
            const errors: FormikErrors<ClaimFormValues> = {};
            if (!values.documentReceiver) errors.documentReceiver = "โปรดระบุ";
            if (!values.serviceProvider) errors.serviceProvider = "โปรดระบุ";
            if (!values.carOwner) errors.carOwner = "โปรดระบุ";
            if (!values.claimType) errors.claimType = "โปรดระบุ";
            if (!values.incidentDate) errors.incidentDate = "โปรดระบุ";
            if (!values.symptomType) errors.symptomType = "โปรดระบุ";
            if (values.symptomType === "ระบุอาการ" && !values.chiefComplain) errors.chiefComplain = "โปรดระบุ";
            if (values.symptomType === "อื่นๆ" && !values.remark) errors.remark = "โปรดระบุ";
            // IPD validation
            if (values.claimType === "IPD") {
                if (!values.normalRoom && !values.icuRoom) errors.normalRoom = "โปรดเลือกอย่างน้อย 1 ห้อง";
            }
            // OPD validation
            if (values.claimType === "OPD" && !values.opdSubType) errors.opdSubType = "โปรดระบุ";
            return errors;
        },
        onSubmit: (values) => {
            dispatch(setClaimForm(values));
            onNext();
        },
    });

    useEffect(() => {
        formik.setFieldValue("opdSubType", "");
    }, [formik.values.claimType]);

    useEffect(() => {
        if (isContinuous && oldClaim?.incidentDate) {
            formik.setFieldValue("incidentDate", dayjs(oldClaim.incidentDate));
        }
    }, [isContinuous, oldClaim?.incidentDate]);

    const isIncidentDateDisabled = isContinuous;

    return { formik, isContinuous, isIncidentDateDisabled };
};
