import { Badge, Drawer, DrawerProps, List, styled, useMediaQuery, useTheme } from "@mui/material";
import React, { useEffect } from "react";
import { APP_INFO } from "../../Const";
import { useAppDispatch, useAppSelector } from "../../redux";
import { MenuItem, ParentMenu, selectLayout, setDrawerOpen } from "../layout";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import AddCommentIcon from "@mui/icons-material/AddComment";
import MonitorIcon from "@mui/icons-material/Monitor";
import CalculateIcon from "@mui/icons-material/Calculate";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AddCardIcon from "@mui/icons-material/AddCard";
import SettingsIcon from "@mui/icons-material/Settings";
import PriceCheckIcon from "@mui/icons-material/PriceCheck";
import PersonIcon from "@mui/icons-material/Person";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

export const ASideMenuList = () => {
    const layoutReducer = useAppSelector(selectLayout);
    const dispatch = useAppDispatch();
    const theme = useTheme();
    const handleOnClose = () => {
        dispatch(setDrawerOpen(!layoutReducer.drawerOpen));
    };

    // if screen size is large, show drawer permanently
    // else, show drawer temporarily

    const matches = useMediaQuery(theme.breakpoints.up("lg"));
    const [drawerProps, setDrawerProps] = React.useState<DrawerProps>({});

    useEffect(() => {
        if (matches) {
            setDrawerProps({ variant: "permanent" });
        } else {
            setDrawerProps({
                variant: "temporary",
                ModalProps: { keepMounted: true },
            });
        }

        return () => {
            dispatch(setDrawerOpen(true));
        };
    }, [matches]);

    return (
        <ASideMenuListDrawer
            open={layoutReducer.drawerOpen}
            {...drawerProps}
            onClose={handleOnClose}
            style={{ display: layoutReducer.drawerOpen ? "block" : "none" }}
        >
            <ASideMenuListContainer dense aria-labelledby="nested-list-subheader">
                <ASideMenuListTopMenu />
                <MenuItem path="/" icon="home" text="Home" permissions={[]} />
                <ParentMenu icon={<AddCommentIcon />} text="แจ้งเคลม" permissions={[]}>
                    <MenuItem path="/monitor-claim" icon={<NoteAddIcon />} text="แจ้งเคลม" />
                    {/* <MenuItem path="/test-permission" icon={<ManageSearchIcon />} text="ค้นหาการแจ้งเคลม" />
                    <MenuItem path="/test-permission" icon={<AccountBalanceWalletIcon />} text="ติดตามการโอนเงิน" /> */}
                </ParentMenu>
                {/* <MenuItem path="/monitor-claim" icon={<AddCommentIcon />} text="แจ้งเคลม" permissions={[]} /> */}
                <MenuItem path="/claim-simulation" icon={<CalculateIcon />} text="คำนวณวงเงินเคลม" permissions={[]} />

                {/* <ParentMenu icon={<MonitorIcon />} text="พิจารณาเคลม" permissions={[]}>
                    <MenuItem path="/test-permission" icon="home" text="Test Permission" />
                </ParentMenu> */}

                {/**
                 * จัดการเงินเคลม
                 */}
                <ParentMenu icon={<AccountBalanceWalletIcon />} text="จัดการเงินเคลม" permissions={[]}>
                    <MenuItem path="/manage/adjust-transfer" icon={<AddCardIcon />} text="โอนเพิ่ม" />
                    <MenuItem path="/manage/refund" icon={<PriceCheckIcon />} text="คืนเงิน" />
                    <MenuItem path="/manage/refund-approve" icon={<PersonIcon />} text="อนุมัติคืนเงิน" />
                    <MenuItem path="/manage/increase-limit-transfer" icon={<TrendingUpIcon />} text="ขยายวงเงิน" />
                    <MenuItem path="/manage/transfer/repay" icon={<ReceiptLongOutlinedIcon />} text="แก้ไขการโอนเงิน" />
                    <MenuItem path="/manage/bank/status" icon={<AccountBalanceIcon />} text="สอบถามธนาคาร" />
                    <MenuItem path="/manage/setting/transfer" icon={<SettingsIcon />} text="ตั้งค่าการโอนเงิน" />
                </ParentMenu>

                <ParentMenu icon={<MonitorIcon />} text="พิจารณาเคลม" permissions={[]}>
                    <MenuItem path="/consider/monitor" icon="person" text="เคลมลูกค้า" />
                    <MenuItem path="/consider/hospital-monitor" icon="local_hospital" text="เคลมโรงพยาบาล" />
                </ParentMenu>

                <ParentMenu icon={<ReceiptLongIcon />} text="วางบิลเคลม" permissions={[]}>
                    <MenuItem path="/billing/customers" icon="person" text="เคลมลูกค้า" />
                    <MenuItem path="/billing/hospital" icon="local_hospital" text="เคลมโรงพยาบาล" />
                </ParentMenu>
                {/* <ParentMenu icon={<PaymentsIcon />} text="จัดการเงินเคลม" permissions={[]}>
                    <MenuItem path="/payment-monitor" icon={<AddCardIcon />} text="โอนเพิ่ม" />
                    <MenuItem path="/test-permission" icon={<ManageSearchIcon />} text="ค้นหาการแจ้งเคลม" />
                    <MenuItem path="/test-permission" icon={<AccountBalanceWalletIcon />} text="ติดตามการโอนเงิน" />
                </ParentMenu> */}
            </ASideMenuListContainer>
        </ASideMenuListDrawer>
    );
};

const ASideMenuListContainer = styled(List)({
    width: "100%",
    maxWidth: 360,
});

const ASideMenuListTopMenu = () => {
    const { mode, name } = APP_INFO;
    const TitleDiv = styled("div")(({ theme }) => ({
        display: "flex",
        backgroundColor: "#07518c",
        margin: "-8px 0 0 0",
        fontSize: theme.typography.body1.fontSize,
        color: theme.palette.primary.contrastText,
        height: "48px",
        justifyContent: "center",
        alignItems: "center",
        "& .MuiBadge-badge": { right: "-10px", fontSize: "0.65rem" },
    }));

    if (mode !== "" && mode !== "production") {
        return (
            <TitleDiv>
                <Badge badgeContent={mode.substring(0, 3).toUpperCase()} color="error">
                    {name}
                </Badge>
            </TitleDiv>
        );
    }

    return <TitleDiv>{name}</TitleDiv>;
};

const ASideMenuListDrawer = styled(Drawer)(({ theme }) => ({
    "& .MuiDrawer-paper": {
        width: theme.drawerWidth,
        backgroundColor: theme.palette.secondary.main,
        overflowX: "hidden",
    },
}));
