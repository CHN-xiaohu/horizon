import {useImperativeHandle, forwardRef, memo, useState, useCallback} from "react";
import styled, {keyframes} from "styled-components";
import {generateId} from "../Helper";
import {Flex} from "../styled/Flex";
import {findIndex, remove, update, assoc} from "ramda";
import {useTranslation} from "react-i18next";

const Wrapper = styled.div`
    z-index: 100001;
`;
const fadeIn = keyframes`
  from{
    opacity: 0;
  }
  to{
    opacity: 1;
  }
`;

const Content = styled.div`
    margin-top: 1rem;
    display: ${({visible}) => (visible ? "flex" : "none")};
    align-items: center;
    border: 1px solid #ffccc7;
    background-color: #fff1ef;
    padding: 20px 30px;
    box-shadow: 0 0 30px 0 rgba(50, 50, 50, 1);
    animation: ${fadeIn} 1s ease-in-out;
    max-height: 90vh;
    overflow-y: auto;
`;

const IconContainer = styled.div`
    display: flex;
    align-items: center;
    flex-direction: column;
`;

const MessageItem = styled.div`
    margin-bottom: 4px;
    font-size: 14px;
    line-height: 22px;
`;

const Error = styled.img`
    width: 30px;
    height: 30px;
    margin-right: 15px;
`;

const Close = styled.button`
    font-size: 18px;
    font-weight: bold;
    align-self: flex-start;
`;

export const Alert = memo(
    forwardRef(({className, style}, ref) => {
        const [messages, setMessages] = useState([]);

        const startHideAnimation = async _id =>
            new Promise(resolve => {
                setMessages(messages => {
                    const index = findIndex(message => message._id === _id, messages);
                    return update(index, assoc("visible", false, messages[index]), messages);
                });
                setTimeout(resolve, 1000);
            });
        const removeMessages = _id => {
            setMessages(messages => {
                const index = findIndex(message => message._id === _id, messages);
                return remove(index, 1, messages);
            });
        };
        const {t} = useTranslation();
        const alarm = useCallback((info, duration) => {
            const _id = generateId();

            setMessages(messages => messages.concat({_id, info, duration, visible: true}));
            if (duration != null) {
                setTimeout(async () => {
                    await startHideAnimation(_id);
                    removeMessages(_id);
                }, duration);
            }
        }, []);

        useImperativeHandle(ref, () => ({alarm}));
        return (
            <Wrapper className={className} style={style}>
                {messages.map(message => (
                    <Content key={message._id} visible={message.visible}>
                        <IconContainer>
                            <Error src="/assets/icons/horizon/error.svg" />
                        </IconContainer>
                        <Flex column style={{marginRight: "15px"}}>
                            <h5>{t("attention")}!</h5>
                            {message.info?.map((info, i) => (
                                <MessageItem key={i}>{info}</MessageItem>
                            ))}
                        </Flex>
                        <Close
                            onClick={async () => {
                                await startHideAnimation(message._id);
                                removeMessages(message._id);
                            }}
                        >
                            ✕
                        </Close>
                    </Content>
                ))}
            </Wrapper>
        );
    }),
);
