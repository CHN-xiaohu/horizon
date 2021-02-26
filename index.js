import "./wdyr";
import {StrictMode, memo} from "react";
import ReactDOM from "react-dom";
import {getServerUrl} from "./Helper";
import {useQueryRequestFunction} from "./hooks/useQueryRequestFunction";
import {useAuth} from "./hooks/useAuth";
import {App} from "./App";
import {BrowserRouter as Router} from "react-router-dom";
import {ReactQueryDevtools} from "react-query/devtools";
import {QueryClient, QueryClientProvider} from "react-query";
import {SocketIOProvider} from "./hooks/sockets/provider";
import {useSocket} from "./hooks/useSocket";
import {useMemo} from "react";
import {getGlobalState} from "./hooks/useGlobalState";
import { persistQueryClient } from 'react-query/persistQueryClient-experimental'
import { createLocalStoragePersistor } from 'react-query/createLocalStoragePersistor-experimental'

const defaultOptions = {
    queries: {
        refetchOnWindowFocus: false,
        notifyOnChangeProps: "tracked",
        cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    },
};

const queryClient = new QueryClient({
    defaultOptions,
});

persistQueryClient({
    queryClient,
    persistor: createLocalStoragePersistor(),
})

const audio = new Audio("https://img.tukuppt.com/newpreview_music/08/99/15/5c88e63ca74e859434.mp3");

const QueryWrapper = memo(({children}) => {
    const request = useQueryRequestFunction();
    useSocket("invalidate", hashes => {
        if (hashes.includes("comments")) {
            queryClient.invalidateQueries("comments");
        }
    });
    useSocket("newMessage", message => {
        const openedChatId = getGlobalState("openedChatId");
        if (document.hidden || (message.author !== "client" && openedChatId !== message.id)) {
            audio.play();
        }
    });
    useMemo(() => {
        queryClient.setDefaultOptions({
            ...defaultOptions,
            queries: {
                ...defaultOptions.queries,
                queryFn: request,
            },
        });
    }, [request]);
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
});

const server = getServerUrl();

const SocketWrapper = memo(({children}) => {
    const userId = useAuth();
    const defaultQuery = useMemo(() => {
        return {query: {userId}};
    }, [userId]);
    return (
        <SocketIOProvider url={server} opts={defaultQuery}>
            {children}
        </SocketIOProvider>
    );
});

ReactDOM.render(
    <StrictMode>
        <Router>
            <SocketWrapper>
                <QueryWrapper>
                    <ReactQueryDevtools initialIsOpen={false} />
                    <App />
                </QueryWrapper>
            </SocketWrapper>
        </Router>
    </StrictMode>,
    document.getElementById("root"),
);
