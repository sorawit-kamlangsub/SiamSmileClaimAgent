import { useEffect } from "react";
import { useAppDispatch } from "../../../../../redux";
import { setItems, ClaimLineItem } from "../../store/claimLineSlice";
import { useGetClaimExpenseDetail } from "../../../../api/mastersApi";

interface UseClaimLineItemsProps {
    formatTypeId?: number;
    patientTypeId?: number;
    enabled: boolean;
}

export const useClaimLineItems = ({ formatTypeId, patientTypeId, enabled }: UseClaimLineItemsProps) => {
    const dispatch = useAppDispatch();

    const { data, isLoading, isError, refetch } = useGetClaimExpenseDetail(
        enabled,
        !!formatTypeId ? formatTypeId : undefined,
        !!patientTypeId ? patientTypeId : undefined
    );

    useEffect(() => {
        if (!data?.data) return;

        const items: ClaimLineItem[] = data.data.map((d, idx) => ({
            id: idx,
            code: d.inputItemCode,
            description: d.descriptionTH ? d.descriptionTH : d.descriptionEN ?? "",
            claimAmount: undefined,
            discount: undefined,
            notCovered: undefined,
            reason: undefined,
            remark: undefined,
            color: d.backgroundColorCode,
            disabled: false,
        }));

        dispatch(setItems(items));
    }, [data, dispatch]);

    return { isLoading, isError, refetch };
};
