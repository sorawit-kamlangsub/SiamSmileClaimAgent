import axios from "axios";
import { User, UserManager } from "oidc-client-ts";
import React, { useCallback, useEffect, useState } from "react";
import { AuthContext } from "../auth";
import { CustomClaims, UserProperties } from "../auth.d";
import { clearAuthRedirectInProgress, isAuthRedirectInProgress, setAuthRedirectInProgress } from "../authRedirect";

export type AuthProviderProps = {
    children: React.ReactNode;
    oidcUserManager: UserManager;
};

const CheckArray = (source: string | string[] | undefined | null): string[] => {
    if (source === undefined || source === null) {
        return [];
    }

    if (Array.isArray(source)) {
        return source;
    }

    return [source];
};

export const AuthProvider = ({ children, oidcUserManager }: AuthProviderProps) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [authTokens, setAuthTokens] = useState<string>("");
    const [roles, setRoles] = useState<string[]>([]);
    const [permissions, setPermissions] = useState<string[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProperties | null>(null);

    const setLogin = useCallback((user: User) => {
        const profile = user.profile as CustomClaims;

        const roles = CheckArray(profile.role);
        const permissions = CheckArray(profile.permission);
        const userProfile: UserProperties = {
            userId: profile.user_id,
            userName: profile.Username,
            email: profile.email,
            employeeId: profile.Employee_ID,
            employeeCode: profile.EmployeeCode,
            personId: profile.Person_ID,
            fullName: profile.FullName,
            firstName: profile.FirstName,
            lastName: profile.LastName,
            branchId: profile.Branch_ID,
            branchDetail: profile.BranchDetail,
            areaId: profile.Area_ID,
            areaDetail: profile.AreaDetail,
            departmentId: profile.Department_ID,
            departmentDetail: profile.DepartmentDetail,
            teamId: profile.EmployeeTeam_ID,
            teamDetail: profile.EmployeeTeamDetail,
            positionId: profile.EmployeePosition_ID,
            positionDetail: profile.EmployeePositionDetail,
        };

        setIsAuthenticated(true);
        setAuthTokens(user.access_token);
        setRoles(roles);
        setPermissions(permissions);
        setUser(user);
        setUserProfile(userProfile);

        axios.interceptors.request.use((config) => {
            if (user.access_token) {
                config.headers.Authorization = `Bearer ${user.access_token}`;
                config.headers["Access-Control-Allow-Origin"] = "*";
            }

            return config;
        });
    }, []);

    const setLogout = useCallback(() => {
        setIsAuthenticated(false);
        setAuthTokens("");
        setRoles([]);
        setPermissions([]);
        setUser(null);
        setUserProfile(null);
    }, []);

    const getState = useCallback(() => {
        const returnUrl = document.location.pathname + document.location.search;

        return { returnUrl: returnUrl };
    }, []);

    const signinRedirectWithGuard = useCallback(async () => {
        if (isAuthRedirectInProgress()) {
            return;
        }

        setAuthRedirectInProgress();
        try {
            await oidcUserManager.signinRedirect({ state: getState() });
        } catch (error) {
            clearAuthRedirectInProgress();
            throw error;
        }
    }, [getState, oidcUserManager]);

    const signinSilentThenRedirect = useCallback(async () => {
        try {
            await oidcUserManager.signinSilent();
        } catch {
            await signinRedirectWithGuard();
        }
    }, [oidcUserManager, signinRedirectWithGuard]);

    useEffect(() => {
        const onAccessTokenExpired = async () => {
            oidcUserManager.removeUser();
            oidcUserManager.clearStaleState();
            await signinSilentThenRedirect();
        };

        const onUserLoaded = (loadedUser: User) => {
            clearAuthRedirectInProgress();
            setLogin(loadedUser);
        };

        const onUserUnloaded = () => {
            setLogout();
        };

        const onUserSignedOut = async () => {
            oidcUserManager.removeUser();
            oidcUserManager.clearStaleState();
            await signinRedirectWithGuard();
        };

        const onAccessTokenExpiring = () => {
            oidcUserManager.startSilentRenew();
        };

        oidcUserManager.events.addAccessTokenExpired(onAccessTokenExpired);
        oidcUserManager.events.addUserLoaded(onUserLoaded);
        oidcUserManager.events.addUserUnloaded(onUserUnloaded);
        oidcUserManager.events.addUserSignedOut(onUserSignedOut);
        oidcUserManager.events.addAccessTokenExpiring(onAccessTokenExpiring);

        return () => {
            oidcUserManager.events.removeAccessTokenExpired(onAccessTokenExpired);
            oidcUserManager.events.removeUserLoaded(onUserLoaded);
            oidcUserManager.events.removeUserUnloaded(onUserUnloaded);
            oidcUserManager.events.removeUserSignedOut(onUserSignedOut);
            oidcUserManager.events.removeAccessTokenExpiring(onAccessTokenExpiring);
        };
    }, [oidcUserManager, setLogin, setLogout, signinRedirectWithGuard, signinSilentThenRedirect]);

    useEffect(() => {
        const processGetUser = async () => {
            const user = await oidcUserManager.getUser();
            if (user) {
                clearAuthRedirectInProgress();
                setLogin(user);
                oidcUserManager.clearStaleState();
            } else {
                setLogout();
                await signinSilentThenRedirect();
            }
        };

        processGetUser();
    }, [oidcUserManager, setLogin, setLogout, signinSilentThenRedirect]);

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                authTokens,
                roles,
                permissions,
                user,
                userProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
