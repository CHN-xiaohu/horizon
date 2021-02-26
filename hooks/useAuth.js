import {useSessionQuery} from "./useSessionQuery";

export const useAuth = () => {
    const userId = useSessionQuery("userId");
    const localSession = localStorage.getItem("userId");
    if (userId != null) {
        localStorage.setItem("userId", userId);
        return userId;
    } else if (localSession != null) {
        return localSession;
    }
    return null;
};
