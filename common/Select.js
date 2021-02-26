import {memo, useState} from "react";
import styled from "styled-components";
import {is, not} from "../styled/tools";

const Container = styled.div`
    position: relative;
    width: 100%;
    color: #999;
    ${is("opened")`
        color: #212529;
    `}
    border: 1px solid #e1e6eb;
    &:before {
        content: "";
        display: block;
        position: absolute;
        width: 0;
        height: 0;
        background: transparent;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-top: 5px solid;
        right: 12px;
        top: 50%;
        transition: 250ms;
        transform-origin: 50% 50% 0;
        transform: translateY(-50%);
        ${is("opened")`
            transform: rotate(90deg);
        `}
    }
`;

const SelectedOption = styled.p`
    cursor: pointer;
    font-size: 13px;
    padding: 8px 16px;
`;

const Options = styled.div`
    height: ${props => props.height}px;
    ${not("opened")`
        z-index: -1;
        height: 0;
    `}
    position: absolute;
    z-index: 1;
    left: -1px;
    width: calc(100% + 2px);
    top: 36px;
    transition: 250ms;
    overflow: hidden;
    background: #fff;
    border: 1px solid #e1e6eb;
    border-top-width: 0;
`;

const InvisibleInput = styled.input.attrs({
    type: "radio",
})`
    position: absolute;
    transform: scale(0);
`;

const Option = styled.label`
    position: relative;
    cursor: pointer;
    width: 100%;
    font-size: 13px;
    background: white;
    transition: 250ms;
`;

const OptionLabel = styled.p`
    background: white;
    ${is("active")`
        color: white;
        background: #007bf1;
    `}
    ${not("active")`
        &:hover {
            background: #f2f2f4;
        }
    `}
    padding: 5px 15px;
    transition: 250ms;
`;

export const Select = memo(
    ({options, onChange, value, defaultValue, name, placeholder = "Please select", defaultOpen = false}) => {
        const [opened, setOpened] = useState(defaultOpen);
        const [innerValue, setInnerValue] = useState(defaultValue);
        const activeOption =
            value == null && innerValue == null ? null : options.find(option => option.value === (value ?? innerValue));
        return (
            <Container opened={opened} onMouseLeave={() => setOpened(false)} onClick={() => setOpened(state => !state)}>
                <SelectedOption>{activeOption?.label ?? placeholder}</SelectedOption>
                <Options opened={opened} height={29 * options.length}>
                    {options.map(option => {
                        const isActive = activeOption != null && activeOption.value === option.value;
                        return (
                            <Option
                                onClick={() => {
                                    if (option.value !== value) {
                                        if (typeof onChange === "function") {
                                            onChange(option.value);
                                        } else {
                                            setInnerValue(option.value);
                                        }
                                    }
                                    setOpened(false);
                                }}
                            >
                                {typeof name === "string" && (
                                    <InvisibleInput value={option.value} name={name} checked={isActive} />
                                )}
                                <OptionLabel active={isActive}>{option.label}</OptionLabel>
                            </Option>
                        );
                    })}
                </Options>
            </Container>
        );
    },
);
