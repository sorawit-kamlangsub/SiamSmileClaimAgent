import { Box, CircularProgress, Typography } from "@mui/material";
import { UserManager, UserManagerSettings, WebStorageStateStore } from "oidc-client-ts";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SSO_CONFIG } from "../../../../Const";
import { clearAuthRedirectInProgress, isAuthRedirectInProgress, setAuthRedirectInProgress } from "../authRedirect";

const SigninCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const processSignIn = async () => {
            let returnUrl = "/";

            const userManagerSettings: UserManagerSettings = {
                ...SSO_CONFIG,
                loadUserInfo: true,
                response_type: "code",
                userStore: new WebStorageStateStore({
                    store: window.localStorage,
                }),
            };

            const oidcUserManager = new UserManager(userManagerSettings);

            try {
                const user = await oidcUserManager.signinRedirectCallback();
                const state = user.state as any;
                if (state) {
                    returnUrl = state.returnUrl;
                }
            } catch {
                if (!isAuthRedirectInProgress()) {
                    setAuthRedirectInProgress();
                    await oidcUserManager.signinRedirect();
                }
            } finally {
                clearAuthRedirectInProgress();
            }

            oidcUserManager.clearStaleState();
            navigate(returnUrl);
        };

        processSignIn();
    }, []);

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
            }}
        >
            <CircularProgress size={64} />
            <Typography variant="h6" component="h1" mt={2}>
                Loading...
            </Typography>
        </Box>
    );
};

export default SigninCallback;
