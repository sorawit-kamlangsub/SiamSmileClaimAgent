import { Divider } from "@mui/material";
import { AppMenu, UserProfile } from ".";
import QueueItem from "./QueueItem";

const UserMenu = () => {
    return (
        <>
            <AppMenu />
            <QueueItem />
            <Divider orientation="vertical" flexItem />
            <UserProfile />
        </>
    );
};

export default UserMenu;
