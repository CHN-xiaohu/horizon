import {useQuery} from "react-query";
import {Quotation} from "./quotations/Quotation";
import "./i18n";
import {useTranslation} from "react-i18next";
import {Route, Switch} from "react-router-dom";
import {QuotationsList} from "./quotations/QuotationsList";
import {Toast} from "./common/Toast";
import {Alert} from "./common/Alert";
import {useEffect, useRef} from "react";
import {setGlobalState} from "./hooks/useGlobalState";

const idRegex = /^[a-f\d]{24}$/i;

const QuotationWrapper = ({id}) => {
    const {t} = useTranslation();

    const enabled = id != null && idRegex.test(id);

    const {data: quotationItems, isLoading, isError} = useQuery(
        [
            "newQuotationItems",
            {
                method: "quotationItemsForClient",
                quotationId: id,
            },
        ],
        {
            enabled,
            select: data =>
                data.map((item, i) => {
                    return {...item, index: i + 1};
                }),
        },
    );
    const {data: quotationDetails, isError: Error} = useQuery(
        [
            "newQuotations",
            {
                method: "quotationForClient",
                _id: id,
            },
        ],
        {
            enabled,
        },
    );
    if (isLoading) {
        return `${t("loading")}...`;
    }
    if (!enabled || (isError && Error)) {
        return t("quotation.theQuotationWasNotFoundPleaseContactOurManagerIfYouHaveAnyQuestions");
    }
    return <Quotation quotationItems={quotationItems} {...quotationDetails} />;
};
export const App = () => {
    const toastRef = useRef();
    const alertRef = useRef();

    useEffect(() => {
        setGlobalState("toast-ref", toastRef.current);
        setGlobalState("alert-ref", alertRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div>
            <Switch>
                <Route
                    path="/horizon/quotation/:id"
                    render={({match}) => {
                        const id = match.params.id;
                        return (
                            <div>
                                <QuotationsList currentQuotationId={id} />
                                <QuotationWrapper id={id} />
                            </div>
                        );
                    }}
                />
                <Route
                    path="/horizon/order"
                    render={() => {
                        return 2;
                    }}
                />
                <Route
                    render={() => {
                        return "404 not found";
                    }}
                />
            </Switch>
            <Toast ref={toastRef} style={{position: "fixed", left: "50%", top: 0}} />
            <Alert
                ref={alertRef}
                style={{position: "fixed", left: "50%", top: "50%", transform: "translateX(-50%) translateY(-50%)"}}
            />
        </div>
    );
};
