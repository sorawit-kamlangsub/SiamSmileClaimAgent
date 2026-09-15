import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { PermissionList } from "../../Const";
import { checkPermissions, checkRole, useAuth } from "../modules/_auth";
import { ServiceResponse } from "../modules/_common";

const menuUrl = document.getElementById("root")?.getAttribute("data-menu-url");

export type MenuGroupProps = {
    linkGroupId: number;
    linkGroupName: string;
    links?: MenuProps[];
};

export type MenuProps = {
    linkId: number;
    linkOrder: number;
    linkIcon: string;
    linkIconFA6: string;
    linkURL: string;
    linkTitle: string;
    linkDescription: string;
    linkRole: string[];
    linkPermission: string[];
};

export const getAppMenu = async () => {
    if (!menuUrl) return undefined;
    const client = axios.create();

    const reponse = await client.get<ServiceResponse<MenuGroupProps[]>>(menuUrl || "");

    return reponse.data.data;
};

export const useAppMenu = () => {
    return useQuery(["menu"], getAppMenu, {
        staleTime: 1000 * 60 * 60 * 24,
    });
};

export const useAppMenuFilter = (keyword?: string) => {
    const { data, isLoading } = useAppMenu();

    if (!data) return { data: undefined, isLoading };

    if (keyword && keyword !== "")
        return {
            data: data
                .filter(
                    (x) =>
                        x.links?.some(
                            (y) =>
                                y.linkTitle.toLowerCase().includes(keyword.toLowerCase()) ||
                                y.linkDescription.toLowerCase().includes(keyword.toLowerCase())
                        )
                )
                .map((x) => ({
                    ...x,
                    links: x.links?.filter(
                        (y) =>
                            y.linkTitle.toLowerCase().includes(keyword.toLowerCase()) ||
                            y.linkDescription.toLowerCase().includes(keyword.toLowerCase())
                    ),
                })),
            isLoading,
        };

    return { data, isLoading };
};

export const useAppMenuLinksFilter = (keyword?: string, linkId?: number[]) => {
    const { data, isLoading } = useAppMenu();

    const links = data?.flatMap((x) => x.links || []);
    if (!data || !links) return { data: undefined, isLoading };

    if (keyword && keyword !== "")
        return {
            data: links
                .filter(
                    (y) =>
                        (y.linkTitle.toLowerCase().includes(keyword.toLowerCase()) ||
                            y.linkDescription.toLowerCase().includes(keyword.toLowerCase())) &&
                        filterLinks(y.linkRole, y.linkPermission)
                )
                .slice(0, 10),
            isLoading,
        };

    if (linkId)
        return {
            data: linkId.map((id) => links.find((x) => x.linkId === id)),
            isLoading,
        };

    return { data: links, isLoading };
};

const filterLinks = (roles: string[], permissions: string[]) => {
    let result = true;
    if ((!roles && !permissions) || (roles.length === 0 && permissions.length === 0)) return result;

    const { roles: userRoles, permissions: userPermissions } = useAuth();
    if (roles.length > 0) result = result && checkRole(userRoles, roles);
    if (permissions.length > 0) result = result && checkPermissions(userPermissions, permissions as PermissionList[]);

    return result;
};
