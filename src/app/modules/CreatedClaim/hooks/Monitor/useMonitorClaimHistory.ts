import { useAppSelector } from "../../../../../redux";
import { monitorSelector } from "../../store/monitorSlice";
import { GetClaimHistoryDtoResponse } from "../../../../api/coreClaimApi.client";

export const useMonitorClaimHistory = () => {
    // const dispatch = useAppDispatch();
    // const navigate = useNavigate();
    const { selectedPolicy } = useAppSelector(monitorSelector);

    const handleContinuousClaim = (item: GetClaimHistoryDtoResponse) => {
        const continuous = true;
        const oldClaimId = item.claimId?.toString() || "";

        if (selectedPolicy?.productTypeId === 26) {
            // dispatch(setIsContinuousPA(continuous));
            // dispatch(setOldClaimPA(item));
            window.open(
                `/claim/pa/${btoa(selectedPolicy?.appId || "")}/${btoa(
                    selectedPolicy?.customerId?.toString() || ""
                )}/${btoa(continuous.toString())}/${btoa(oldClaimId)}`,
                "_blank"
            );
        } else if (selectedPolicy?.productTypeId === 6) {
            // dispatch(setIsContinuousPH(continuous));
            // dispatch(setOldClaimPH(item));
            window.open(
                `/claim/ph/${btoa(selectedPolicy?.appId || "")}/${btoa(
                    selectedPolicy?.customerId?.toString() || ""
                )}/${btoa(continuous.toString())}/${btoa(oldClaimId)}`,
                "_blank"
            );
        }
    };

    const handleNewClaim = (productTypeId: number, customerId?: number) => {
        const continuous = false;
        const oldClaimId = "0";

        if (productTypeId === 26) {
            window.open(
                `claim/pa/${btoa(selectedPolicy?.appId || "")}/${btoa(customerId?.toString() || "")}/${btoa(
                    continuous.toString()
                )}/${btoa(oldClaimId)}`,
                "_blank"
            );
        } else if (productTypeId === 6) {
            window.open(
                `claim/ph/${btoa(selectedPolicy?.appId || "")}/${btoa(customerId?.toString() || "")}/${btoa(
                    continuous.toString()
                )}/${btoa(oldClaimId)}`,
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
