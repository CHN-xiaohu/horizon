import {useGlobalState} from "./useGlobalState";

export const useAlert = () => {
    const [alertRef] = useGlobalState("alert-ref");
    const alarm = (info, duration) => alertRef.alarm(info, duration);

    return {alarm};
};
