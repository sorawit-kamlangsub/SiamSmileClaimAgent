/// <reference types="vite/client" />

export interface ImportMetaEnv {
    ///// APP INFO /////

    /**
     * ชื่อ App
     */
    readonly VITE_APP_NAME: string;

    /**
     * เวอร์ชั่น App
     */
    readonly VITE_APP_VERSION: string;

    /**
     * วันที่เริ่มพัฒนา App
     */
    readonly VITE_APP_SINCE: string;

    /**
     * รายละเอียด App
     */
    readonly VITE_APP_DESCRIPTION: string;

    /**
     * URL ในการติดต่อผู้พัฒนา
     */
    readonly VITE_APP_CONTACT_URL: string;

    ///// VERSION CHECKER /////

    /**
     * ตัวเลือกเกี่ยวกับการตรวจสอบเวอร์ชั่น
     * ถ้าเป็น true จะใช้งานการตรวจสอบเวอร์ชั่น
     * ถ้าเป็น false จะไม่ใช้งานการตรวจสอบเวอร์ชั่น
     */
    readonly VITE_VERSION_CHECKER_ENABLE: boolean;

    /**
     * ตัวเลือกเกี่ยวกับการตรวจสอบเวอร์ชั่น
     * ถ้าเป็น true จะแสดงข้อความแจ้งเตือนเมื่อมีเวอร์ชั่นใหม่
     * ถ้าเป็น false จะไม่แสดงข้อความแจ้งเตือนเมื่อมีเวอร์ชั่นใหม่
     */
    readonly VITE_VERSION_CHECKER_CONFIRM: boolean;

    /**
     * ตัวเลือกเกี่ยวกับการตรวจสอบเวอร์ชั่น
     * ระยะเวลาในการตรวจสอบเวอร์ชั่น (นาที)
     */
    readonly VITE_VERSION_CHECKER_CHECK_INTEVAL_MIN: number;

    ///// BASE URL /////

    /**
     * URL ของเว็บไซต์ เปลี่ยนไปตาม Environment ที่เราต้องการ
     *
     * - .env.local (Local) ใช้ URL https://localhost:3000
     * - .env.dev (Development) ใช้ URL https://*.devsiamsmile.com
     * - .env.uat (UAT) ใช้ URL https://*.uatsiamsmile.com
     * - .env (Production) ใช้ ๊URL https://*.siamsmile.co.th
     */
    readonly VITE_BASE_URL: string;

    /**
     * URL ของ API
     *
     * - .env.local (Local) ใช้ URL https://localhost:3000
     * - .env.dev (Development) ใช้ URL https://*.devsiamsmile.com
     * - .env.uat (UAT) ใช้ URL https://*.uatsiamsmile.com
     * - .env (Production) ใช้ ๊URL https://*.siamsmile.co.th
     */
    readonly VITE_API_URL: string;

    /**
     * URL ของ API GATEWAY
     *
     * - .env.local (Local) ใช้ URL https://api.devsiamsmile.com
     * - .env.dev (Development) ใช้ URL https://api.devsiamsmile.com
     * - .env.uat (UAT) ใช้ URL https://apigw.uatsiamsmile.com
     * - .env (Production) ใช้ ๊URL https://apigw.siamsmile.co.th
     */

    readonly VITE_APIGW_BASEURL: string;

    /**
     * หากมี API เพิ่มเติม สามารถเพิ่มได้ตามต้องการ
     *
     * ตัวอย่างเช่น
     *
     * readonly VITE_DEMOPOSAPI_URL: string
     *
     * และในไฟล์ .env ให้เพิ่ม
     *
     * VITE_DEMOPOSAPI_URL=https://demoposapi.devsiamsmile.com
     */

    readonly VITE_DEMOPOSAPI_URL: string;

    ///// SSO /////

    /**
     * URL ของ Identity Server
     *
     * - .env.local (Local) ใช้ URL https://demoauthserver.devsiamsmile.com
     * - .env.dev (Development) ใช้ URL https://demoauthserver.devsiamsmile.com
     * - .env.uat (UAT) ใช้ URL https://authlogin.uatsiamsmile.com
     * - .env (Production) ใช้ ๊URL https://oauthlogin.siamsmile.co.th
     */
    readonly VITE_SSO_ISSUER: string;

    /**
     * Client ID ของ App
     */
    readonly VITE_SSO_CLIENT_ID: string;

    /**
     * Scope ของ App
     */
    readonly VITE_SSO_SCOPE: string;

    ///// External Services /////

    /**
     * URL ของ DocStorage
     */
    readonly VITE_DOCSTORAGE_URL: string;

    /**
     * URL ของ Queue
     */

    readonly VITE_QUEUE_URL: string;

    /**
     * URL ของ Queue API
     */
    readonly VITE_QUEUE_API_URL: string;

    /**
     * เวลาในการ Refetch ข้อมูลจาก Queue (วินาที)
     */
    readonly VITE_QUEUE_REFETCH_INTERVAL: number;
}
