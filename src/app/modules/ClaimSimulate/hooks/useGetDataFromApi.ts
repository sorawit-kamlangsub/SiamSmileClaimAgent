import dayjs from "dayjs";
import { useGetClaimContinue } from "../../../api/coreClaimApi";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";

export const useGetDataFromApi = (applicationId?: string | undefined) => {
    const { data: claimContinueData, isLoading: claimContinueLoading } = useGetClaimContinue(applicationId);

    dayjs.extend(buddhistEra);
    dayjs.locale("th");

    const claimContinueOptions =
        claimContinueData?.data?.map((item) => ({
            ...item,
            label: `${item.claimNo ?? "-"} | วันที่ ${
                item.incidentDate ? dayjs(item.incidentDate).format("DD/MM/BBBB") : "-"
            } | DX: ${item.chiefComplaint ?? "-"}`,
        })) ?? [];

    return {
        claimContinueLoading,
        claimContinueOptions,
    };
};
