import React from "react";
import {Button} from "../common/Button";
import {useTranslation} from "react-i18next";
import {Space} from "../common/Space";
import styled from "styled-components";

const ActionSvg = styled.img`
    width: 16px;
    height: 16px;
`;
const FlexContainer = styled.div`
    display: flex;
    align-items: center;
    margin-right: ${props => props.size ?? 10}px;
`;
const FlexContent = ({children, size = 10}) => (
    <FlexContainer size="0">
        {children.map((child, i) => {
            if (i !== children.length - 1) {
                return (
                    <FlexContainer key={i} size={size}>
                        {child}
                    </FlexContainer>
                );
            } else {
                return <span key={i}>{child}</span>;
            }
        })}
    </FlexContainer>
);

const CancelStatus = ({approved, declined, onCancel, preliminary}) => {
    const {t} = useTranslation();
    return (
        <>
            <div style={{display: "inline-block", marginRight: "1rem"}}>
                {approved && (
                    <FlexContent size="6">
                        <ActionSvg src="/assets/icons/horizon/confirm.svg" alt="" />
                        {t(preliminary ? "quotation.liked" : "quotation.approved")}
                    </FlexContent>
                )}
                {declined && (
                    <FlexContent size="6">
                        <ActionSvg src="/assets/icons/horizon/cancel.svg" alt="" />
                        {t(preliminary ? "quotation.disliked" : "quotation.rejected")}
                    </FlexContent>
                )}
            </div>
            <Button size="small" style={{marginTop: "1rem", marginBottom: "1rem"}} onClick={onCancel}>
                {t("quotation.cancel")}
            </Button>
        </>
    );
};

export const Feedback = ({approved, declined, onApprove, onCancel, onDecline, style, preliminary = false}) => {
    const {t} = useTranslation();
    return (
        <div style={style}>
            {approved || declined ? (
                <CancelStatus preliminary={preliminary} approved={approved} declined={declined} onCancel={onCancel} />
            ) : (
                <Space>
                    <Button onClick={onApprove}>
                        <FlexContent>
                            <ActionSvg src="/assets/icons/horizon/confirm.svg" alt="" />
                            {t(preliminary ? "quotation.like" : "quotation.approve")}
                        </FlexContent>
                    </Button>
                    <Button style={{marginTop: "10px"}} onClick={onDecline}>
                        <FlexContent>
                            <ActionSvg src="/assets/icons/horizon/cancel.svg" alt="" />
                            {t(preliminary ? "quotation.dislike" : "quotation.reject")}
                        </FlexContent>
                    </Button>
                </Space>
            )}
        </div>
    );
};
