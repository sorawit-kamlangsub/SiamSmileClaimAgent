import { combineReducers } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import layoutSlice, { persistConfig } from "../app/layout/layoutSlice";
import checkeligibleSlice from "../app/modules/CheckEligible/store/checkeligibleSlice";

export const rootReducer = combineReducers({
    layout: persistReducer(persistConfig, layoutSlice),
    checkeligible: checkeligibleSlice, // store ของโมดูลตรวจสอบสิทธิ์
});

