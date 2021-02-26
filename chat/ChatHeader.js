import React, {memo} from "react";
import styled from "styled-components";
import {useTranslation} from "react-i18next";
import {useSocket} from "../hooks/useSocket";
import {Loading} from "../common/Loading";
import {tabMd} from "./media";
import {setGlobalState} from "../hooks/useGlobalState";

const borderColor = "#dedede";

const Wrapper = styled.div`
    margin-bottom: 15px;
    padding: 15px 10px 15px 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #efefef;
    border-bottom: 1px solid ${borderColor};
    cursor: move;
    width: 100%;
`;

const ItemName = styled.div`
    font-weight: bold;
    font-size: 1rem;
    color: black;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-left: 6px;
`;

export const ActionIcon = styled.img`
    width: 1rem;
    height: 1rem;
`;

const isMobile = window.innerWidth <= tabMd.max;

const CloseIcon = styled.img.attrs({
    src: "/assets/icons/horizon/plusIcon.svg",
    alt: "",
})`
    transform: rotate(45deg);
    width: 20px;
    height: 20px;
`;

export const BackButton = styled.button`
    border: 0;
    background-color: rgba(0, 0, 0, 0);
    margin-right: 10px;
`;

const CloseButton = styled.button`
    border: 0;
    background-color: rgba(0, 0, 0, 0);
    font-size: 1.3rem;
    margin-right: 10px;
`;

const StatusBar = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    max-width: 75%;
`;

export const ChatHeader = memo(({item}) => {
    const {t} = useTranslation();
    const {socket} = useSocket();
    const {connected: server} = socket;
    return (
        <Wrapper isMobile={isMobile} className="drag-handler">
            <BackButton
                onClick={() => {
                    setGlobalState("openedChatId", null);
                }}
            >
                <ActionIcon src="/assets/icons/horizon/backIcon.svg" />
            </BackButton>
            <StatusBar>
                {!server && <Loading />}
                {item?.index == null ? (
                    <ItemName>{t("quotation.generalQuestions")}</ItemName>
                ) : (
                    <ItemName>
                        #{item?.index} {item?.name ?? t("quotation.item")}
                    </ItemName>
                )}
            </StatusBar>
            <CloseButton
                onClick={() => {
                    setGlobalState("openedChatId", null);
                }}
            >
                <CloseIcon />
            </CloseButton>
        </Wrapper>
    );
});
