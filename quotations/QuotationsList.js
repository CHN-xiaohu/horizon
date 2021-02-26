import React from "react";
import {Link} from "react-router-dom";
import {useQuery} from "react-query";
import {useTranslation} from "react-i18next";
import styled from "styled-components";
import {Collapse} from "../common/Collapse";
import {memo, useState} from "react";
import {useSessionQuery} from "../hooks/useSessionQuery";

const ModuleHeading = styled.h1`
    margin-bottom: 1rem;
`;

const Container = styled.div`
    div:not(:last-child) {
        margin-bottom: 0.3rem;
    }
`;

const QuotationListContent = memo(({currentQuotationId, onLinkClicked}) => {
    const contactId = useSessionQuery("contactId");
    const userId = useSessionQuery("userId");
    const {t} = useTranslation();
    const {data: quotationsList, isLoading} = useQuery([
        "newQuotations",
        {
            method: "quotationsForClient",
        },
    ]);

    if (isLoading) {
        return <Container>{t("loading")}...</Container>;
    }

    const otherQuotations = quotationsList.filter(quotation => currentQuotationId !== quotation._id);

    if (otherQuotations.length === 0) {
        return <Container>{t("quotation.empty")}...</Container>;
    }

    return (
        <Container>
            {otherQuotations.map(quotation => {
                return (
                    <div key={quotation._id}>
                        <Link onClick={() => onLinkClicked(quotation._id)} to={`/horizon/quotation/${quotation._id}?userId=${userId}&contactId=${contactId}`}>
                            {quotation.name}
                        </Link>
                    </div>
                );
            })}
        </Container>
    );
});

export const QuotationsList = ({currentQuotationId}) => {
    const {t} = useTranslation();
    const [collapseOpened, setCollapseOpened] = useState(false);
    return (
        <>
            <ModuleHeading>{t("quotation.yourQuotations")}</ModuleHeading>
            <Collapse
                opened={collapseOpened}
                onChange={() => setCollapseOpened(s => !s)}
                title={<h5>{t("quotation.selectQuotation")}</h5>}
            >
                <QuotationListContent
                    onLinkClicked={() => setCollapseOpened(false)}
                    currentQuotationId={currentQuotationId}
                />
            </Collapse>
        </>
    );
};
