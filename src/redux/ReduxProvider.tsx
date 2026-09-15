import React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "./store";

export type ReduxProviderProps = {
    children: React.ReactNode;
};

export const ReduxProvider = ({ children }: ReduxProviderProps) => {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                {children}
            </PersistGate>
        </Provider>
    );
};

export default ReduxProvider;
