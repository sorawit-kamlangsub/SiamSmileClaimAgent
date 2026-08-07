import { useAppDispatch, useAppSelector } from "../../../../../redux";
import { monitorSelector } from "../../store/monitorSlice";
import { setIsContinuous as setIsContinuousPH, setOldClaim as setOldClaimPH } from "../../store/claimPHSlice";
import { setIsContinuous as setIsContinuousPA, setOldClaim as setOldClaimPA } from "../../store/claimPASlice";
import { useNavigate } from "react-router-dom";
import { GetClaimHistoryDtoResponse } from "../../../../api/coreClaimApi.client";

export const useMonitorClaimHistory = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { selectedPolicy } = useAppSelector(monitorSelector);

    const handleContinuousClaim = (item: GetClaimHistoryDtoResponse) => {
        const continuous = true;
        if (selectedPolicy?.productTypeId === 26) {
            dispatch(setIsContinuousPA(continuous));
            dispatch(setOldClaimPA(item));
            navigate(
                `/claim/pa/${btoa(selectedPolicy?.appId || "")}/${btoa(selectedPolicy?.customerId?.toString() || "")}`
            );
        } else if (selectedPolicy?.productTypeId === 6) {
            dispatch(setIsContinuousPH(continuous));
            dispatch(setOldClaimPH(item));
            navigate(
                `/claim/ph/${btoa(selectedPolicy?.appId || "")}/${btoa(selectedPolicy?.customerId?.toString() || "")}`
            );
        }
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
