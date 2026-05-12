import { useFormik } from "formik";
import { useAppDispatch, useAppSelector } from "../../../../../../redux";
import {
    addClaimItem,
    updateClaimItem,
    ClaimInsuredItem,
    setEditingItemId,
    setClaimForm,
} from "../../../store/claimPASlice";

interface Props {
    onNext: () => void;
}

export const useClaimPAForm = ({ onNext }: Props) => {
    const dispatch = useAppDispatch();
    const { form, insured, claimItems, editingItemId } = useAppSelector((s) => s.claimpa);

    const formik = useFormik({
        initialValues: form,
        enableReinitialize: true,
        validate: (v) => {
            const e: any = {};
            if (!v.documentReceiver) e.documentReceiver = "โปรดระบุ";
            if (!v.serviceProvider) e.serviceProvider = "โปรดระบุ";
            if (!v.carOwner) e.carOwner = "โปรดระบุ";
            if (!v.claimType) e.claimType = "โปรดระบุ";
            if (!v.incidentDate) e.incidentDate = "โปรดระบุ";
            if (!v.claimAmount) e.claimAmount = "โปรดระบุ";
            if (v.symptomType === "ระบุอาการ" && !v.chiefComplain) e.chiefComplain = "โปรดระบุ";
            if (v.symptomType === "อื่นๆ" && !v.remark.trim()) e.remark = "โปรดระบุ";
            return e;
        },
        onSubmit: (values, { resetForm }) => {
            if (!insured) return;

            const item: ClaimInsuredItem = {
                id: editingItemId ?? Date.now().toString(),
                appId: insured.appId,
                seq: editingItemId
                    ? claimItems.find((i) => i.id === editingItemId)?.seq ?? claimItems.length + 1
                    : claimItems.length + 1,
                customerName: `${insured.prefix}${insured.firstName} ${insured.lastName}`,
                insuredType: insured.insuredType,
                claimType: values.claimType as any,
                opdSubType: values.opdSubType as any,
                claimAmount: Number(values.claimAmount),
            };

            dispatch(setClaimForm(values));

            if (editingItemId) {
                dispatch(updateClaimItem(item));
                dispatch(setEditingItemId(null));
            } else {
                dispatch(addClaimItem(item));
            }

            resetForm();
            onNext();
        },
    });

    return { formik };
};
