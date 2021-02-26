import {memo, forwardRef, useEffect, useState} from "react";
import {getImageLink} from "../Helper";
import styled from "styled-components";
// import ReactProgressiveImage from "react-progressive-image";
import {useInView} from "react-intersection-observer";

const defaultFormatTypes = {
    webp: "webp",
    jpeg: "jpg",
};

const defaultThumbnailTypes = {
    webp: "thumbnail_webp",
    jpeg: "thumbnail_jpg",
};

const StyledPicture = styled.picture`
    display: flex;
    align-items: center;
    justify-content: center;
`;

const ProgressiveWrapper = styled.div`
    position: relative;

    .progressive-spinner-wrapper {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 32px;
        height: 32px;
    }

    .progressive-spinner {
        animation: rotate 1s ease-in-out infinite;
    }
`;

const Img = styled.img`
    max-width: 100%;
    max-height: 100%;
`;

export const Progressive = memo(
    ({
        imageId,
        formatTypes = defaultFormatTypes,
        thumbnailTypes = defaultThumbnailTypes,
        className,
        style,
        imgClassName,
        imgStyle,
        lazy = true,
    }) => {
        const {ref: inViewRef, inView} = useInView();
        const [srcReady, setSrcReady] = useState(false);
        useEffect(() => {
            if (srcReady || !inView) return;

            const source = document.createElement("source");
            const image = document.createElement("img");
            const picture = document.createElement("picture");

            picture.appendChild(source);
            picture.appendChild(image);

            image.onload = () => {
                setSrcReady(true);
            };

            source.setAttribute("type", "image/webp");
            source.setAttribute("srcSet", getImageLink(imageId, formatTypes.webp));
            image.setAttribute("src", getImageLink(imageId, formatTypes.jpeg));
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [inView]);

        const sourceSrc = getImageLink(imageId, srcReady ? formatTypes.webp : thumbnailTypes.webp);
        const imgSrc = getImageLink(imageId, srcReady ? formatTypes.jpeg : thumbnailTypes.jpeg);
        const imgProps = lazy ? {loading: "lazy"} : {};
        return (
            <ProgressiveWrapper ref={inViewRef}>
                {(srcReady || inView) && (
                    <>
                        <StyledPicture className={className} style={style}>
                            <source type="image/webp" srcSet={sourceSrc} />
                            <Img className={imgClassName} style={imgStyle} src={imgSrc} alt="Loading" {...imgProps} />
                        </StyledPicture>

                        {!srcReady && (
                            <div className="progressive-spinner-wrapper">
                                <svg
                                    //t="1607918042835"
                                    className="progressive-spinner"
                                    viewBox="0 0 1025 1024"
                                    version="1.1"
                                    xmlns="http://www.w3.org/2000/svg"
                                    //p-id="2891"
                                    width="32"
                                    height="32"
                                >
                                    <path
                                        d="M511.432538 1022.856543a511.432538 511.432538 0 1 0 0-1022.84801C228.981558 0.008533 0 228.990092 0 511.441071c0 282.45098 228.981558 511.415472 511.432538 511.415472z m0-113.645986c-219.697369 0-397.786552-178.089183-397.786552-397.769486 0-219.697369 178.089183-397.786552 397.786552-397.786551 219.680303 0 397.769485 178.089183 397.769485 397.786551 0 219.680303-178.089183 397.769485-397.769485 397.769486z"
                                        fill="#CDE6F7"
                                        // p-id="2892"
                                    />
                                    <path
                                        d="M1022.84801 511.441071C1022.84801 228.990092 793.883518 0.008533 511.432538 0.008533a56.831526 56.831526 0 1 0 0 113.663053c219.714436 0 397.769485 178.037983 397.769485 397.769485a56.831526 56.831526 0 0 0 113.663053 0z"
                                        fill="#0078D7"
                                        // p-id="2893"
                                    />
                                </svg>
                            </div>
                        )}
                    </>
                )}
            </ProgressiveWrapper>
        );
    },
);

export const Picture = memo(
    forwardRef(
        (
            {_id, pictureProps, formatTypes = defaultFormatTypes, className, lazy = true, style, imgStyle, ...props},
            ref,
        ) => {
            const finalProps = lazy ? {loading: "lazy", ...props} : props;
            return (
                <StyledPicture className={className} style={style} {...pictureProps}>
                    <source type="image/webp" srcSet={getImageLink(_id, formatTypes.webp)} />
                    <Img
                        style={imgStyle}
                        src={getImageLink(_id, formatTypes.jpeg)}
                        alt="Loading"
                        ref={ref}
                        {...finalProps}
                    />
                </StyledPicture>
            );
        },
    ),
);

export const Thumbnail = memo(
    forwardRef(({formatTypes = defaultThumbnailTypes, ...props}, ref) => {
        return <Picture ref={ref} formatTypes={formatTypes} {...props} />;
    }),
);
