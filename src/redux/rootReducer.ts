import { combineReducers } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import layoutSlice, { persistConfig } from "../app/layout/layoutSlice";
import checkeligibleSlice from "../app/modules/CheckEligible/store/checkeligibleSlice";
import monitorSlice from "../app/modules/CreatedClaim/store/monitorSlice";
import claimPHSlice from "../app/modules/CreatedClaim/store/claimPHSlice";
import claimPASlice from "../app/modules/CreatedClaim/store/claimPASlice";
import claimLineSlice from "../app/modules/CreatedClaim/store/claimLineSlice";
import claimSimulateSlice from "../app/modules/CreatedClaim/store/claimSimulateSlice";

export const rootReducer = combineReducers({
    layout: persistReducer(persistConfig, layoutSlice),
    checkeligible: checkeligibleSlice, // store ของโมดูลตรวจสอบสิทธิ์
    monitorcreatedclaim: monitorSlice, // store ของโมดูลติดตามเคลม (ใช้ state ร่วมกับ checkeligible)
    claimph: claimPHSlice, // store ของโมดูลสร้างเคลม
    claimpa: claimPASlice, // store ของโมดูลสร้างเคลม (ใช้ state ร่วมกับ claimph)
    claimline: claimLineSlice,
    claimsimulate: claimSimulateSlice,
});
