import { useAuth } from "../_auth";
import { HEAD_OFFICE_BRANCH_ID } from "../../../Const";

export const useBranchByUserPermission = <T extends { branchId?: number }>(branches: T[] | undefined): T[] => {
    const { userProfile } = useAuth();
    const employeeBranchId = userProfile?.employeeBranchId;

    if (employeeBranchId === undefined || employeeBranchId === null) return [];

    if (employeeBranchId === HEAD_OFFICE_BRANCH_ID) return branches ?? [];

    return (branches ?? []).filter((branch) => Number(branch.branchId) === Number(employeeBranchId));
};

export const useIsHeadOfficeBranch = (): boolean => {
    const { userProfile } = useAuth();
    return userProfile?.employeeBranchId === HEAD_OFFICE_BRANCH_ID;
};