import {useImperativeHandle, forwardRef, memo, useState, useCallback} from "react";
import styled from "styled-components";
import {generateId} from "../Helper";
import {findIndex, remove, update, assoc} from "ramda";

const Wrapper = styled.div`
    z-index: 100001;
`;

const ToastItem = styled.div`
    margin-top: 1rem;
    display: ${({visible}) => visible ? "flex" : "none"};
    align-items: center;
    justify-content: center;
    padding: .5rem;
    border-radius: 2px;
    background-color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, .2);
`;

const ToastText = styled.div`
    margin-left: .2rem;
`;

export const Toast = memo(forwardRef(({className, style}, ref) => {
    const [toasts, setToasts] = useState([]);

    const startHideAnimation = async (_id) =>
        new Promise((resolve) => {
            setToasts(toasts => {
                const index = findIndex(toast => toast._id === _id, toasts);
                return update(
                    index,
                    assoc("visible", false, toasts[index]),
                    toasts
                );
            });

            setTimeout(resolve, 1000);
        });
    
    const removeToast = (_id) => {
        setToasts(toasts => {
            const index = findIndex(toast => toast._id === _id, toasts);
            return remove(index, 1, toasts);
        })
    }

    const popup = useCallback((text, duration = 5000) => {
        const _id = generateId();

        setToasts(toasts => 
            toasts.concat({_id, text, duration, visible: true})
        );

        setTimeout(async () => {
            await startHideAnimation(_id);
            removeToast(_id);
        }, duration);
    }, []);

    useImperativeHandle(ref, () => ({popup}));

    return (
        <Wrapper className={className} style={style}>
            {toasts.map(toast => 
                <ToastItem key={toast._id} visible={toast.visible}>
                    <svg t="1607943504274" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3356" width="24" height="24"><path d="M512 512m-448 0a448 448 0 1 0 896 0 448 448 0 1 0-896 0Z" fill="#2196F3" p-id="3357"></path><path d="M469.333333 469.333333h85.333334v234.666667h-85.333334z" fill="#FFFFFF" p-id="3358"></path><path d="M512 352m-53.333333 0a53.333333 53.333333 0 1 0 106.666666 0 53.333333 53.333333 0 1 0-106.666666 0Z" fill="#FFFFFF" p-id="3359"></path></svg>
                    <ToastText>{toast.text}</ToastText>
                </ToastItem>
            )}
        </Wrapper>
    )
}))