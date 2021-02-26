import {useLocation} from "react-router-dom";

export const useSessionQuery = param => {
    const query = new URLSearchParams(useLocation().search);
    if (param == null) {
        return query;
    }
    return query.get(param);
};
