import React, {memo, useEffect, useRef, useState} from "react";
import styled from "styled-components";
import {Input} from "./Input";
import {Sidebar as OriginalSidebar} from "./Sidebar";
import {Messages} from "./Messages";
import {ChatHeader} from "./ChatHeader";
import {useInfiniteQuery} from "react-query";
import useResizeObserver from "use-resize-observer";
import {useAuth} from "../hooks/useAuth";
import {throttle} from "throttle-debounce";
import {Dropzone} from "./Dropzone";
import {useCommentOperation} from "./Input";
import {tabMd} from "./media";
import {useGlobalState} from "../hooks/useGlobalState";

const kick = (array, index) => {
    return [array.slice(0, index).concat(array.slice(index + 1)), array[index]];
};

const Wrapper = styled.div`
    display: flex;
    width: 100%;
    height: 100%;
`;

const MessagesContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
`;

const Sidebar = styled(OriginalSidebar)`
    width: 400px;
    min-width: 400px !important;
`;

// eslint-disable-next-line immutable/no-let
let automaticScrollingIsProcessing = false; //在继续想好的方法！！！！

const ResizeHeightObserver = memo(({onResize, children}) => {
    const {ref: resizeObserverRef, height = 1} = useResizeObserver();
    typeof onResize === "function" && onResize(height);
    return <div ref={resizeObserverRef}>{children}</div>;
});

const fetchMoreThrottle = throttle(2000, true, async fetchNextPage => {
    await fetchNextPage();
});

const isMobile = window.innerWidth <= tabMd.max;

const defaultFunc = () => {};
export const ChatWindow = memo(
    ({items, lead, quotationId, unread, sidebarVisible, onInitInputRef = defaultFunc, onMouseEnter, onMouseLeave}) => {
        const [id, changeId] = useGlobalState("openedChatId");
        const userId = useAuth();
        const chatRef = useRef(null);
        const [scrollFixed, setScrollFixed] = useState(true);
        const {sendText, sendImage, sendFile, queue: commentQueue} = useCommentOperation();
        const scrollToBottom = newHeight => {
            if (chatRef.current != null && scrollFixed) {
                //chatRef.current.scrollIntoView({behavior: "smooth"});
                chatRef.current.scroll({
                    top: newHeight,
                    left: 0,
                    //behavior: 'smooth'
                });
                automaticScrollingIsProcessing = true;
            }
        };

        const {data: originalCommentsForClientData, isError, isFetching, fetchNextPage, hasNextPage} = useInfiniteQuery(
            [
                "comments",
                {
                    method: "forClient",
                    ids: [id],
                    userId,
                },
            ],
            {
                enabled: !!id,
                keepPreviousData: true,
                getNextPageParam: (lastPage, _pages) => lastPage.nextPage,
                cacheTime: 0,
            },
        );

        const commentsForClientData = isError ? originalCommentsForClientData : (originalCommentsForClientData ?? {pages: [{users: [1], data: [], nextPage: 1}]});

        const users = [...new Set(commentsForClientData.pages.map(({users}) => users).flat())];

        const comments = commentsForClientData.pages
            .map(({data}) =>
                data.map(item => ({
                    ...item,
                    author: users.find(user => user.login === item.author) ?? "client",
                })),
            )
            .flat();

        const info = comments.reduce(
            ({preparedComments, tail}, comment) => {
                const index = tail.findIndex(qc => qc.queueId === comment.queueId);

                if (index === -1) {
                    return {
                        preparedComments: [...preparedComments, comment],
                        tail,
                    };
                } else if (comment.type === "image") {
                    const [cuttedTail, queuedMessage] = kick(
                        tail,
                        tail.findIndex(qc => qc.queueId === comment.queueId),
                    );
                    return {
                        preparedComments: [...preparedComments, queuedMessage],
                        tail: cuttedTail,
                    };
                }

                const [cuttedTail, queuedMessage] = kick(
                    tail,
                    tail.findIndex(qc => qc.queueId === comment.queueId),
                );
                return {
                    preparedComments: [
                        ...preparedComments,
                        {
                            ...comment,
                            queuedMessage,
                        },
                    ],
                    tail: cuttedTail,
                };
            },
            {
                preparedComments: [],
                tail: commentQueue.filter(comment => comment.id === id),
            },
        );

        const preparedComments = info.tail.concat(info.preparedComments);
        const inputIsUploading = preparedComments.filter(item => item.status === "uploading").length > 0;

        const item = items.find(item => item._id === id);

        const handleScrollFixed = e => {
            const {target} = e;
            const current = target.scrollTop;
            const max = target.scrollHeight - target.offsetHeight;
            if (!automaticScrollingIsProcessing) {
                if (!scrollFixed && current > max - 10) {
                    setScrollFixed(true);
                }
                if (scrollFixed && current <= max - 10) {
                    setScrollFixed(false);
                }
            } else {
                automaticScrollingIsProcessing = false;
            }
        };

        const handleSlidePagination = async e => {
            if (e.target.scrollTop < 2000 && hasNextPage) {
                fetchMoreThrottle(fetchNextPage);
            }
        };

        const handleScroll = e => {
            handleScrollFixed(e);
            handleSlidePagination(e);
        };

        const onSendText = text => {
            sendText(id, text);
            setScrollFixed(true);
        };

        const handleSendImage = async inputFiles => {
            await sendImage(id, inputFiles);
            setScrollFixed(true);
        };

        const handleSendFile = async inputFiles => {
            await sendFile(id, inputFiles);
            setScrollFixed(true);
        };

        useEffect(() => {
            setTimeout(() => {
                chatRef.current.scroll({
                    top: chatRef.current.scrollHeight,
                });
            }, 0);
        }, [id]);

        return (
            <Wrapper onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
                {isMobile === false && sidebarVisible && (
                    <Sidebar
                        lead={lead}
                        quotationId={quotationId}
                        id={id}
                        items={items}
                        unread={unread}
                        onChangeId={changeId}
                    />
                )}
                <Dropzone
                    style={{flex: 1}}
                    onSendImage={handleSendImage}
                    onSendFile={handleSendFile}
                    dropStyle={{flex: 1, width: "calc(100% - 400px)"}}
                    maskStyle={{fontSize: "18px"}}
                    transferStyle={{width: "12rem", height: "12rem"}}
                >
                    <MessagesContainer isMobile={isMobile}>
                        <ChatHeader item={item} />
                        <div
                            style={{flexGrow: 1, padding: "0 10px 0 10px", overflowY: "scroll"}}
                            ref={chatRef}
                            onScroll={handleScroll}
                        >
                            <ResizeHeightObserver onResize={scrollToBottom}>
                                <Messages isFetching={isFetching} localComments={preparedComments} />
                            </ResizeHeightObserver>
                        </div>
                        <Input
                            onInitInputRef={onInitInputRef}
                            chatId={id}
                            isUploading={inputIsUploading}
                            onSendText={onSendText}
                            onSendImage={handleSendImage}
                            onSendFile={handleSendFile}
                        />
                    </MessagesContainer>
                </Dropzone>
            </Wrapper>
        );
    },
);
