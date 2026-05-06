import { Switch, Tooltip } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../redux/hook";
import { setDrawerOpen } from "../layoutSlice";

const ToggleMenuSwitch = () => {
    const dispatch = useAppDispatch();
    const layoutReducer = useAppSelector((state) => state.layout);

    return (
        <div style={{ marginRight: 10 }}>
            <Tooltip title="Toggle Menu" placement="right">
                <Switch
                    checked={layoutReducer.drawerOpen}
                    onChange={() => dispatch(setDrawerOpen(!layoutReducer.drawerOpen))}
                    size="small"
                    color="primary"
                    name="toggleMenu"
                />
            </Tooltip>
        </div>
    );
};

export default ToggleMenuSwitch;
