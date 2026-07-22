import { useAppDispatch, useAppSelector } from "../../../../../redux";
import { monitorSelector } from "../../store/monitorSlice";
import { setIsContinuous } from "../../store/claimPHSlice";
import { GetClaimHistoryDtoResponse } from "../../../../api/coreClaimApi.client";

export const useMonitorClaimHistory = () => {
    const dispatch = useAppDispatch();
    const { selectedPolicy } = useAppSelector(monitorSelector);

    const handleContinuousClaim = (item: GetClaimHistoryDtoResponse) => {
        console.log("แจ้งเคลมต่อเนื่อง", item);
        const continuous = true;
        dispatch(setIsContinuous(continuous));
    };

    const handleNewClaim = (productTypeId: number, customerId?: number) => {
        if (productTypeId === 26) {
            window.open(
                `claim/pa/${btoa(selectedPolicy?.appId || "")}/${btoa(customerId?.toString() || "")}`,
                "_blank"
            );
        } else if (productTypeId === 6) {
            window.open(
                `claim/ph/${btoa(selectedPolicy?.appId || "")}/${btoa(customerId?.toString() || "")}`,
                "_blank"
            );
        }
    };

    return {
        selectedPolicy,
        handleContinuousClaim,
        handleNewClaim,
    };
};
