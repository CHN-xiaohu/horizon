import React, {memo, useEffect} from "react";
import dayjs from "dayjs";
import styled from "styled-components";
import {useInView} from "react-intersection-observer";
import {useDataMutation} from "../hooks/useDataMutation";
import {MessageImg, MessageFile} from "./MessageType";
import Linkify from "linkifyjs/react";
import {Loading} from "../common/Loading";
import {useTranslation} from "react-i18next";
import {useContacts} from "../hooks/useContacts";
import {Avatar as OriginalAvatar} from "./Avatar";
import {getImageLink} from "../Helper";


const Avatar = styled(OriginalAvatar)`
    margin: 0 0 0 12px;
`;

const MessageContainer = styled.div`
    display: flex;
    margin-bottom: 15px;
    position: relative;
    flex-direction: ${props => (props.reverse ? "row" : "row-reverse")};
`;

const MessageAvatar = styled.img`
    width: 2rem;
    height: 2rem;
    border-radius: 5px;
    margin: ${props => (props.isClient ? "0 0 0 12px" : "0 12px 0 0")};
`;

const MessageContent = styled.div`
    word-break: break-word;
    color: black;
    background-color: ${props => (props.messColor ? "white" : "rgb(167, 232, 120)")};
    border-radius: 5px;
    padding: 5px ${props => (props.messType ? "5px" : "9px")};
    max-width: calc(100% - 75px);
    &::${props => (props.messBefore ? "before" : "after")} {
        content: "";
        width: 0;
        height: 0;
        z-index:-1;
        position: absolute;
        border: 6px solid ${props => (props.messBefore ? "white" : "rgb(167, 232, 120)")};
        border-radius: 20%;
        transform: rotate(-45deg);
        ${props =>
            props.messBefore
                ? `
            left: 39px;
        `
                : `
            right: 39px;
        `}
        top: 9px;
    }
`;

const TimeContainer = styled.div`
    font-size: 12px;
    opacity: 0.6;
    margin: 2px 0 0 0;
    float: right;
`;
const TextTimeContainer = styled(TimeContainer)`
    margin: 12px 0 0 20px;
`;

const StyledLinkify = styled(Linkify)`
    a {
        color: #007bf1;
        border-bottom: 1px solid #007bf1;
    }
`;

const ProgressPercent = styled.span`
    margin-right: 0.5rem;
`;

export const commentTime = (time, t, roughly) => {
    if (!dayjs(time).isSame(dayjs(), "year")) {
        return dayjs(time).format(roughly ? "DD.MM.YYYY" : "DD.MM.YYYY HH:mm");
    } else if (dayjs(time).isSame(dayjs(), "day")) {
        return dayjs(time).format("HH:mm");
    } else if (dayjs(time).isSame(dayjs().add(-1, "day"), "day")) {
        return dayjs(time).format(`[${t("quotation.yesterday")}] ${!roughly ? "HH:mm" : ""}`);
    }
    return dayjs(time).format(roughly ? "D MMMM" : "D MMMM HH:mm");
};

export const Message = memo(
    ({
        _id,
        author,
        text,
        type,
        time,
        imageId,
        fileId,
        fileName,
        fileSize,
        readBy = [],
        status,
        meta,
        percent,
        onOpenGalery,
        contactId
    }) => {
        const {currentContact, contacts} = useContacts();
        const currentContactId = currentContact?._id;

        const {t} = useTranslation();
        const [ref, inView] = useInView();
        const {mutate: markASRead} = useDataMutation("/comments/markASReadForClient", {});
        useEffect(() => {
            if (inView && currentContactId != null && !readBy.includes(currentContactId)) {
                markASRead({commentIds: [_id], contactId: currentContactId});
            }
        }, [inView, markASRead, readBy, _id, currentContactId]);

        const isClient = author.login === "client";
        const contact = contacts == null ? null : contacts.find(contact => contact._id === contactId);
        const useAvatarComponent = contact != null;

        return (
            <MessageContainer ref={ref} key={_id} reverse={author.login !== "client"}>
                {
                    useAvatarComponent
                    ? <Avatar contact={contact} />
                    : <MessageAvatar isClient={isClient} src={getImageLink(author.avatar, "avatar_jpg")} alt="" />
                }
                <MessageContent
                    messType={type === "image" || type === "file"}
                    messBefore={author.login !== "client"}
                    messColor={author.login !== "client"}
                >
                    <div style={{fontWeight: "700", marginBottom: ".4rem"}}>
                    {
                        author.login === "client"
                        ? contact?.contact_name
                        : author.name
                    }
                    </div>
                    {type === "text" ? (
                        <>
                            <StyledLinkify target="_blank" style={{whiteSpace: "pre-wrap"}}>
                                {text}
                            </StyledLinkify>
                            <TextTimeContainer>{commentTime(time, t, false)}</TextTimeContainer>
                        </>
                    ) : type === "image" ? (
                        <>
                            <MessageImg imageId={imageId} meta={meta} percent={percent} onOpenGalery={onOpenGalery} />
                            <div>
                                <TimeContainer>{commentTime(time, t, false)}</TimeContainer>
                            </div>
                        </>
                    ) : type === "file" ? (
                        <>
                            <MessageFile
                                fileId={fileId}
                                fileName={fileName}
                                fileSize={fileSize}
                                author={author}
                                percent={percent}
                            />
                            <TimeContainer>{commentTime(time, t, false)}</TimeContainer>
                        </>
                    ) : null}
                </MessageContent>
                {author.login === "client" && status === "uploading" && (
                    <div style={{display: "flex", alignItems: "center", marginRight: ".5rem"}}>
                        {(type === "image" || type === "file") && (
                            <ProgressPercent>{Math.round(percent)}%</ProgressPercent>
                        )}
                        <Loading />
                    </div>
                )}
            </MessageContainer>
        );
    },
);
