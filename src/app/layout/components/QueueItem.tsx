import { Badge, Box, Divider, Icon, IconButton, LinearProgress, Menu, MenuItem } from "@mui/material";
import dayjs from "dayjs";
import relativetime from "dayjs/plugin/relativeTime";
import { useState } from "react";
import { VITE_QUEUE_URL } from "../../../Const";
import { useAuth } from "../../modules/_auth";
import { QueueNotificationDtoResponse, useGetQueueCountByUserId, useGetQueueNotificationByUserId } from "../queueApi";

dayjs.extend(relativetime);

const QueueItem = () => {
    const { userProfile } = useAuth();
    const userId = userProfile?.userId;

    if (userId == undefined) return null;

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNavigate = (url: string) => {
        setAnchorEl(null);
        window.open(url, "_blank");
    };

    const { data: queueCount, isLoading: queueCountLoading } = useGetQueueCountByUserId(userId);
    const { data: queueNotice, isLoading: queueNoticeLoading } = useGetQueueNotificationByUserId(
        userId,
        Boolean(anchorEl)
    );

    return (
        <>
            <IconButton
                color="secondary"
                href={VITE_QUEUE_URL + "/monitor-assignee"}
                target="new"
                sx={{ textDecoration: "none !important" }}
            >
                <Badge badgeContent={queueCountLoading ? 0 : queueCount?.queueTotal} color="error">
                    <Icon>assignment</Icon>
                </Badge>
            </IconButton>
            <>
                <IconButton color="secondary" onClick={handleMenu} sx={{ textDecoration: "none !important" }}>
                    <Badge badgeContent={queueCountLoading ? 0 : queueCount?.queueNoticeTotal} color="error">
                        <Icon>notifications</Icon>
                    </Badge>
                </IconButton>
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
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    sx={(theme) => ({
                        ".noticeItem": {
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "flex-start",
                        },
                        ".noticeItem .textMessage": {
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontSize: "0.8rem",
                        },
                        ".noticeItem .textMessage .MuiSvgIcon-root": {
                            position: "absolute",
                            right: theme.spacing(2),
                            bottom: 0,
                            width: "10px",
                            height: "10px",
                            fontSize: "10px",
                            color: theme.palette.primary.main,
                        },
                        ".noticeItem .date": {
                            fontSize: "0.6rem",
                            color: (theme) => theme.palette.grey[500],
                        },
                    })}
                >
                    <Box sx={{ width: 250, height: 1 }} />
                    <QueueItemList isLoading={queueNoticeLoading} queueNotice={queueNotice} />

                    <MenuItem sx={{ textAlign: "center" }} onClick={() => handleNavigate(VITE_QUEUE_URL)}>
                        <Box sx={{ textAlign: "center", width: "100%", color: "primary.main" }}>
                            ดูการแจ้งเตือนทั้งหมด
                        </Box>
                    </MenuItem>
                </Menu>
            </>
        </>
    );
};

type QueueItemProps = {
    isLoading: boolean;
    queueNotice: QueueNotificationDtoResponse[] | undefined;
};

const QueueItemList = ({ isLoading, queueNotice }: QueueItemProps) => {
    const handleNavigate = (url: string | undefined) => {
        if (url == undefined) return;
        window.open(url, "_blank");
    };

    if (isLoading) return <LinearProgress />;

    if (!queueNotice) return null;

    if (queueNotice.length == 0)
        return (
            <>
                <Box sx={{ textAlign: "center", p: 2 }}>ไม่มีการแจ้งเตือนใหม่</Box>
                <Divider />
            </>
        );

    return (
        <>
            {queueNotice.map((item) => {
                return (
                    <>
                        <MenuItem
                            key={item.queueNotificationId}
                            onClick={() => handleNavigate(item.url)}
                            className="noticeItem"
                        >
                            <>
                                <Box sx={{ minHeight: "35px" }} className="textMessage">
                                    {item.isReaded == false && <Icon>circle</Icon>}
                                    {item.textMessage}
                                </Box>
                                <Box className="date">{dayjs(item.createdDate).fromNow()}</Box>
                            </>
                        </MenuItem>
                        <Divider />
                    </>
                );
            })}
        </>
    );
};

export default QueueItem;
