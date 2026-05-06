import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { useLocation, useMatches } from "react-router-dom";
import { APP_INFO } from "../../../Const";
import { useAppDispatch } from "../../../redux/hook";
import { useWidth } from "../../modules/_common/commonFunctions";
import { RouteHandleType } from "../../routes/AuthRoutes";
import { setCurrentTitle, setResponsiveKey } from "../layoutSlice";

const ResKeyUpdator = () => {
    // Get the current breakpoint
    const dispatch = useAppDispatch();

    const breakpoints = useWidth();

    // Get the current location and matches
    const location = useLocation();
    const matches = useMatches();
    const match = matches[matches.length - 1];
    const matchHandle = match.handle as RouteHandleType;

    let routeTitle = matchHandle.title;
    if (matchHandle.getTitle && match.data) routeTitle = matchHandle.getTitle(match.data);

    // Get the current hash element
    const getHashElement = () => {
        const hash = location.hash;
        const removeHashCharacter = (str: string) => {
            const result = str.slice(1);

            return result;
        };

        if (hash) {
            const element = document.getElementById(removeHashCharacter(hash));

            return element;
        } else {
            return null;
        }
    };

    // Update the responsive key in the layout slice
    useEffect(() => {
        dispatch(setResponsiveKey(breakpoints));
    }, [breakpoints]);

    // Update the current title in the layout slice
    useEffect(() => {
        const hashElement = getHashElement();

        // Scroll to top when the location changes
        if (hashElement) hashElement?.scrollIntoView();
        else window.scrollTo(0, 0);

        dispatch(setCurrentTitle(routeTitle));
    }, [location]);

    // This component does not render anything
    return (
        <Helmet>
            <title>
                {routeTitle} - {APP_INFO.name}
            </title>
        </Helmet>
    );
};

export default ResKeyUpdator;
