import { UserManagerSettings } from "oidc-client-ts";
import "./Const.d";

export const {
    VITE_APIGW_BASEURL,
    VITE_API_URL,
    VITE_APP_CONTACT_URL,
    VITE_APP_DESCRIPTION,
    VITE_APP_NAME,
    VITE_APP_SINCE,
    VITE_APP_VERSION,
    VITE_BASE_URL,
    VITE_SSO_CLIENT_ID,
    VITE_SSO_ISSUER,
    VITE_SSO_SCOPE,
    VITE_DOCSTORAGE_URL,
    VITE_QUEUE_URL,
    VITE_QUEUE_API_URL,
    VITE_QUEUE_REFETCH_INTERVAL,
    MODE,
} = window.__CONST__ENV__;

export const APP_INFO = {
    name: VITE_APP_NAME,
    version: VITE_APP_VERSION,
    since: VITE_APP_SINCE,
    description: VITE_APP_DESCRIPTION,
    contactUrl: VITE_APP_CONTACT_URL,
    mode: MODE,
};

export const VERSION_CHECKER = {
    ENABLE_VERSION_CHECKER: true,
    CONFIRM_BEFORE_REFRESH: true,
    CHECK_VERSION_EVERY_MINUTE: 1,
};

export const SSO_CONFIG: UserManagerSettings = {
    authority: VITE_SSO_ISSUER,
    client_id: VITE_SSO_CLIENT_ID,
    redirect_uri: `${VITE_BASE_URL}/callback.html`,
    silent_redirect_uri: `${VITE_BASE_URL}/silent-callback.html`,
    scope: VITE_SSO_SCOPE,
};

export const API_URL = VITE_API_URL;
export const APIGW_URL = VITE_APIGW_BASEURL;
export const AUTH_LOGOUT_REDIRECT = VITE_SSO_ISSUER + "/Account/Logout";

/*
 * สำหรับใช้ในการเรียกใช้งาน API ให้ใช้งานในรูปแบบ
 * const { data } = await axios.get(API_URL + "/api/...",
 *
 * สำหรับใช้ในการเรียกใช้งาน API Gateway ให้ใช้งานในรูปแบบ
 * const { data } = await axios.get(APIGW_URL + "/api/...",
 *
 * กรณีต้องการเพิ่ม Api ใหม่ ให้เพิ่ม URL ในไฟล์ .env ทั้งหมดและในไฟล์นี้ด้วย
 * เช่น PRMORDER_URL = VITE_PRMORDER_URL;
 **/

export enum PermissionList {
    none = "none",
}
