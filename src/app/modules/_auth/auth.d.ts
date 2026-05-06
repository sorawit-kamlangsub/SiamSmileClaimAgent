import { User } from "oidc-client-ts";

export type PermissionCondition = "AND" | "OR";

export type AuthContextType = {
    isAuthenticated: boolean;
    authTokens: string;
    roles: string[];
    permissions: string[];
    user: User | null;
    userProfile: UserProperties | null;
};

export type CustomClaims = {
    [key: string]: any;
    role?: string[] | string;
    permission?: string[] | string;
    user_id?: number;
    Username?: string;
    Employee_ID?: number;
    EmployeeCode?: string;
    Person_ID?: number;
    FullName?: string;
    FirstName?: string;
    LastName?: string;
    Branch_ID?: number;
    BranchDetail?: string;
    Area_ID?: number;
    AreaDetail?: string;
    Department_ID?: number;
    DepartmentDetail?: string;
    EmployeeTeam_ID?: number;
    EmployeeTeamDetail?: string;
    EmployeePosition_ID?: number;
    EmployeePositionDetail?: string;
};

export type UserProperties = {
    userId?: number;
    userName?: string;
    email?: string;
    employeeId?: number;
    employeeCode?: string;
    personId?: number;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    branchId?: number;
    branchDetail?: string;
    areaId?: number;
    areaDetail?: string;
    departmentId?: number;
    departmentDetail?: string;
    teamId?: number;
    teamDetail?: string;
    positionId?: number;
    positionDetail?: string;
};
