import react from "@vitejs/plugin-react";
import dayjs from "dayjs";
import dns from "dns";
import { writeFile } from "fs";
import { UserConfigExport, defineConfig, loadEnv } from "vite";

dns.setDefaultResultOrder("verbatim");

function manualChunks(id) {
    if (id.includes("fortawesome")) {
        return "vender-fa";
    }

    if (id.includes("swagger")) {
        return "vender-swagger";
    }

    if (id.includes("node_modules")) {
        return "vender";
    }

    return "index";
}

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
    const env = loadEnv(mode, process.cwd(), "");

    // create date with YYMMDD format
    const date = dayjs();
    const dateFormat = date.format("YYMMDDHHmm");

    const {
        VITE_APP_NAME,
        VITE_APP_VERSION,
        VITE_APP_DESCRIPTION,
        VITE_BASE_URL,
        VITE_APP_SINCE,
        VITE_APP_CONTACT_URL,
    } = env;

    let config: UserConfigExport = {
        plugins: [react()],
    };

    let APP_INFO = {
        name: VITE_APP_NAME,
        version: VITE_APP_VERSION,
        since: VITE_APP_SINCE,
        description: VITE_APP_DESCRIPTION,
        contactUrl: VITE_APP_CONTACT_URL,
    };

    // get env from .env where start with VITE_
    let __CONST__ENV__: Record<string, string> = {};

    for (const key in env) {
        if (key.startsWith("VITE_")) {
            __CONST__ENV__[key] = env[key];
        }
    }

    __CONST__ENV__.MODE = mode;

    if (command === "serve") {
        console.log("\nEnvirontment :", "local");
        APP_INFO.name += " [Local]";

        createConfig(APP_INFO);
        createConst(__CONST__ENV__);

        config = {
            ...config,
            server: {
                host: "localhost",
                port: 3000,
                open: true,
            },
        };

        console.log("\nConfiguration :", config);

        return config;
    }

    console.log("\nEnvirontment :", mode);
    if (mode !== "" && mode !== "production") {
        APP_INFO.name += " [" + mode + "]";
    }

    createConfig(APP_INFO);
    createConst(__CONST__ENV__);

    return {
        ...config,
        base: VITE_BASE_URL,
        esbuild: {
            drop: ["console", "debugger"],
        },
        build: {
            outDir: `${mode}/${dateFormat}_${VITE_APP_NAME.replace(/ /g, "")}`,
            emptyOutDir: true,
            rollupOptions: {
                input: {
                    index: "./index.html",
                    callback: "./callback.html",
                    "silent-callback": "./silent-callback.html",
                },
                output: {
                    // manualChunks,
                    entryFileNames: `assets/js/[name].[hash].js`,
                    assetFileNames: `assets/[ext]/[name].[hash].[ext]`,
                    chunkFileNames: `assets/js/[name].[hash].js`,
                },
            },
        },
    };
});

function createConfig(appInfo) {
    console.log("\nApp Info :", appInfo);

    writeFile("./public/config.json", JSON.stringify(appInfo), function (err) {
        if (err) throw err;
        console.log("\n./public/config.json created!\n");
    });
}

function createConst(env: Record<string, string>) {
    const windowConf = `window.__CONST__ENV__`;

    const configStr = `${windowConf} = ${JSON.stringify(env, null, 2)};
Object.freeze(${windowConf});
Object.defineProperty(window, "__CONST__ENV__", {
    configurable: false,
    writable: false,
});`;

    writeFile("./public/configuration.js", configStr, function (err) {
        if (err) throw err;
        console.log("\n./public/configuration.js created!\n");
    });
}
