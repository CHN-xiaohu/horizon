import {memo, useState} from "react";
import styled from "styled-components";

const Container = styled.div`
    :hover {
        box-shadow: 0 0 15px 1px rgba(0, 0, 0, 0.1);
    }
    margin-bottom: 1rem;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: 0.4s;
    cursor: pointer;
    border-radius: 6px;
    border: 1px solid #ddd;
    padding: 0 15px;
`;

const Title = styled.div``;

const Content = styled.div`
    padding: 16px;
    width: 100%;
    margin-top: -4px;
    color: #6f6f6f;
    border: 1px solid #ddd;
    border-top: 0;
    border-radius: 0 0 6px 6px;
`;

const Status = styled.div`
    color: black;
    font-size: 2em;
`;

export const Collapse = memo(({title, children, defaultOpened = false, opened, onChange}) => {
    const [openedState, setOpenedState] = useState(defaultOpened);
    const status = opened ?? openedState;
    return (
        <Container>
            <Header
                onClick={() => {
                    if (opened != null) {
                        onChange(!opened);
                    } else {
                        setOpenedState(s => !s);
                    }
                }}
            >
                <Title>{title}</Title>
                <Status>{status ? "–" : "+"}</Status>
            </Header>
            {status && <Content>{children}</Content>}
        </Container>
    );
});
