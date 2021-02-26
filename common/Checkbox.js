import {memo} from "react";
import styled from "styled-components";

const Container = styled.label`
    display: block;
    position: relative;
    padding-left: 30px;
    margin-right: 10px;
    width: auto;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
`;

const CheckMark = styled.span`
    position: absolute;
    top: 0;
    left: 0;
    height: 24px;
    width: 24px;
    border-radius: 2px;
    border: 2px solid #c4c4c4;

    &::after {
        content: "";
        position: absolute;
        display: none;
        left: 8px;
        top: 3px;
        width: 6px;
        height: 11px;
        border: solid #2196f3;
        border-width: 0 3px 3px 0;
        -webkit-transform: rotate(45deg);
        -ms-transform: rotate(45deg);
        transform: rotate(45deg);
    }
`;

const Input = styled.input`
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
    &:checked ~ ${CheckMark}::after {
        display: block;
    }
`;

const Annotation = styled.h5`
    width: max-content;
`

export const Checkbox = memo(({label, checked, onChange}) => {
    return (
        <Container htmlFor={label}>
            <Input type="checkbox" id={label} checked={checked} onChange={onChange} />
            <CheckMark />
            <Annotation>{label}</Annotation>
        </Container>
    );
});
