import { ImportMetaEnv } from "./vite-env.d";

declare global {
    interface Window {
        __CONST__ENV__: ImportMetaEnv & { MODE: string };
    }
}
