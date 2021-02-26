import styled from "styled-components";

const SmallButton = styled.button.attrs(props => ({
    className: (props.outline ? ["btn", "btn_outline-color"] : ["btn"]).join(" "),
}))`
    height: inherit !important;
    padding: 5px 10px !important;
`;

const DefaultButton = styled.button.attrs(props => ({
    className: (props.outline ? ["btn", "btn_outline-color"] : ["btn"]).join(" "),
}))`
    padding: 10px 20px !important;
    height: 40px !important;
`;

export const Button = ({size = "default", outline = true, ...props}) => {
    const Component = size === "small" ? SmallButton : DefaultButton;
    return <Component {...props} outline={outline} />;
};
