import {memo, useEffect} from "react";
import styled from "styled-components";
import {Progressive} from "../common/Picture";
import SwiperCore, {Navigation, Pagination, Keyboard, Mousewheel, Zoom} from "swiper";
import {Swiper, SwiperSlide} from "swiper/react";
import {render, unmountComponentAtNode} from "react-dom";
SwiperCore.use([Navigation, Pagination, Keyboard, Mousewheel, Zoom]);

const Modal = styled.div`
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999999999999999;
    position: fixed;
    padding: 40px 0;
    text-align: center;
    overflow: hidden auto;
    background-color: ${props => (props.isMobile ? "black" : "rgba(0, 0, 0, 0.6)")};
    animation: fadeIn 0.5s;
    &:before {
        content: "";
        height: 100%;
        display: inline-block;
        vertical-align: middle;
    }
`;

const ModalContainer = styled.div`
    position: relative;
    width: ${props => (props.isMobile ? "100vw" : "80vw")};
    max-height: 75vh;
    display: inline-block;
    vertical-align: middle;
`;

const ModalClose = styled.button`
    position: absolute;
    top: -40px;
    right: 10px;
    width: 30px;
    height: 30px;
    &:after,
    &:before {
        position: absolute;
        content: "";
        left: 0;
        width: 100%;
        height: 4px;
        background: #fff;
        transform: rotate(45deg);
    }
    &:before {
        transform: rotate(-45deg);
    }
`;

const ImgViewer = styled.div`
    width: ${props => (props.isMobile ? "100vw" : "80vw")};
    height: 75vh;
    display: flex;
    align-items: center;
    justify-content: center;
    .picture {
        width: ${props => (props.isMobile ? "100vw" : "80vw")};
        height: 75vh;
    }
`;

const SwiperPagination = styled.div`
    font-size: 2em;
    color: white;
    text-shadow: 0px 0px 4px black;
    text-align: center;
    z-index: 10;
    width: 100%;
    position: absolute;
    bottom: 10px;
`;

export const MessageViewer = memo((props) => {
    useEffect(() => {
        const container = document.getElementById("gallery");
        render(
            <InnerMessageViewer {...props} />,
            container
        )
    }, [props]);
    
    useEffect(() => {
        return () => {
            unmountComponentAtNode(document.getElementById("gallery"))
        }
    }, []);

    return null;
})

const InnerMessageViewer = memo(({activeIndex, files, onCancel}) => {
    const isMobile = window.innerWidth <= 500;

    useEffect(() => {
        const handle = e => {
            if (e.keyCode === 27) {
                e.preventDefault();
                onCancel();
            }
        };

        window.document.addEventListener("keydown", handle);
        return () => {
            window.document.removeEventListener("keydown", handle);
        };
    }, [onCancel]);

    return (
        <Modal isMobile={isMobile} onClick={onCancel}>
            <ModalContainer isMobile={isMobile}>
                <ModalClose onClick={onCancel} />
                <Swiper
                    spaceBetween={50}
                    preloadImages={false}
                    slidesPerView={1}
                    navigation={{nextEl: ".next-button", prevEl: ".prev-button"}}
                    autoplay={false}
                    loop={true}
                    pagination={{
                        el: ".swiper-pagination",
                        type: "fraction",
                    }}
                    keyboard={{
                        enabled: true,
                    }}
                    mousewheel={true}
                    zoom={true}
                    initialSlide={activeIndex}
                    grabCursor={true}
                >
                    {files.map((file, index) => {
                        return (
                            <SwiperSlide key={file} virtualIndex={index}>
                                <ImgViewer isMobile={isMobile}>
                                    <Progressive
                                        className="picture"
                                        imageId={file}
                                        imgStyle={{backgroundColor: 'white'}}
                                        onClick={e => e.stopPropagation()}
                                    />
                                </ImgViewer>
                            </SwiperSlide>
                        );
                    })}
                    <SwiperPagination className="swiper-pagination" />
                </Swiper>
                {!isMobile && (
                    <>
                        <button className="prev-button" onClick={e => e.stopPropagation()} />
                        <button className="next-button" onClick={e => e.stopPropagation()} />
                    </>
                )}
            </ModalContainer>
        </Modal>
    );
});
