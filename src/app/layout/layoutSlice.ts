import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PersistConfig } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { RootState } from "../../redux";

export interface LayoutState {
    drawerOpen: boolean;
    darkMode: boolean;
    currentTitle: string;
    toggleMenu: boolean;
    responsiveKey: string;
    recentUsedMenu: number[];
    allAppDialogOpen: boolean;
}

const initialState: LayoutState = {
    drawerOpen: true,
    darkMode: false,
    currentTitle: "Home",
    toggleMenu: true,
    responsiveKey: "xl",
    recentUsedMenu: [1, 2, 3, 4, 5],
    allAppDialogOpen: false,
};

export const persistConfig: PersistConfig<LayoutState> = {
    key: "layout",
    version: 1,
    storage,
};

export const layoutSlice = createSlice({
    name: "layout",
    initialState,
    reducers: {
        setDrawerOpen: (state, action: PayloadAction<boolean>) => {
            state.drawerOpen = action.payload;
        },
        setDarkMode: (state, action: PayloadAction<boolean>) => {
            state.darkMode = action.payload;
        },
        setCurrentTitle: (state, action: PayloadAction<string>) => {
            state.currentTitle = action.payload;
        },
        setToggleMenu: (state, action: PayloadAction<boolean>) => {
            state.toggleMenu = action.payload;
        },
        setResponsiveKey: (state, action: PayloadAction<string>) => {
            state.responsiveKey = action.payload;
        },
        setRecentUsedMenu: (state, action: PayloadAction<number>) => {
            const recentUsedMenu = state.recentUsedMenu || [1, 2, 3, 4, 5];

            const index = recentUsedMenu.indexOf(action.payload);
            if (index !== undefined && index !== -1) recentUsedMenu.splice(index, 1);

            recentUsedMenu.unshift(action.payload);
            if (recentUsedMenu.length > 5) recentUsedMenu.pop();

            state.recentUsedMenu = recentUsedMenu;
        },
        setAllAppDialogOpen: (state, action: PayloadAction<boolean>) => {
            state.allAppDialogOpen = action.payload;
        },
    },
});

export const {
    setAllAppDialogOpen,
    setCurrentTitle,
    setDarkMode,
    setDrawerOpen,
    setRecentUsedMenu,
    setResponsiveKey,
    setToggleMenu,
} = layoutSlice.actions;

export const selectLayout = (state: RootState) => state.layout;

export default layoutSlice.reducer;
