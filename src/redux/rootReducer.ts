import { combineReducers } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import layoutSlice, { persistConfig } from "../app/layout/layoutSlice";
import checkeligibleSlice from "../app/modules/CheckEligible/store/checkeligibleSlice";
import monitorSlice from "../app/modules/CreatedClaim/store/monitorSlice";
import claimPHSlice from "../app/modules/CreatedClaim/store/claimPHSlice";
import claimPASlice from "../app/modules/CreatedClaim/store/claimPASlice";
import claimSimulateSlice from "../app/modules/ClaimSimulate/store/claimSimulateSlice";
import extraPaymentSlice from "../app/modules/ExtraPayment/store/extraPaymentSlice";

import bankStatusCheckSlice from "../app/modules/BankStatus/store/bankStatusCheckSlice";

import claimConsiderSlice from "../app/modules/ClaimConsider/store/claimConsiderSlice";
import managePaymentHospitalSlice from "../app/modules/ManageInsuranceFund/ManagePaymentHospital/store/managePaymentHospitalSlice";
import generateTransferSlice from "../app/modules/ManageInsuranceFund/ManageTransferHospital/store/generateTransferSlice";

export const rootReducer = combineReducers({
    layout: persistReducer(persistConfig, layoutSlice),
    checkeligible: checkeligibleSlice, // store ของโมดูลตรวจสอบสิทธิ์
    monitorcreatedclaim: monitorSlice, // store ของโมดูลติดตามเคลม (ใช้ state ร่วมกับ checkeligible)
    claimph: claimPHSlice, // store ของโมดูลสร้างเคลม
    claimpa: claimPASlice, // store ของโมดูลสร้างเคลม (ใช้ state ร่วมกับ claimph)
    claimsimulate: claimSimulateSlice,
    extraPayment: extraPaymentSlice,
    bankStatusCheck: bankStatusCheckSlice,
    claimConsider: claimConsiderSlice,
    managePaymentHospital: managePaymentHospitalSlice,
    generateTransferHospital: generateTransferSlice,
    // billingClaim: ไม่มี redux slice แล้ว — ใช้ react-query cache ของ hospitalBillingApi.ts แทน
});
