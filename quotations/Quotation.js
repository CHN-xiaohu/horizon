import "react-simple-flex-grid/lib/main.css";
import React, {memo, useState} from "react";
import styled from "styled-components";
import {useTranslation} from "react-i18next";
import {Popup} from "../chat/Popup";
import {QuotationItem} from "./QuotationItem";
import {useQuery} from "react-query";
import {useContacts} from "../hooks/useContacts";
import {Button} from "../common/Button";
import {UnreadMessages} from "../common/UnreadMessages";
import {useGlobalState} from "../hooks/useGlobalState";
import {Row, Col} from "react-simple-flex-grid";
import {Select} from "../common/Select";

const QuotationContainer = styled.div`
    //padding: 0 0.5rem;
`;

const ItemsContainer = styled.div`
    > div:not(:last-child) {
        border-bottom: 1px solid #dedee2;
    }
`;

const StyledCol = styled(Col)`
    @media (min-width: 992px) {
        display: flex;
        align-content: flex-end;
        align-items: flex-end;
        flex-direction: column;
    }
    @media (max-width: 992px) {
        margin-top: 1rem;
    }
`;

const filterFunctionMap = {
    all: () => true,
    approved: item => item.approved,
    declined: item => item.declined,
    pending: item => !(item.approved || item.declined),
    notApproved: item => !item.approved,
    notDeclined: item => !item.declined,
    notPending: item => item.approved || item.declined,
};

export const Quotation = memo(({quotationItems = [], name, _id, preliminary, lead}) => {
    const {t} = useTranslation();
    const [openedId, setOpenedId] = useGlobalState("openedChatId");
    const {currentContact} = useContacts();
    const {data: unread} = useQuery(
        [
            "comments",
            {
                method: "unreadForClient",
                quotationId: _id,
                contactId: currentContact?._id,
            },
        ],
        {
            enabled: currentContact?._id != null,
            placeholderData: {},
        },
    );
    const [activeFilter, setActiveFilter] = useState("all");
    const items = quotationItems.filter(filterFunctionMap[activeFilter]);
    const options = [
        {label: "all", value: "all"},
        {label: preliminary ? "liked" : "approved", value: "approved"},
        {label: preliminary ? "disliked" : "declined", value: "declined"},
        {label: "pending", value: "pending"},
        {label: preliminary ? "notLiked" : "notApproved", value: "notApproved"},
        {label: preliminary ? "notDisliked" : "notDeclined", value: "notDeclined"},
        {label: "notPending", value: "notPending"},
    ].map(option => {
        const label = t(`quotation.filters.${option.label}`);
        const count = quotationItems.filter(filterFunctionMap[option.value]).length;
        return {
            ...option,
            label: `${label} (${count})`,
            disable: count === 0,
        };
    });

    return (
        <QuotationContainer>
            <div>
                <h2 style={{marginBottom: "1rem"}}>{name}</h2>
                <Row gutter={40} justify="end" align="middle">
                    <Col xs={12} md={{span: 4}}>
                        <Button
                            style={{position: "relative", overflow: "visible"}}
                            onClick={() => setOpenedId(lead)}
                            outline={false}
                        >
                            {t("quotation.generalQuestionsButton")}
                            {unread[lead] > 0 && (
                                <UnreadMessages
                                    style={{
                                        position: "absolute",
                                        right: "-0.75rem",
                                        top: "-0.75rem",
                                        zIndex: "1000",
                                    }}
                                >
                                    {unread[lead] < 100 ? unread[lead] : "😰"}
                                </UnreadMessages>
                            )}
                        </Button>
                    </Col>
                    <StyledCol xs={12} md={{span: 4, offset: 4}}>
                        <Select options={options} value={activeFilter} onChange={setActiveFilter} />
                    </StyledCol>
                </Row>
            </div>
            <ItemsContainer>
                {items.map(item => (
                    <QuotationItem
                        key={item._id}
                        id={item._id}
                        unread={unread[item._id]}
                        data={item}
                        preliminary={preliminary}
                    />
                ))}
            </ItemsContainer>
            {openedId != null && <Popup items={items} lead={lead} quotationId={_id} unread={unread} />}
        </QuotationContainer>
    );
});
