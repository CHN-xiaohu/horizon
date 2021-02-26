import {createGlobalState} from "react-hooks-global-state";

const defaultValues = {
    "toast-ref": null,
    "alert-ref": null,
    "chatWindow-inputState": {},
    contacts: null,
    openedChatId: null,
};

export const {useGlobalState, setGlobalState, getGlobalState} = createGlobalState(defaultValues);
