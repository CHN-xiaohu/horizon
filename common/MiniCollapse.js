import {memo, useState} from "react";
import styled from "styled-components";
import {ActionIcon} from "../chat/ChatHeader";

const Container = styled.div`
    margin-bottom: 1rem;
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    cursor: pointer;
    h5 {
        color: ${props => (props.open ? "initial" : "#007bf1")};
        transition: color .3s;
    }
`;

const Title = styled.div`
    margin-right: 10px;
`;

const Content = styled.div`
    width: 100%;
    color: #6f6f6f;
`;

const OpenIcon = styled(ActionIcon).attrs({
    src: "/assets/icons/horizon/backIcon.svg",
})`
    transition: transform 0.3s;
    transform: rotate(${props => (props.open ? "270deg" : "180deg")});
    width: .8em;
    height: .8em;
`;

export const MiniCollapse = memo(({title, children, defaultOpen = false}) => {
    const [opened, setOpened] = useState(defaultOpen);
    return (
        <Container>
            <Header
                onClick={() => {
                    setOpened(s => !s);
                }}
                open={opened}
            >
                <Title>{title}</Title>
                <OpenIcon open={opened} />
            </Header>

            {opened && <Content>{children}</Content>}
        </Container>
    );
});
