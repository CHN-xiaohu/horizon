import {writeStorage, useLocalStorage as rehooksUseLocalStorage} from "@rehooks/local-storage";

export const useLocalStorage = (name, defaultValue) => {
    const [state] = rehooksUseLocalStorage(name, defaultValue);
    const setState = (value) => writeStorage(name, value);
    return [state, setState];
};
