export const AUTH_REDIRECT_IN_PROGRESS_KEY = "auth_redirect_in_progress";
const AUTH_REDIRECT_IN_PROGRESS_TIMEOUT_MS = 30_000;

export const setAuthRedirectInProgress = () => {
    window.sessionStorage.setItem(AUTH_REDIRECT_IN_PROGRESS_KEY, Date.now().toString());
};

export const clearAuthRedirectInProgress = () => {
    window.sessionStorage.removeItem(AUTH_REDIRECT_IN_PROGRESS_KEY);
};

export const isAuthRedirectInProgress = () => {
    const redirectStartedAt = Number(window.sessionStorage.getItem(AUTH_REDIRECT_IN_PROGRESS_KEY));
    const isRedirectInProgress =
        Number.isFinite(redirectStartedAt) &&
        redirectStartedAt > 0 &&
        Date.now() - redirectStartedAt < AUTH_REDIRECT_IN_PROGRESS_TIMEOUT_MS;

    if (!isRedirectInProgress) {
        clearAuthRedirectInProgress();
    }

    return isRedirectInProgress;
};
