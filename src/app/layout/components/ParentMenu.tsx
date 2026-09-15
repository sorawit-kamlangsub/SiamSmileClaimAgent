import { Collapse, Icon, List } from "@mui/material";
import React, { useEffect, useState } from "react";
import { PermissionList } from "../../../Const";
import { PermissionCondition, checkPermissions, useAuth } from "../../modules/_auth";
import { MenuItemLink, MenuItemListItemButton, MenuItemListItemIcon } from "./MenuItem";

type ParentMenuProps = {
    icon: string | JSX.Element;
    text: string;
    children?: React.ReactNode;
    permissions?: PermissionList[];
    condition?: PermissionCondition;
};

const ParentMenu = ({ icon, text, children, permissions, condition = "OR" }: ParentMenuProps) => {
    const { permissions: userPermissions } = useAuth();
    const [isShow, setIsShow] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const handleClick = () => {
        setIsOpen(!isOpen);
    };

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
                <>
                    <MenuItemListItemButton dense onClick={handleClick}>
                        <MenuItemListItemIcon icon={icon} />
                        <MenuItemLink text={text} />
                        {children && isOpen ? (
                            <Icon fontSize="small" className="expand-icon">
                                expand_less
                            </Icon>
                        ) : (
                            <Icon fontSize="small" className="expand-icon">
                                expand_more
                            </Icon>
                        )}
                    </MenuItemListItemButton>
                    <Collapse in={isOpen} timeout="auto" unmountOnExit>
                        <List>{children}</List>
                    </Collapse>
                </>
            )}
        </>
    );
};
export default ParentMenu;
