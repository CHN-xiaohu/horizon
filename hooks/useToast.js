import {useGlobalState} from "./useGlobalState";

export const useToast = () => {
    const [toastRef] = useGlobalState("toast-ref");
    const popup = (text, duration) => toastRef.popup(text, duration);

    return {popup};
};
