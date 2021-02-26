import React, {useState, useCallback, useMemo, useRef, useEffect} from "react";
import styled from "styled-components";
import {useTranslation} from "react-i18next";
import TextareaAutosize from "react-textarea-autosize";
import {Loading} from "../common/Loading";
import useOnclickOutside from "react-cool-onclickoutside";
import {generateId, getServerUrl} from "../Helper";
import {useQueryClient, useMutation} from "react-query";
import {useDataMutation} from "../hooks/useDataMutation";
import {compose, curry, findIndex, update, assoc, dissoc} from "ramda";
import axios from "axios";
import {useGlobalState} from "../hooks/useGlobalState";
import {useContacts} from "../hooks/useContacts";
import {useAlert} from "../hooks/useAlert";
import {tabMd} from "./media";

const MessageInputContainer = styled.div`
    height: auto;
    padding: 10px 10px 10px 10px;
    display: -webkit-inline-box;
    background-color: #ececec;
    border-top: 1px solid #dedede;
`;

const MessageInput = styled(TextareaAutosize)`
    display: block;
    padding: 5px 10px;
    flex-grow: 1;
    resize: none;
    background-color: white;
    border: none;
    border-radius: 5px;
    outline: none;
    line-height: 20px;
    z-index: 1;
    color: #4a4a4a;
`;

const Features = styled.div`
    flex-grow: 0;
    display: flex;
    justify-content: space-around;
    align-items: center;
    margin-left: 10px;
`;

const FeaturesItems = styled.div`
    z-index: 9999;
    position: absolute;
    left: 18px;
    bottom: 50%;
    border: 1px solid #dedede;
    border-radius: 5px;
    min-width: 70px;
`;

const FeaturesItem = styled.div`
    font-size: 0.9rem;
    color: #6f6f6f;
    padding: 5px;
    background: #fff;
    border-bottom: 1px solid #dedede;
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover {
        color: #fff;
        background: #828282;
        box-shadow: 0 0 12px 2px;
    }
`;

const FeaturesButton = styled.div`
    flex-grow: 0;
    font-size: 30px;
    line-height: 26px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
`;

const ActionButton = styled(FeaturesButton)`
    margin-right: 10px;
    position: relative;
    align-items: center;
`;

const MessageBtn = styled.button`
    background-color: transparent;
    color: #007bf1;
    margin-left: 10px;
`;

//图标
const IconSpace = styled.div`
    width: 5px;
    height: 100%;
`;
const PictureIcon = styled.img`
    width: 34px;
    height: 30px;
`;
const FileIcon = styled.img`
    width: 28px;
    height: 30px;
`;
const PlusIcon = styled.img`
    width: 20px;
    height: 20px;
`;
const SendIcon = styled.img`
    width: 30px;
    height: 26px;
`;

const ExtraWrapper = styled.div`
    display: flex;
    align-items: center;
    transition: width 0.6s;
    overflow: hidden;
    ${props =>
        props.type === "uploading"
            ? "width: 30px;"
            : props.type === "sendFiles"
            ? "width: 77px;"
            : props.type === "sendText"
            ? "width: 40px;"
            : ""}
`;

const getImageMeta = async url => {
    const image = new Image();
    image.src = url;

    return image.complete
        ? {
              width: image.width,
              height: image.height,
          }
        : await (() => {
              return new Promise(resolve => {
                  image.onload = () => {
                      resolve({
                          width: image.width,
                          height: image.height,
                      });
                  };
              });
          })();
};

const generateQueueId = () => {
    return (
        new Date().getTime() +
        Math.random()
            .toString()
            .slice(2)
    );
};

const serverUrl = getServerUrl();

const formDataRequest = async ({file, onUploadProgress}) => {
    const isImage = file.type.includes("image");

    const fd = new FormData();
    fd.append("avatar", file);
    fd.append("isPublic", true);
    if (isImage) fd.append("showImmediately", true);

    const url = isImage ? `${serverUrl}/images/upload` : `${serverUrl}/files/upload/file`;

    const response = await axios.post(url, fd, {
        header: {
            "Content-Type": "multipart/form-data",
        },
        onUploadProgress: progressEvent => {
            const percent = (progressEvent.loaded / progressEvent.total) * 100;
            onUploadProgress(percent);
        },
    });
    return response.data;
};

export const useCommentOperation = () => {
    const {currentContact} = useContacts();
    const contactId = currentContact == null ? null : currentContact._id;
    const [queue, setQueue] = useState([]);
    const {mutateAsync: uploadImage} = useMutation(formDataRequest);
    const {mutateAsync: uploadFile} = useMutation(formDataRequest);
    const queryClient = useQueryClient();

    const {mutateAsync: addComment} = useDataMutation("/comments/addAndNotify", {
        onSuccess: (_data, {queueId}) => {
            setQueue(queue =>
                queue.map(item => {
                    if (item.queueId === queueId) {
                        const {status, ...result} = item;
                        return result;
                    } else {
                        return item;
                    }
                }),
            );
        },
        onMutate: () => {
            queryClient.cancelQueries("comments");
        },
    });

    const onUploadProgress = useMemo(
        () =>
            curry((queueId, percent) => {
                setQueue(queue => {
                    const index = findIndex(item => item.queueId === queueId, queue);
                    const item = queue[index];

                    return item.status === "uploading"
                        ? update(index, assoc("percent", percent * 0.95, queue[index]), queue)
                        : queue;
                });
            }),
        [setQueue],
    );

    const onCompleteUpload = useCallback(
        queueId => {
            setQueue(queue => {
                const index = findIndex(item => item.queueId === queueId, queue);
                return update(index, compose(assoc("percent", 100), dissoc("status"))(queue[index]), queue);
            });
        },
        [setQueue],
    );

    const sendText = useCallback(
        async (id, text) => {
            const queueId = generateQueueId();

            setQueue(queue => {
                return queue.concat({
                    _id: generateId(),
                    id,
                    contactId,
                    queueId,
                    type: "text",
                    status: "uploading",
                    author: {
                        avatar: "https://files.globus.furniture/avatars/client.png",
                        login: "client",
                    },
                    text: text.trim(),
                    readBy: contactId ?? [],
                    time: new Date().toISOString(),
                });
            });

            await addComment({id, text, type: "text", queueId, contactId});
        },
        [addComment, setQueue, contactId],
    );

    const sendImage = useCallback(
        async (id, inputFiles) => {
            await Promise.all(
                Array.from(inputFiles)
                    .filter(file => file.size <= 50 * 1024 * 1024)
                    .map(async file => {
                        const url = URL.createObjectURL(file);
                        const queueId = generateQueueId();
                        const meta = await getImageMeta(url);

                        setQueue(queue =>
                            queue.concat({
                                _id: generateId(),
                                id,
                                contactId,
                                queueId,
                                type: "image",
                                status: "uploading",
                                author: {
                                    avatar: "https://files.globus.furniture/avatars/client.png",
                                    login: "client",
                                },
                                imageId: url,
                                readBy: contactId ?? [],
                                time: new Date().toISOString(),
                                meta,
                                percent: 0,
                            }),
                        );

                        const result = await uploadImage({file, onUploadProgress: onUploadProgress(queueId)});
                        onCompleteUpload(queueId);
                        await addComment({
                            id,
                            contactId,
                            imageId: result._id,
                            type: "image",
                            queueId,
                            meta: result.meta,
                        });
                    }),
            );
        },
        [addComment, onCompleteUpload, onUploadProgress, setQueue, uploadImage, contactId],
    );

    const sendFile = useCallback(
        async (id, inputFiles) => {
            await Promise.all(
                Array.from(inputFiles)
                    .filter(file => file.size <= 100 * 1024 * 1024)
                    .map(async file => {
                        const url = URL.createObjectURL(file);
                        const queueId = generateQueueId();

                        setQueue(queue =>
                            queue.concat({
                                _id: generateId(),
                                id,
                                contactId,
                                queueId,
                                type: "file",
                                status: "uploading",
                                fileName: file.name,
                                fileSize: file.size,
                                author: {
                                    avatar: "https://files.globus.furniture/avatars/client.png",
                                    login: "client",
                                },
                                fileId: url,
                                readBy: contactId ?? [],
                                time: new Date().toISOString(),
                                percent: 0,
                            }),
                        );

                        const result = await uploadFile({file, onUploadProgress: onUploadProgress(queueId)});
                        onCompleteUpload(queueId);
                        await addComment({
                            id,
                            contactId,
                            fileId: result._id,
                            fileName: result.originalName,
                            fileSize: result.size,
                            type: "file",
                            queueId,
                        });
                    }),
            );
        },
        [addComment, onCompleteUpload, onUploadProgress, setQueue, uploadFile, contactId],
    );

    const clearQueue = useCallback(() => {
        setQueue(queue => []);
    }, [setQueue]);

    return {sendText, sendImage, sendFile, clearQueue, queue, setQueue};
};

const isMobile = window.innerWidth <= tabMd.max;

const defaultFunc = () => {};
export const Input = ({isUploading, onInitInputRef = defaultFunc, onSendText, onSendImage, onSendFile, chatId}) => {
    const {t} = useTranslation();
    const {alarm} = useAlert();
    const [openMenu, setOpenMenu] = useState(false);

    const pictureInput = useRef();
    const fileInput = useRef();
    const textInput = useRef();
    const [inputState, setInputState] = useGlobalState("chatWindow-inputState");
    const setText = useCallback(
        text => {
            setInputState(inputState => ({
                ...inputState,
                [chatId]: text,
            }));
        },
        [chatId, setInputState],
    );

    const text = inputState[chatId] ?? "";

    const actionRef = useOnclickOutside(() => {
        setOpenMenu(false);
    });

    useEffect(() => {
        if (textInput.current != null && !isMobile) {
            console.log("manual focus");
            textInput.current.focus();
        }
    }, [textInput, chatId]);

    const handleClickBtn = () => {
        setOpenMenu(!openMenu);
    };

    const send = useCallback(() => {
        setText("");
        textInput.current.focus();
        if (typeof onSendText === "function" && text.length > 0) {
            onSendText(text.trim());
        }
    }, [text, setText, onSendText]);

    const extraType = text.length === 0 ? (isUploading ? "uploading" : "sendFiles") : "sendText";

    return (
        <MessageInputContainer>
            <input
                type="file"
                ref={pictureInput}
                multiple //多个
                accept={isMobile ? "image/*;capture=camera" : "image/png,image/jpeg"} //限制图片类型
                // capture="camera"
                style={{display: "none"}}
                onChange={async e => {
                    textInput.current.focus();
                    const fileErrors = Array.from(e.target.files)
                        .map(file => {
                            if (file.size > 50 * 1024 * 1024) {
                                return `${file.name} ${t("error.fileSizeShouldBeLessThan")} 50M`;
                            }
                            return null;
                        })
                        .filter(error => error != null);
                    fileErrors.length !== 0 && alarm(fileErrors);
                    await onSendImage(e.target.files);
                    pictureInput.current.value = "";
                }}
            />
            <input
                type="file"
                ref={fileInput}
                accept=".pdf,.ppt,.pptx,.xls,.xlsx,.zip,.doc,.docx,.json,.rar,.txt,.rtf,.psd,video/*" //限制文件类型
                style={{display: "none"}}
                onChange={async e => {
                    textInput.current.focus();
                    const fileErrors = Array.from(e.target.files)
                        .map(file => {
                            if (file.size > 100 * 1024 * 1024) {
                                return `${file.name} ${t("error.fileSizeShouldBeLessThan")} 100M`;
                            }
                            return null;
                        })
                        .filter(error => error != null);
                    fileErrors.length !== 0 && alarm(fileErrors);
                    await onSendFile(e.target.files);
                    fileInput.current.value = "";
                }}
            />
            <ActionButton onClick={handleClickBtn}>
                <PlusIcon src="/assets/icons/horizon/plusIcon.svg" />
                {openMenu && (
                    <FeaturesItems ref={actionRef}>
                        <FeaturesItem
                            onClick={() => {
                                if (pictureInput.current != null) {
                                    pictureInput.current.click();
                                }
                            }}
                        >
                            <PictureIcon src="/assets/icons/horizon/pictureIcon.svg" alt="" />
                            <IconSpace />
                            {t("quotation.photo")}
                        </FeaturesItem>
                        <FeaturesItem
                            onClick={() => {
                                if (fileInput.current != null) {
                                    fileInput.current.click();
                                }
                            }}
                        >
                            <FileIcon src="/assets/icons/horizon/fileIcon.svg" alt="" />
                            <IconSpace />
                            {t("quotation.file")}
                        </FeaturesItem>
                    </FeaturesItems>
                )}
            </ActionButton>

            <MessageInput
                ref={ref => {
                    textInput.current = ref;
                    onInitInputRef(ref);
                }}
                onKeyDown={e => {
                    if (e.keyCode === 13 && e.shiftKey === false) {
                        e.preventDefault();
                        send();
                    }
                }}
                maxLength="5000"
                value={text}
                autoFocus={!isMobile}
                onChange={e => {
                    setText(e.target.value);
                }}
                placeholder={t("quotation.pleaseEnterYourMessage")}
                maxRows={5}
                minRows={1}
            />
            <ExtraWrapper type={extraType}>
                {text.length === 0 ? (
                    isUploading ? (
                        <Features>
                            <Loading />
                        </Features>
                    ) : (
                        <Features>
                            <FeaturesButton
                                onClick={() => {
                                    if (pictureInput.current != null) {
                                        pictureInput.current.click();
                                    }
                                }}
                            >
                                <PictureIcon src="/assets/icons/horizon/pictureIcon.svg" alt="" />
                            </FeaturesButton>
                            <IconSpace />
                            <FeaturesButton
                                onClick={() => {
                                    if (fileInput.current != null) {
                                        fileInput.current.click();
                                    }
                                }}
                            >
                                <FileIcon src="/assets/icons/horizon/fileIcon.svg" alt="" />
                            </FeaturesButton>
                        </Features>
                    )
                ) : (
                    <div style={{display: "flex", alignItems: "flex-end"}}>
                        <MessageBtn onClick={send}>
                            <SendIcon src="/assets/icons/horizon/sendIcon.svg" />
                        </MessageBtn>
                    </div>
                )}
            </ExtraWrapper>
        </MessageInputContainer>
    );
};
