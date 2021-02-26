import React, {memo, useState} from "react";
import {Col, Row} from "react-simple-flex-grid";
import {newLine2Br, smooth} from "../Helper";
import {Feedback} from "./Feedback";
import {Button} from "../common/Button";
import {UnreadMessages} from "../common/UnreadMessages";
import styled from "styled-components";
import {useQuery, useQueryClient} from "react-query";
import {useDataMutation} from "../hooks/useDataMutation";
import {useTranslation} from "react-i18next";
import {Thumbnail} from "../common/Picture";
import {Dropzone} from "../chat/Dropzone";
import {useCommentOperation} from "../chat/Input";
import {useToast} from "../hooks/useToast";
import {Flex} from "../styled/Flex";
import {MessageViewer} from "../chat/MessageViewer";
import {setGlobalState} from "../hooks/useGlobalState";
import {useContacts} from "../hooks/useContacts";

const PriceContent = styled("h2")`
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
`;

const ItemID = styled.span`
    opacity: 0.5;
    margin-left: 10px;
    font-size: 1rem;
`;
const LightItemID = styled(ItemID)`
    color: rgba(0, 0, 0, 0.3);
`;

export const Badge = styled.span`
    padding: 0.1rem 0.8rem;
    color: white;
    border-radius: 4px;
    background-color: #fbb03b;
`;

const FloatingContainer = styled.div`
    box-shadow: 0 0.1rem 2rem rgba(4, 6, 28, 0.1);
    padding: 1.5rem;
    border-radius: 5px;
    margin-bottom: 2rem;
`;

const StyledCol = styled(Col)`
    margin-bottom: 1rem;
`;

export const ImageContainer = styled.div`
    padding: 0 1rem;
    width: ${props => props.width ?? "100%"};
    height: ${props => props.height ?? "300px"};
    display: flex !important;
    justify-content: space-around;
    align-items: center;
`;

const ImageContent = styled(ImageContainer)`
    cursor: pointer;
`;

const ThumbnailList = styled(Flex)`
    margin: 5px 0 0 0;
    overflow-x: auto;
`;

const ThumbnailImg = styled(Thumbnail)`
    width: 70px;
    height: 60px;
    margin: 0 5px 0 0;
    flex: none;
    transition: border-color 0.3s;
    border: ${props => (props.isActive ? `3px solid #027BF1` : "3px solid transparent")};
    :hover {
        border: 3px solid #027bf1;
    }
`;

const thumbnailFormatTypes = {webp: "quotation_item_thumbnail_webp", jpeg: "quotation_item_thumbnail_jpg"};
const imageFormatTypes = {jpeg: "500x500_jpg", webp: "500x500_webp"};
const thumbnailImageStyle = {width: "70px", height: "60px"};

export const QuotationItem = memo(({id, data: item, unread, preliminary}) => {
    const queryClient = useQueryClient();
    const {t} = useTranslation();
    const quantity = item.quantity ?? 1;
    const {currentContact} = useContacts();
    const contactId = currentContact._id ?? "client";
    const OperatedItem = {
        _id: item._id,
        contactId,
    };
    const {mutate: approve} = useDataMutation("/newQuotationItems/approve", {
        onSuccess: () => {
            queryClient.invalidateQueries("newQuotationItems");
        },
    });
    const {mutate: decline} = useDataMutation("/newQuotationItems/decline", {
        onSuccess: () => {
            queryClient.invalidateQueries("newQuotationItems");
        },
    });
    const {mutate: reset} = useDataMutation("/newQuotationItems/resetItem", {
        onSuccess: () => {
            queryClient.invalidateQueries("newQuotationItems");
        },
    });
    const {data: usd, isLoading: forexIsLoading} = useQuery(
        [
            "forex",
            {
                transport: "axios",
            },
        ],
        {
            select: forex => 1 / forex.USD.value,
            staleTime: 24 * 60 * 60 * 1000,
            cacheTime: 24 * 60 * 60 * 1000,
        },
    );

    const {popup: popupToast} = useToast();
    const {sendImage, sendFile} = useCommentOperation();

    //控制图片显示
    const [activePhoto, setActivePhoto] = useState(item.photos[0]);
    const [activeIndexOnViewer, setActiveIndexOnViewer] = useState(null);
    const photos = item.photos;
    const handleShowViewer = index => {
        setActiveIndexOnViewer(index);
    };
    const handleCancelViewer = () => {
        setActiveIndexOnViewer(null);
    };

    const onSendImage = async inputFiles => {
        await sendImage(id, inputFiles);
        popupToast(t("chat.sendingAPictureSuccessfully"));
    };

    const onSendFile = async inputFiles => {
        await sendFile(id, inputFiles);
        popupToast(t("chat.sendFileSuccessfully"));
    };
    return (
        <Dropzone
            onSendImage={onSendImage}
            onSendFile={onSendFile}
            maskStyle={{fontSize: "18px"}}
            transferStyle={{width: "12rem", height: "12rem"}}
        >
            <div style={{padding: "15px 0"}} key={item._id}>
                <Row gutter={40}>
                    <StyledCol span={12}>
                        <Badge>
                            {t("quotation.item")} #{item.index}
                        </Badge>
                    </StyledCol>
                    <StyledCol span={12}>
                        <h2>
                            {item.name}
                            <ItemID>#{item.itemId}</ItemID>
                        </h2>
                    </StyledCol>
                    <StyledCol span={12} lg={6} md={12}>
                        <ImageContent>
                            <Thumbnail
                                formatTypes={imageFormatTypes}
                                _id={activePhoto}
                                imgStyle={{maxHeight: "300px"}}
                                onClick={() => {
                                    handleShowViewer(photos.findIndex(id => id === activePhoto));
                                }}
                            />
                            {activeIndexOnViewer != null && (
                                <MessageViewer
                                    activeIndex={activeIndexOnViewer}
                                    files={item.photos}
                                    onCancel={handleCancelViewer}
                                />
                            )}
                        </ImageContent>
                        <ThumbnailList justifyCenter>
                            {item.photos.map((p, i) => (
                                <ThumbnailImg
                                    key={p}
                                    formatTypes={i === 0 ? imageFormatTypes : thumbnailFormatTypes}
                                    isActive={p === activePhoto}
                                    _id={p}
                                    imgStyle={thumbnailImageStyle}
                                    onClick={() => {
                                        setActivePhoto(p);
                                    }}
                                />
                            ))}
                        </ThumbnailList>
                    </StyledCol>
                    <Col span={12} lg={6} md={12}>
                        <FloatingContainer>
                            <PriceContent>
                                <div>
                                    {forexIsLoading ? `${t("loading")}...` : `$${smooth(item.price / usd) * quantity}`}
                                    <LightItemID>(¥{smooth(item.price, 0, "ceil") * quantity})</LightItemID>
                                </div>
                                {typeof quantity === "number" && quantity > 1 && (
                                    <h5 style={{lineHeight: "22px"}}>
                                        {quantity} ×{" "}
                                        {forexIsLoading ? `${t("loading")}...` : `$${smooth(item.price / usd)}`}
                                        <LightItemID>(¥{smooth(item.price, 0, "ceil")})</LightItemID>
                                    </h5>
                                )}
                            </PriceContent>

                            {typeof item.characteristics === "string" && item.characteristics.length > 0 && (
                                <div
                                    key="characteristics"
                                    style={{
                                        marginBottom: "1rem",
                                    }}
                                >
                                    <h5>{t("quotation.specifications")}</h5>
                                    {newLine2Br(item.characteristics.trim())}
                                </div>
                            )}
                            {/*{typeof item.description === "string" && item.description.length > 0 && (*/}
                            {/*    <MiniCollapse title={<h5>{t("quotation.additionalInformation")}</h5>}>*/}
                            {/*        {newLine2Br(item.description.trim())}*/}
                            {/*    </MiniCollapse>*/}
                            {/*)}*/}

                            <Feedback
                                style={{marginRight: "10px"}}
                                preliminary={preliminary}
                                approved={item.approved}
                                declined={item.declined}
                                onDecline={() => {
                                    decline(OperatedItem);
                                }}
                                onApprove={() => {
                                    approve(OperatedItem);
                                }}
                                onCancel={() => {
                                    reset(OperatedItem);
                                }}
                            />
                            <Button
                                onClick={() => setGlobalState("openedChatId", id)}
                                outline={false}
                                style={{position: "relative", marginTop: "10px", overflow: "visible"}}
                            >
                                {t("quotation.openChat")}
                                {unread > 0 && (
                                    <UnreadMessages
                                        style={{
                                            position: "absolute",
                                            right: "-0.75rem",
                                            top: "-0.75rem",
                                            zIndex: "1000",
                                        }}
                                    >
                                        {unread < 100 ? unread : "😰"}
                                    </UnreadMessages>
                                )}
                            </Button>
                        </FloatingContainer>
                    </Col>
                </Row>
            </div>
        </Dropzone>
    );
});
