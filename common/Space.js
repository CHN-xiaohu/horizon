import React from "react";
import styled from "styled-components";

const SpaceContainer = styled.div`
    display: inline-block;
    margin-right: ${props => props.size ?? 10}px;
`;

export const Space = ({children, size = 10}) =>
    children.map((child, i) => {
        if (i !== children.length - 1) {
            return (
                <SpaceContainer key={i} size={size}>
                    {child}
                </SpaceContainer>
            );
        } else {
            return <span key={i}>{child}</span>;
        }
    });
