import { UserManager, UserManagerSettings, WebStorageStateStore } from "oidc-client-ts";
import ReactDOM from "react-dom/client";
import { SSO_CONFIG, VITE_BASE_URL } from "./Const";
import { SigninCallback } from "./app/modules/_auth";
import { clearAuthRedirectInProgress } from "./app/modules/_auth/authRedirect";

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

const processSigninCallback = async () => {
    try {
        const user = await oidcUserManager.signinRedirectCallback();
        const state = user.state as any;
        if (state && state.returnUrl !== "/not-found") {
            returnUrl = state.returnUrl;
        }
    } catch {
        returnUrl = "/";
    } finally {
        clearAuthRedirectInProgress();
        oidcUserManager.clearStaleState();
        document.location.href = `${VITE_BASE_URL}${returnUrl}`;
    }
};

const processSilentCallback = async () => {
    try {
        await oidcUserManager.signinSilentCallback();
    } catch {
        // no-op: silent callback can fail when there is no IdP session
    } finally {
        clearAuthRedirectInProgress();
        oidcUserManager.clearStaleState();
    }
};

if (window.location.pathname.endsWith("/silent-callback.html")) {
    processSilentCallback();
} else {
    processSigninCallback();
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<SigninCallback />);
