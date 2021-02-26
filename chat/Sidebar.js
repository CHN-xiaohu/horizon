import styled from "styled-components";
import {ImageContainer} from "../quotations/QuotationItem";
import {useTranslation} from "react-i18next";
import {UnreadMessages} from "../common/UnreadMessages";
import {Thumbnail} from "../common/Picture";
import {useQuery} from "react-query";
import {getFileIcon} from "./MessageType";
import {Dropzone} from "./Dropzone";
import {commentTime} from "./Message";
import {Flex} from "../styled/Flex";
import {useToast} from "../hooks/useToast";
import {useCommentOperation} from "./Input";
import {smooth} from "../Helper";
import {useGlobalState} from "../hooks/useGlobalState";
import {mobile} from "./media";
const borderColor = "#dedede";

const SidebarContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    width: 40%;
    background-color: #fff;
    border-right: 1px solid ${borderColor};
    overflow-y: scroll;

    @media screen and (max-width: ${mobile.max}px) {
        display: none;
    }
`;

const SidebarItem = styled.div`
    padding: 10px;
    display: flex;
    width: 100%;
    height: 120px;
    border-bottom: 1px solid ${borderColor};
    color: black;
    ${props =>
        props.active
            ? `
        background-color: #ebebeb;
    `
            : `
            &:hover {
                transition:box-shadow .5s cubic-bezier(0, 0.38, 0.42, 0.98);
                box-shadow: 0px 0px 12px 2px rgba(206, 206, 206, 1);
            }
            `}
`;

const SidebarItemPrice = styled.div`
    color: #007bf1;
    font-weight: bold;
`;
const SidebarItemDetails = styled.div`
    font-size: 0.8rem;
    line-height: normal;
    overflow: hidden;
    text-overflow: ellipsis;
`;
const Time = styled.div`
    font-size: 12px;
    opacity: 0.6;
`;
const SidebarItemTitle = styled.div`
    font-size: 15px;
    font-weight: bold;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
`;
const Avatar = styled.img`
    height: 1rem;
    width: 1rem;
    border-radius: 3px;
    margin-right: 5px;
`;
const FileIcon = styled.div`
    height: 1rem;
    width: 1rem;
    margin-right: 5px;
`;
const Icon = styled.img`
    height: 1rem;
    width: 1rem;
`;

const MessageContent = styled.div`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: ${props => (props.active ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.6)")};
`;
const MessagePreview = ({text, author, id, activeId, type, fileName}) => {
    const {t} = useTranslation();
    return (
        <Flex alignCenter>
            {type === "file" ? (
                <FileIcon>
                    <Icon src={`/assets/icons/horizon/${getFileIcon(fileName)}`} alt="" />
                </FileIcon>
            ) : (
                <Avatar
                    src={
                        type === "image"
                            ? "/assets/icons/horizon/pictureIcon.svg"
                            : "https://files.globus.furniture/avatars/client.png"
                    }
                />
            )}
            <MessageContent active={id === activeId}>
                {type === "text"
                    ? text
                    : type === "image"
                    ? t("quotation.image")
                    : type === "file"
                    ? fileName
                    : "UnknownMessage"}
            </MessageContent>
        </Flex>
    );
};

const thumbnailStyle = {
    margin: "0 auto",
    height: "100%",
    maxWidth: "100%",
    objectFit: "cover",
    overflow: "hidden",
};

export const Sidebar = ({
    items,
    onChangeId,
    lead,
    quotationId,
    id,
    unread,
    className,
    style,
    onMouseEnter,
    onMouseLeave,
}) => {
    const {t} = useTranslation();
    const {popup} = useToast();
    const {sendImage, sendFile} = useCommentOperation();
    const [inputState] = useGlobalState("chatWindow-inputState");
    const {data: usd, isSuccess: forexLoaded} = useQuery(
        [
            "forex",
            {
                transport: "axios",
            },
        ],
        {
            select: forex => 1 / forex.USD.value,
            staleTime: 24 * 60 * 60 * 1000,
            cacheTime: 24 * 60 * 60 * 1000
        },
    );

    const {data: theLastOneCommentForQuotationItems} = useQuery(
        [
            "comments",
            {
                method: "theLastCommentForClient",
                quotationId,
                leadId: lead,
            },
        ],
        {
            enabled: items?.length > 0,
            initialData: {},
        },
    );

    const handleSendImage = async (files, item) => {
        await sendImage(item._id, files);
        if (item._id !== id) popup(t("chat.thePictureWasSentSuccessfully"));
    };

    const handleSendFile = async (files, item) => {
        await sendFile(item._id, files);
        if (item._id !== id) popup(t("chat.theFileWasSentSuccessfully"));
    };

    const handleSendImageForQuestion = async files => {
        await sendImage(lead, files);
        if (id !== lead) popup(t("chat.sendingAPictureSuccessfully"));
    };

    const handleSendFileForQuestion = async files => {
        await sendFile(lead, files);
        if (id !== lead) popup(t("chat.sendFileSuccessfully"));
    };

    return (
        <SidebarContainer className={className} style={style} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            <Dropzone
                onSendImage={files => handleSendImageForQuestion(files)}
                onSendFile={files => handleSendFileForQuestion(files)}
                maskStyle={{padding: "5px 5px", fontSize: "13px"}}
                transferStyle={{width: "4rem", height: "4rem"}}
            >
                <SidebarItem
                    active={lead === id}
                    onClick={() => {
                        typeof onChangeId === "function" && onChangeId(lead);
                    }}
                >
                    <ImageContainer
                        style={{padding: "0", marginRight: "10px", flex: "0.7"}}
                        width="100px"
                        height="100px"
                    >
                        <svg
                            style={{width: "100%", height: "100%"}}
                            t="1610354771309"
                            viewBox="0 0 1024 1024"
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m0 688c-22.1 0-40-17.9-40-40s17.9-40 40-40 40 17.9 40 40-17.9 40-40 40z m128.9-263.2c-18.8 21.7-44.6 38-74.4 47.2-13.4 4.1-22.5 16.4-22.5 30.5v9.5c0 17.7-14.3 32-32 32s-32-14.3-32-32v-9.5c0-20.7 6.5-40.4 18.7-57 12.3-16.7 29.2-28.7 49-34.7 36-11 60.2-37.9 60.2-66.8 0-18-9.1-35.3-25.7-48.7-18.5-15-43.5-23.3-70.3-23.3-26.9 0-51.8 8.3-70.3 23.3C425.1 372.7 416 390 416 408c0 17.7-14.3 32-32 32s-32-14.3-32-32c0-37.6 17.5-72.5 49.3-98.4C431.2 285.4 470.5 272 512 272s80.8 13.4 110.7 37.6c31.8 25.8 49.3 60.8 49.3 98.4 0 29.4-10.8 57.3-31.1 80.8z"
                                fill="#1875F0"
                            ></path>
                        </svg>
                    </ImageContainer>
                    <Flex column justifyBetween style={{flex: 1, minWidth: 0}}>
                        <Flex column>
                            <Flex justifyBetween alignCenter>
                                <SidebarItemTitle>{t("quotation.generalQuestions")}</SidebarItemTitle>
                                <Time>
                                    {theLastOneCommentForQuotationItems[lead] &&
                                        commentTime(theLastOneCommentForQuotationItems[lead].time, t, true)}
                                </Time>
                            </Flex>
                        </Flex>
                        {unread[lead] > 0 && (
                            <Flex
                                justifyBetween
                                style={{
                                    position: "absolute",
                                    right: "10px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                }}
                            >
                                <div />
                                <UnreadMessages>
                                    {unread[lead] < 100 ? unread[lead] : "😰"}{" "}
                                </UnreadMessages>
                            </Flex>
                        )}
                        <SidebarItemDetails>
                            {inputState[lead] && lead !== id ? (
                                <Flex>
                                    <div style={{color: "red"}}>[{t("quotation.draft")}]</div>
                                    <MessageContent style={{color: "gray"}}>
                                        {inputState[lead]}
                                    </MessageContent>
                                </Flex>
                            ) : (
                                theLastOneCommentForQuotationItems[lead] && (
                                    <MessagePreview
                                        {...theLastOneCommentForQuotationItems[lead]}
                                        activeId={id}
                                        id={lead}
                                    />
                                )
                            )}
                        </SidebarItemDetails>
                    </Flex>
                </SidebarItem>
            </Dropzone>

            {items.map(item => {
                const unreadCount = unread[item._id];
                const theLastOneComment = theLastOneCommentForQuotationItems[item._id];
                return (
                    <Dropzone
                        key={item._id}
                        onSendImage={files => handleSendImage(files, item)}
                        onSendFile={files => handleSendFile(files, item)}
                        maskStyle={{padding: "5px 5px", fontSize: "13px"}}
                        transferStyle={{width: "4rem", height: "4rem"}}
                    >
                        <SidebarItem
                            key={item._id}
                            active={item._id === id}
                            onClick={() => {
                                typeof onChangeId === "function" && onChangeId(item._id);
                            }}
                        >
                            <ImageContainer
                                style={{padding: "0", marginRight: "10px", flex: "0.7"}}
                                width="100px"
                                height="100px"
                            >
                                <Thumbnail _id={item.photos[0]} style={thumbnailStyle} />
                            </ImageContainer>
                            <Flex column justifyBetween style={{flex: 1, minWidth: 0}}>
                                <Flex column>
                                    <Flex justifyBetween alignCenter>
                                        <SidebarItemTitle>#{item.index}</SidebarItemTitle>
                                        <Time>{theLastOneComment && commentTime(theLastOneComment.time, t, true)}</Time>
                                    </Flex>
                                    <SidebarItemTitle>{item?.name ?? t("quotation.item")}</SidebarItemTitle>
                                    <SidebarItemPrice>
                                        {forexLoaded ? `$${smooth(item.price / usd, 0, "ceil")}` : t("loading")}
                                    </SidebarItemPrice>
                                </Flex>
                                {unreadCount > 0 && (
                                    <Flex
                                        justifyBetween
                                        style={{
                                            position: "absolute",
                                            right: "10px",
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                        }}
                                    >
                                        <div />
                                        <UnreadMessages>{unreadCount < 100 ? unreadCount : "😰"} </UnreadMessages>
                                    </Flex>
                                )}
                                <SidebarItemDetails>
                                    {inputState[item._id] && item._id !== id ? (
                                        <Flex>
                                            <div style={{color: "red"}}>[{t("quotation.draft")}]</div>
                                            <MessageContent style={{color: "gray"}}>
                                                {inputState[item._id]}
                                            </MessageContent>
                                        </Flex>
                                    ) : (
                                        theLastOneComment && (
                                            <MessagePreview {...theLastOneComment} id={item._id} activeId={id} />
                                        )
                                    )}
                                </SidebarItemDetails>
                            </Flex>
                        </SidebarItem>
                    </Dropzone>
                );
            })}
        </SidebarContainer>
    );
};
