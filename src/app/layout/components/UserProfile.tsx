import {
    Avatar,
    Button,
    Divider,
    Grid,
    Icon,
    ListItem,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Typography,
    styled,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";
import { APP_INFO, SSO_CONFIG } from "../../../Const";
import { UserProperties, logout, useAuth } from "../../modules/_auth";
import { getEmailGravatarUrl } from "../../modules/_common";

type UserProfileAvatarProps = {
    userProfile: UserProperties | null;
    width?: number;
    height?: number;
};

const UserProfileAvatar = ({ userProfile, width }: UserProfileAvatarProps) => {
    const CircleAvatar = styled(Avatar)(({ theme }) => ({
        width: width,
        height: width,
        backgroundColor: theme.palette.secondary.main,
        border: `1px solid ${theme.palette.text.disabled}`,
        fontSize: `${width ? width * 0.75 : 18}px`,
    }));

    return (
        <CircleAvatar>
            {userProfile?.email ? (
                <img src={getEmailGravatarUrl(userProfile?.email)} alt="avatar" width="100%" height="100%" />
            ) : (
                `${userProfile?.firstName?.charAt(0)}${userProfile?.lastName?.charAt(0)}`
            )}
        </CircleAvatar>
    );
};

UserProfileAvatar.defaultProps = {
    width: 32,
};

type UserProfileButtonProps = {
    userProfile: UserProperties | null;
    handleMenu?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

const UserProfileButton = ({ userProfile, handleMenu }: UserProfileButtonProps) => {
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up("lg"));

    const UserProfileTypography = styled(Typography)(({ theme }) => ({
        marginLeft: theme.spacing(1),
        color: theme.palette.text.secondary,
    }));

    return (
        <Button
            fullWidth={false}
            aria-label={userProfile?.fullName}
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
            style={{ backgroundColor: "transparent", boxShadow: "none" }}
        >
            <UserProfileAvatar userProfile={userProfile} />
            {matches && (
                <UserProfileTypography variant="caption">
                    {userProfile?.firstName} &#40;{userProfile?.employeeCode}
                    &#41;
                </UserProfileTypography>
            )}
        </Button>
    );
};

const UserProfile = () => {
    const { authority } = SSO_CONFIG;
    const { name: appTitle, mode, version } = APP_INFO;
    const { userProfile } = useAuth();

    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

    const open = Boolean(anchorEl);

    const handleMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
    };

    return (
        <>
            <UserProfileButton userProfile={userProfile} handleMenu={handleMenu} />
            <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                open={open}
                onClose={handleClose}
            >
                {/* start  User Profile*/}
                <ListItem alignItems="flex-start">
                    <ListItemIcon>
                        <UserProfileAvatar userProfile={userProfile} width={36} />
                    </ListItemIcon>
                    <ListItemText>
                        <Typography variant="body1">{userProfile?.fullName}</Typography>
                        <Typography variant="caption" style={{ width: "100%", lineHeight: 0.25 }}>
                            <b>รหัสพนักงาน :</b> {userProfile?.employeeCode}
                            <br />
                            <b>แผนก :</b> {userProfile?.departmentDetail}
                            <br />
                            <b>สาขา :</b> {userProfile?.branchDetail}
                        </Typography>
                    </ListItemText>
                </ListItem>
                <Divider light />
                <ListItem>
                    <Grid container justifyContent="center">
                        <Typography variant="caption" textAlign="center">
                            {" "}
                            {appTitle} {mode.toLocaleUpperCase().substring(0, 3)} {version}
                        </Typography>
                    </Grid>
                </ListItem>
                {/* end User Profile */}

                <Divider light />

                {/* start Sign out*/}
                <Link
                    to={authority + "/Manage/ChangePassword"}
                    target="_blank"
                    title="แก้ไขรหัสผ่าน"
                    style={{ textDecoration: "none", color: "inherit" }}
                >
                    <MenuItem dense>
                        <ListItemIcon>
                            <Icon fontSize="small">manage_accounts</Icon>
                        </ListItemIcon>
                        <ListItemText>แก้ไขรหัสผ่าน</ListItemText>
                    </MenuItem>
                </Link>
                <MenuItem dense onClick={handleLogout}>
                    <ListItemIcon>
                        <Icon fontSize="small">logout</Icon>
                    </ListItemIcon>
                    <ListItemText>ออกจากระบบ</ListItemText>
                </MenuItem>
                {/* end Sign out */}
            </Menu>
        </>
    );
};

export default UserProfile;
