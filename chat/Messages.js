import {memo, useState} from "react";
import styled from "styled-components";
import {Message} from "./Message";
import {useTranslation} from "react-i18next";
import {Loading} from "../common/Loading";
import {MessageViewer} from "./MessageViewer";
import {findIndex} from "ramda";

const HeaderInfo = styled.div`
    display: flex;
    justify-content: center;
`;

const MessagesWrapper = styled.div`
    display: flex;
    flex-direction: column-reverse;
`;

export const Messages = memo(({isFetching, localComments}) => {
    const {t} = useTranslation();
    const [activeIndexOnViewer, setActiveIndexOnViewer] = useState(null);
    const handleShowViewer = index => {
        setActiveIndexOnViewer(index);
        console.log(index);
    };
    const handleCancelViewer = () => {
        setActiveIndexOnViewer(null);
    };

    const imgFiles = localComments
        .filter(com => com.type === "image")
        .map(img => img.imageId);

    if (isFetching && localComments.length === 0) {
        return (
            <HeaderInfo>
                <Loading />
            </HeaderInfo>
        );
    }

    if (localComments.length === 0) {
        return <HeaderInfo>{`${t("quotation.chatEmpty")}`}</HeaderInfo>;
    }

    return (
        <MessagesWrapper>
            {localComments.map(element => {
                const addiotionalProps =
                    element.type === "image"
                        ? {
                              onOpenGalery: () => {
                                  const index = findIndex(imageFile => imageFile === element.imageId, imgFiles);
                                  handleShowViewer(index);
                              },
                          }
                        : {};
                return <Message key={element._id} {...element} {...addiotionalProps} />;
            })}
            {activeIndexOnViewer !== null && (
                <MessageViewer activeIndex={activeIndexOnViewer} files={imgFiles} onCancel={handleCancelViewer} />
            )}
        </MessagesWrapper>
    );
});
