import styled, {keyframes} from "styled-components";

const rotate = keyframes`
    from {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
    }
    to {
        -webkit-transform: rotate(360deg);
        transform: rotate(360deg);
    }
`;
export const Loading = styled.div`
    width: 20px;
    height: 20px;
    border: 0.2em solid transparent;
    border-top-color: currentcolor;
    border-radius: 50%;
    -webkit-animation: 1s ${rotate} linear infinite;
    animation: 1s ${rotate} linear infinite;
    position: relative;
    &:before {
        content: "";
        display: block;
        width: inherit;
        height: inherit;
        position: absolute;
        top: -0.2em;
        left: -0.2em;
        border: 0.2em solid currentcolor;
        border-radius: 50%;
        opacity: 0.5;
    }
`;
