import React, {useCallback, useState} from "react";
import styled from "styled-components";
import {Button} from "./Button";
import {useRequest} from "../hooks/useRequest";
import dayjs from "dayjs";

const Input = styled.textarea`
    width: 100%;
    border-radius: 10px;
    padding: 5px 10px;
    resize: vertical;
    background-color: white;
`;

const Separator = styled.div`
    display: flex;
    justify-content: space-between;
`;

export const CommentInput = ({onAdd}) => {
    const [text, setText] = useState("");
    const add = useCallback(
        text => {
            if (typeof onAdd === "function") {
                if (typeof text === "string" && text.length > 0) {
                    onAdd(text);
                    setText("");
                }
            }
        },
        [onAdd, setText],
    );
    return (
        <>
            <h5>Добавить комментарий</h5>
            <Input
                onKeyDown={e => {
                    if (e.keyCode === 13 && e.shiftKey === false) {
                        e.preventDefault();
                        add(text);
                    }
                }}
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Введите свой комментарий здесь"
            />
            <Separator>
                <div />
                <Button size="small" onClick={() => add(text)}>
                    Отправить
                </Button>
            </Separator>
        </>
    );
};

const Avatar = styled.img`
    width: 3rem;
    height: 3rem;
    border-radius: 5px;
    margin-${props => props.side}: 10px;
`;

const CommentContainer = styled.div`
    display: flex;
    margin-bottom: 15px;
    align-items: center;
    flex-direction: ${props => (props.reverse ? "row-reverse" : "row")};
`;

const CommentsContainer = styled.div`
    background-color: #f3f3f3;
    padding: 28px;
    border-radius: 15px;
`;

const CommentCloud = styled.div`
    flex-grow: 1;
    background-color: ${props => props.color ?? "white"};
    border-radius: 10px;
    padding: 10px 15px;
`;

const AuthorContainer = styled.div`
    font-weight: 700;
`;

const TimeContainer = styled.div`
    font-size: 0.5rem;
`;

const Comment = ({text, author, time}) => {
    const user = author.shortName ?? author.name ?? "Клиент";
    const avatar = author.avatar ?? "https://files.globus.furniture/avatars/default.jpg";
    const isClient = author.login === "client";
    return (
        <CommentContainer reverse={isClient}>
            <Avatar src={avatar} side={isClient ? "left" : "right"} />
            <CommentCloud color={isClient ? "#a7e878" : "white"}>
                <AuthorContainer>{!isClient && user}</AuthorContainer>
                {text}
                <Separator>
                    <div />
                    <TimeContainer>{dayjs(time).format("HH:mm")}</TimeContainer>
                </Separator>
            </CommentCloud>
        </CommentContainer>
    );
};

export const CommentsPanel = ({data, id, onAdd}) => {
    const add = useRequest("/comments/addAndNotify");
    return (
        <CommentsContainer>
            <div>
                {data.length === 0 && "Нет комментариев"}
                {data.map(comment => (
                    <Comment {...comment} />
                ))}
            </div>
            <div style={{marginTop: "1rem"}}>
                <CommentInput
                    onAdd={async text => {
                        console.log("new", text);
                        await add({
                            id,
                            text,
                        });
                        typeof onAdd && onAdd(text);
                    }}
                />
            </div>
        </CommentsContainer>
    );
};
