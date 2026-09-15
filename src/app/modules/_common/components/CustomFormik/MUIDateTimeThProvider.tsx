import { LocalizationProvider } from "@mui/x-date-pickers";
import { MUIAdapterDayjsBE, MUIDateTimeThProviderProps, MUILocaleTh } from ".";

const MUIDateTimeThProvider = ({
    useThaiLanguage = true,
    useBuddhistEra = true,
    children,
}: MUIDateTimeThProviderProps) => {
    return (
        <LocalizationProvider
            dateAdapter={useBuddhistEra ? MUIAdapterDayjsBE : undefined}
            adapterLocale={useThaiLanguage ? "th" : undefined}
            localeText={useThaiLanguage ? MUILocaleTh : undefined}
        >
            {children}
        </LocalizationProvider>
    );
};

export default MUIDateTimeThProvider;
