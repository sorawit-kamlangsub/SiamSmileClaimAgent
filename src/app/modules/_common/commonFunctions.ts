import { Breakpoint, Theme, useMediaQuery, useTheme } from "@mui/material";
import dayjs from "dayjs";
import md5 from "md5";

type BreakpointOrNull = Breakpoint | null;

/**
 * Be careful using this hook. It only works because the number of
 * breakpoints in theme is static. It will break once you change the number of
 * breakpoints. See https://legacy.reactjs.org/docs/hooks-rules.html#only-call-hooks-at-the-top-level
 */
export function useWidth() {
    const theme: Theme = useTheme();
    const keys: readonly Breakpoint[] = [...theme.breakpoints.keys].reverse();

    return (
        keys.reduce((output: BreakpointOrNull, key: Breakpoint) => {
            const matches = useMediaQuery(theme.breakpoints.up(key));

            return !output && matches ? key : output;
        }, null) || "xs"
    );
}

/**
 * This code takes an email address and returns a URL to the Gravatar
 * image associated with that email address. If no image is found, a
 * default "identicon" image is returned instead.
 **/
export function getEmailGravatarUrl(email: string) {
    // Trim whitespace and convert to lowercase.
    const trimmedEmail = email.trim().toLowerCase();

    // Hash the email address.
    const hash = trimmedEmail === "" ? "" : md5(trimmedEmail, { encoding: "binary" });

    // Build the Gravatar URL.
    const gravatarUrl = `https://www.gravatar.com/avatar/${hash}?d=identicon`;

    return gravatarUrl;
}

/**
 * this function takes a url and a paramObject as input and returns a url with the paramObject appended to the end of the url as query parameters.
 *
 * for example:
 *
 * `encodeURLWithParams("https://example.com", {name: "John", age: 20})`
 *
 * returns "https://example.com?name=John&age=20"
 **/

export const encodeURLWithParams = (url: string, paramObject: any): string => {
    const searchParams = new URLSearchParams();
    Object.entries(paramObject).forEach(([key, value]) => {
        if (dayjs.isDayjs(value)) {
            if (!value.isValid()) return undefined;
            searchParams.append(key, value.format("YYYY-MM-DD HH:mm:ss"));
            return;
        }

        if (value === null || value === undefined || value == "") return;

        searchParams.append(key, value as string);
    });

    return `${url}?${searchParams.toString()}`;
};

// Returns an absolute URL from a relative path.
export const toAbsoluteUrl = (pathname: string): string => process.env.PUBLIC_URL + pathname;

export function customFormatter(this: any, _key: string, value: any): any {
    // Check if the value is a Day.js object and format it as ISO
    if (dayjs.isDayjs(value)) {
        if (!value.isValid()) return undefined;
        return value.format("YYYY-MM-DD HH:mm:ss");
    }

    // Check if the value is an array
    if (Array.isArray(value)) {
        return value.map((v) => customFormatter.call(this, "", v));
    }

    // Skip primitive values like numbers, strings, booleans, and null
    if (value === null || typeof value !== "object") {
        return value;
    }

    // Handle circular references using this stack
    if (this && this.seen && this.seen.has(value)) {
        return "[Circular]";
    }

    // Add current object to the seen stack
    this.seen = this.seen || new WeakSet();
    this.seen.add(value);

    // For normal objects, recursively call customFormatter on keys
    if (typeof value === "object") {
        const newObj: any = {};
        for (const k in value) {
            newObj[k] = customFormatter.call(this, k, value[k]);
        }
        return newObj;
    }

    // Otherwise, return the value as is
    return value;
}
