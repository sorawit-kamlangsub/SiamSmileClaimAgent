import { useParams } from "react-router-dom";
import { useGetTransferHistory } from "../../adjustClaimAPI";
const useTransferHistoryHook = () => {
    const { id = "" } = useParams();
    const { data: transferHistoryData, isLoading: isTransferHistoryLoading } = useGetTransferHistory(id);

    return { transferHistoryData, isTransferHistoryLoading };
};

export default useTransferHistoryHook;
