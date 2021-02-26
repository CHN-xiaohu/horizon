import React, {memo, useEffect, useMemo, useRef, useState, useCallback} from "react";
import {ChatWindow} from "./ChatWindow";
import Div100vh from "react-div-100vh";
import styled from "styled-components";
import {maxDesktop, desktop, tablet, tabMd} from "./media";
import {Rnd} from "react-rnd";
import {compose, assoc} from "ramda";
import {useLocalStorage} from "../hooks/useLocalStorage";

const PopupContainer = styled(Div100vh)`
    @media screen and (max-width: ${tabMd.max}px) {
        top: 0;
        left: 0;
        box-shadow: none;
        border-bottom: 1px solid rgb(222, 222, 222);
        background-color: #f3f3f3;
        position: fixed;
        width: 100vw;
        z-index: 100000;
        display: flex;
    }

    @media screen and (min-width: ${tablet.min}px) {
        display: none;
    }
`;

const Window = styled.div`
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 999999;
    pointer-events: none;

    @media screen and (max-width: ${tabMd.max}px) {
        display: none;
    }
`;

const PopupMobileBackground = styled.div`
    display: none;
    @media screen and (max-width: ${tabMd.max}px) {
        display: block;
        height: 200vh;
        width: 200vw;
        background-color: #ececec;
        position: fixed;
        top: -50vh;
        left: -50vw;
        z-index: 1001;
    }
`;

// eslint-disable-next-line immutable/no-let
let previousScrollTop = null;
// eslint-disable-next-line immutable/no-let
let previousScrollLeft = null;
// eslint-disable-next-line immutable/no-let
let previousOverflow = null;
// eslint-disable-next-line immutable/no-let
let previousBodyRightPadding = null;
// eslint-disable-next-line immutable/no-let
let previousHeaderTransform = null;
// eslint-disable-next-line immutable/no-let
let previousHeaderTransition = null;
// eslint-disable-next-line immutable/no-let
let previousHeaderContactsTransform = null;

const saveScroll = () => {
    previousScrollTop = window.document.documentElement.scrollTop;
    previousScrollLeft = window.document.documentElement.scrollLeft;
    previousOverflow = window.document.documentElement.style.overflow;
    previousBodyRightPadding = window.document.body.style.paddingRight;
    const header = window.document.querySelector(".header.wrapper");
    previousHeaderTransform = header.style.transition;
    previousHeaderTransform = header.style.transform;
    previousHeaderContactsTransform = window.document.querySelector(".header__contacts").style.transform;
};

const restoreScroll = () => {
    window.document.documentElement.style.overflow = previousOverflow;
    window.document.body.style.paddingRight = previousBodyRightPadding;
    const header = window.document.querySelector(".header.wrapper");
    setTimeout(() => {
        header.style.transition = previousHeaderTransition;
    }, 0);
    header.style.transform = previousHeaderTransform;
    window.document.querySelector(".header__contacts").style.transform = previousHeaderContactsTransform;
    window.document.documentElement.scrollTo(previousScrollLeft, previousScrollTop);
};

const getDefaultSize = () => {
    const getSize = media => {
        const {width, height} = media;
        return {width, height};
    };

    if (window.innerWidth >= maxDesktop.min) {
        return getSize(maxDesktop);
    } else if (window.innerWidth >= desktop.min) {
        return getSize(desktop);
    } else {
        return getSize(tablet);
    }
};

const getDefaultPosition = ({width, height}) => {
    const x = window.innerWidth / 2 - width / 2;
    const y = window.innerHeight / 2 - height / 2;
    return {x, y};
};

const handleMouseEnter = () => {
    saveScroll();
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    window.document.documentElement.style.overflow = "hidden";
    window.document.body.style.paddingRight = `${scrollbarWidth}px`;
    const header = window.document.querySelector(".header.wrapper");
    header.style.transition = "0s";
    header.style.transform = `translateX(-${scrollbarWidth / 2}px)`;
    window.document.querySelector(".header__contacts").style.transform = `translateX(-${scrollbarWidth / 2}px)`;
};

const rndStyle = {
    display: "flex",
    backgroundColor: "#f3f3f3",
    boxShadow: "0 0 12px 2px rgba(0, 0, 0, 0.3)",
    borderBottom: "none",
    zIndex: 10000,
    pointerEvents: "all",
};

export const Popup = memo(({items, quotationId, unread, lead}) => {
    const [windowInnerWidth, setWindowInnerWidth] = useState();

    useEffect(() => {
        const handleWindowResize = () => {
            setWindowInnerWidth(window.innerWidth);
        };

        handleWindowResize();
        window.addEventListener("resize", handleWindowResize);
        return () => {
            window.removeEventListener("resize", handleWindowResize)
        }
    }, []);

    return (
        windowInnerWidth < tablet.min
        ? (
            <MobilePopup
                items={items}
                lead={lead}
                quotationId={quotationId}
                unread={unread}
            />
        )
        : (
            <DesktopPopup
                items={items}
                quotationId={quotationId}
                unread={unread}
                lead={lead}
            />
        )
    );
});


const MobilePopup = memo(({
    items,
    lead,
    quotationId,
    unread,
}) => {
    return (
        <>
                <PopupMobileBackground />
                <PopupContainer>
                    <ChatWindow
                        items={items}
                        lead={lead}
                        quotationId={quotationId}
                        unread={unread}
                    />
                </PopupContainer>
            </>
    )
});

const DesktopPopup = memo(({
    items,
    quotationId,
    unread,
    lead
}) => {

    const rndRef = useRef();
    const inputRef = useRef();
    const needFocusInputAfterModifyWindow = useRef(false);
    const [sidebarVisible, toggleSidebarVisible] = useState(true);

    useEffect(() => {
        saveScroll();
        return restoreScroll;
    }, []);

    const handleMouseLeave = restoreScroll;

    const [rndState, setRndState] = useLocalStorage("chatWindow-rnd-state", {});
    const {x, y, width, height} = rndState;
    const defaultSize = useMemo(() => {
        return width == null || height == null ? getDefaultSize() : {width, height};
    }, [width, height]);
    useEffect(() => {
        const defaultPosition = x == null || y == null ? getDefaultPosition(defaultSize) : {x, y};
        if (x + defaultSize.width > window.innerWidth) {
            rndRef.current.updatePosition({
                ...defaultPosition,
                x: 0
            });
        } else {
            rndRef.current.updatePosition(defaultPosition);
        }
        toggleSidebarVisible(defaultSize.width > 800);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleResize = useCallback((_e, _dir, refToElement) => {
        const width = refToElement.offsetWidth;
        toggleSidebarVisible(width > 800);
    }, []);

    const handleResizeStart = useCallback(() => {
        needFocusInputAfterModifyWindow.current = document.activeElement === inputRef.current;
    }, []);

    const handleDragStart = handleResizeStart;

    const handleResizeStop = useCallback((_e, _dir, refToElement) => {
        if (needFocusInputAfterModifyWindow.current) {
            inputRef.current.focus();
        }
        const width = refToElement.offsetWidth;
        const height = refToElement.offsetHeight;

        setRndState(compose(assoc("height", height), assoc("width", width))(rndState));
    }, [rndState, setRndState]);

    const handleDragStop = useCallback((_e, {x, y}) => {
        if (needFocusInputAfterModifyWindow.current) {
            inputRef.current.focus();
        }
        setRndState(compose(assoc("x", x), assoc("y", y))(rndState));
    }, [rndState, setRndState]);

    return (
        <Window className="rnd-window">
            <Rnd
                ref={rndRef}
                default={defaultSize}
                style={rndStyle}
                minWidth={350}
                maxWidth="100%"
                minHeight={540}
                bounds=".rnd-window"
                dragHandleClassName="drag-handler"
                onResize={handleResize}
                onResizeStart={handleResizeStart}
                onDragStart={handleDragStart}
                onResizeStop={handleResizeStop}
                onDragStop={handleDragStop}
            >
                <ChatWindow
                    items={items}
                    lead={lead}
                    quotationId={quotationId}
                    unread={unread}
                    sidebarVisible={sidebarVisible}
                    onInitInputRef={useCallback((ref) => {
                        inputRef.current = ref
                    }, [])}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                />
            </Rnd>
        </Window>
    )
})
