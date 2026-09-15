import { Icon, ListItemButton, ListItemIcon, Tooltip, styled } from "@mui/material";
import { useEffect, useState } from "react";
import { Link, LinkProps } from "react-router-dom";
import { PermissionList } from "../../../Const";
import { PermissionCondition, checkPermissions, useAuth } from "../../modules/_auth";

export const MenuItemListItemIcon = ({ icon }: { icon: string | JSX.Element }) => {
    const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
        minWidth: "2rem",
        color: theme.palette.primary.contrastText,
    }));

    return (
        <StyledListItemIcon>
            <Icon fontSize="small">{icon}</Icon>
        </StyledListItemIcon>
    );
};

export const MenuItemLink = ({ text }: { text: string }) => {
    const StyledSpan = styled("span")(({ theme }) => ({
        fontSize: `calc(${theme.typography.h6.fontSize} -1rem)`,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        color: theme.palette.primary.contrastText,
    }));

    return (
        <Tooltip title={text} placement="right">
            <StyledSpan>{text}</StyledSpan>
        </Tooltip>
    );
};

export const MenuItemListItemButton = styled(ListItemButton)<Partial<LinkProps> & { component?: any }>(({ theme }) => ({
    padding: theme.spacing(1.5),
    "& .expand-icon": {
        marginLeft: "auto",
        color: theme.palette.primary.contrastText,
    },
}));

type MenuItemProps = {
    path: string;
    icon: string | JSX.Element;
    text: string;
    permissions?: PermissionList[];
    condition?: PermissionCondition;
};

const MenuItem = ({ path, icon, text, permissions, condition = "OR" }: MenuItemProps) => {
    const { permissions: userPermissions } = useAuth();

    const [isShow, setIsShow] = useState<boolean>(false);

    useEffect(() => {
        if (!permissions) {
            setIsShow(true);

            return;
        }

        const hasPermission = checkPermissions(userPermissions, permissions, condition);
        if (hasPermission) setIsShow(true);
    }, [userPermissions]);

    return (
        <>
            {isShow && (
                <MenuItemListItemButton component={Link} to={path} dense selected={path == location.pathname}>
                    <MenuItemListItemIcon icon={icon} />
                    <MenuItemLink text={text} />
                </MenuItemListItemButton>
            )}
        </>
    );
};

export default MenuItem;
