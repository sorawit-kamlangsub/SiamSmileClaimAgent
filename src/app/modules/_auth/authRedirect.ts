export const AUTH_REDIRECT_IN_PROGRESS_KEY = "auth_redirect_in_progress";

export const setAuthRedirectInProgress = () => {
    window.sessionStorage.setItem(AUTH_REDIRECT_IN_PROGRESS_KEY, Date.now().toString());
};

export const clearAuthRedirectInProgress = () => {
    window.sessionStorage.removeItem(AUTH_REDIRECT_IN_PROGRESS_KEY);
};

export const isAuthRedirectInProgress = () => {
    return window.sessionStorage.getItem(AUTH_REDIRECT_IN_PROGRESS_KEY) !== null;
};
