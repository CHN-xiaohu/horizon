import axios from "axios";

export const isProduction = () => {
    return process.env.NODE_ENV === "production";
};

export const getServerUrl = () => {
    if (isProduction()) {
        return "https://api.globus.furniture";
    } else {
        const {hostname} = window.location;
        return `http://${hostname}:5000`;
    }
};

const {post} = axios.create({
    baseURL: getServerUrl(),
    responseType: "json",
});

export const getImageLinkById = (id, style = "original", userId = null) => {
    const STYLE_SEPARATOR = "|";
    const url = `${getServerUrl()}/images/${id}${STYLE_SEPARATOR}${style}`;
    if (userId === null) {
        return url;
    } else {
        return `${url}?userId=${userId}`;
    }
};
const idRegex = /^[a-f\d]{24}$/i;
export const getImageLink = (photo, style = "original", userId = null) => {
    if (!idRegex.test(photo)) {
        return photo;
    } else {
        return getImageLinkById(photo, style, userId);
    }
};

export async function request(link, data) {
    const response = await post(link, data);
    if (response.status === 200) {
        return response.data;
    } else {
        console.warn("request failed!!!!", response.status, link, data);
    }
    return {};
}

export const newLine2Br = text => {
    if (typeof text !== "string") {
        return text;
    }
    return text.split("\n").map(fragment => (
        <>
            {fragment}
            <br />
        </>
    ));
};

export const smooth = (n, signs = 0, method = 'round') => Math[method](n * 10 ** signs) / 10 ** signs;

export function getReadableFileSizeString(fileSizeInBytes) {
    // eslint-disable-next-line immutable/no-let
    let i = -1;
    const byteUnits = ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    do {
        fileSizeInBytes = fileSizeInBytes / 1024;
        i++;
    } while (fileSizeInBytes > 1024);
    return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
}

export function jsondata(data, customHeaders = {}) {
    return {
        method: data == null ? "GET" : "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...customHeaders
        },
        body: data && JSON.stringify(data),
    };
}

export const benchmark = () => {
    const first = +new Date();
    return name => {
        const second = +new Date();
        const lag = second - first;
        if (name != null) {
            console.log(name, `${lag}ms`);
        }
        return lag;
    };
};

export const download = (link, name) => {
    // eslint-disable-next-line immutable/no-let
    let a = document.createElement("a");
    if (typeof name === "string") {
        a.download = name;
    } else {
        a.download = link.substring(link.lastIndexOf("/") + 1);
    }
    a.href = link;
    a.target = "_blank";
    a.click();
    a.remove();
};

export const generateId = (() => {
    // eslint-disable-next-line immutable/no-let
    let id = 0;
    return () => {
        return ++id;
    };
})();

export const getContrastColor = color => {
    const rgb = color.replace("#", "");
    const r = parseInt(rgb.substr(0, 2), 16);
    const g = parseInt(rgb.substr(2, 2), 16);
    const b = parseInt(rgb.substr(4, 2), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "black" : "white";
};
