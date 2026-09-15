import React, { useEffect, useRef } from "react";
import { APP_INFO, VERSION_CHECKER } from "../../../Const";
import { swalConfirm } from "../../modules/_common";

function VersionChecker() {
    const { version } = APP_INFO;
    const { CHECK_VERSION_EVERY_MINUTE, CONFIRM_BEFORE_REFRESH, ENABLE_VERSION_CHECKER } = VERSION_CHECKER;
    const isCheckingRef = useRef(false);
    const isPromptOpenRef = useRef(false);
    const isReloadingRef = useRef(false);
    const checkVersionLoop = 1000 * 60 * CHECK_VERSION_EVERY_MINUTE;

    const getData = async () => {
        if (!ENABLE_VERSION_CHECKER || isCheckingRef.current || isReloadingRef.current) {
            return;
        }
        isCheckingRef.current = true;

        try {
            const response = await fetch(`${window.location.origin}/config.json`, {
                cache: "no-store",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch config.json: ${response.status}`);
            }

            const configData = await response.json();

            if (configData.version !== version) {
                if (CONFIRM_BEFORE_REFRESH) {
                    if (isPromptOpenRef.current) {
                        return;
                    }

                    isPromptOpenRef.current = true;
                    try {
                        const res = await swalConfirm("Warning", "Your version is outdated. Refresh now?");
                        if (res.isConfirmed) {
                            await emptyCache();
                        }
                    } finally {
                        isPromptOpenRef.current = false;
                    }
                } else {
                    await emptyCache();
                }
            }
        } catch (error) {
            console.error("Version check failed", error);
        } finally {
            isCheckingRef.current = false;
        }
    };

    const emptyCache = async () => {
        if (isReloadingRef.current) {
            return;
        }
        isReloadingRef.current = true;

        try {
            if ("caches" in window) {
                const names = await caches.keys();
                await Promise.all(names.map((name) => caches.delete(name)));
            }
        } finally {
            // Changes are only visible after refresh.
            window.location.reload();
        }
    };

    useEffect(() => {
        void getData();
        const interval = setInterval(() => {
            void getData();
        }, checkVersionLoop);

        // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
        return () => clearInterval(interval);
    }, []);

    return <React.Fragment />;
}

export default VersionChecker;
