import { combineReducers } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import layoutSlice, { persistConfig } from "../app/layout/layoutSlice";
import checkeligibleSlice from "../app/modules/CheckEligible/store/checkeligibleSlice";
import monitorSlice from "../app/modules/CreatedClaim/store/monitorSlice";
import claimPHSlice from "../app/modules/CreatedClaim/store/claimPHSlice";

export const rootReducer = combineReducers({
    layout: persistReducer(persistConfig, layoutSlice),
    checkeligible: checkeligibleSlice, // store ของโมดูลตรวจสอบสิทธิ์
    monitorcreatedclaim: monitorSlice, // store ของโมดูลติดตามเคลม (ใช้ state ร่วมกับ checkeligible)
    claimph: claimPHSlice, // store ของโมดูลสร้างเคลม
});

