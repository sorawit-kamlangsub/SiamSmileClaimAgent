declare module "react-timeago/lib/language-strings/th" {
    const string: { [key: string]: string | null };
    export default string;
}

declare module "react-timeago/lib/formatters/buildFormatter" {
    const formatter: (strings: {
        [key: string]: string | null;
    }) => (value: number, unit: string, suffix: string) => string;
    export default formatter;
}
