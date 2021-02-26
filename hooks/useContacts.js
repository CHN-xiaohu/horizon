import {useEffect, useMemo} from "react";
import {useSessionQuery} from "./useSessionQuery";
import {useQuery} from "react-query";

const localContactId = localStorage.getItem("contactId");

export const useContacts = () => {
    const contactId = useSessionQuery("contactId");

    //console.log("contacts hook rerender");

    useEffect(() => {
        if (contactId != null && contactId !== localContactId) {
            localStorage.setItem("contactId", contactId);
        }
    }, [contactId]);

    const currentContactId = contactId ?? localContactId;

    const {data: contacts} = useQuery(
        [
            "leads",
            {
                method: "getContacts",
            },
        ],
        {
            enabled: currentContactId != null,
            staleTime: 24 * 60 * 60 * 1000,
            cacheTime: 24 * 60 * 60 * 1000,
        },
    );

    const contactEmptyObject = useMemo(() => {
        return {_id: currentContactId};
    }, [currentContactId]);

    if (currentContactId == null) {
        return null;
    }
    const currentContact = contacts?.find(contact => contact._id === currentContactId);
    return {
        currentContact: currentContact ?? contactEmptyObject,
        contacts,
    };
};
