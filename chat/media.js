
export const maxDesktop = {
    min : 1201,
    width: 1150,
    height: 750,
};

export const desktop = {
    max: 1200,
    min: 992,
    width: 942,
    height: 750,
};

export const tablet = {
    max: 991,
    min: 769,
    width: 718,
    height: 600,
};

export const tabMd = {
    max: 768,
    min: 576,
};

export const mobile = {
    max: 575,
};

export const getMediaName = () => {
    const innerWidth = window.innerWidth;

    if (innerWidth <= mobile.max) {
        return "mobile";
    } else if (innerWidth >= tabMd.min && innerWidth <= tabMd.max) {
        return "tabMd";
    } else if (innerWidth >= tablet.min && innerWidth <= tablet.max) {
        return "tablet";
    } else if (innerWidth >= desktop.min && innerWidth<= desktop.max) {
        return "desktop";
    } else if (innerWidth >= maxDesktop.min) {
        return "maxDesktop";
    }
};