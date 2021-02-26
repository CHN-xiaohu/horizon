import {useRequest} from "./useRequest";
import {useCallback} from "react";

const notNull = x => x != null;

export const useQueryRequestFunction = () => {
    const request = useRequest();
    return useCallback(
        async ({queryKey, pageParam: page}) => {
            const [endpoint, description] = queryKey;
            const {method, transport, ...data} = description ?? {};
            const url = `/${[endpoint, method].filter(notNull).join("/")}`;
            const response = await request(url, page == null ? data : {page, ...data}, transport);

            if (typeof response === "object" && response?.error != null) {
                if (typeof response.error === "string") {
                    console.log(response.error);
                    throw new Error(response.error);
                }
            }
            return response;
        },
        [request],
    );
};
