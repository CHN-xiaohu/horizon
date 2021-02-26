import React, {memo} from "react";
import styled from "styled-components";
import {download, getReadableFileSizeString} from "../Helper";
import {getServerUrl} from "../Helper";
import {Thumbnail} from "../common/Picture";

const getDownloadFileLink = fileId => {
    if (fileId.startsWith("blob:")) return fileId;
    return `${getServerUrl()}/files/${fileId}`;
};
const MessageCode = styled.div`
    max-width: 100%;
    background: #fff;
    border: 1px solid ${props => (props.codeBorder ? "#ccc" : "#fff")};
    border-radius: 5px;
    padding: 6px 8px;
    display: flex;
    justify-content: space-between;
    cursor: pointer;
`;
const MessageCodeTitle = styled.div`
    width: 80%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin-right: 10px;
    color: #bfbfbf;
`;
const MessageCodeName = styled.div`
    color: black;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
`;
const MessageCodeIcon = styled.div`
    display: flex;
    align-items: center;
`;

const Icon = styled.img`
    width: 40px;
    height: 40px;
`;

const ProgressWrapper = styled.div`
    position: relative;
    max-width: 100%;
`;

const Progress = styled.div`
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: ${props => 100 - props.percent}%;
    overflow: hidden;
    transition: height 0.2s;
    filter: grayscale(100%);
`;

export const nl2br = text => {
    return text.split("\n").map((item, key) => (
        <span key={key}>
            {item}
            <br />
        </span>
    ));
};

const thumbnailStyle = {maxWidth: "100%", backgroundColor: "white", cursor: "pointer"};

export const MessageImg = memo(({imageId, meta, percent = 100, onOpenGalery}) => {
    const {width, height} =
        meta == null
            ? {width: "auto", height: "auto"}
            : meta.width > meta.height
            ? {width: "250px", height: "auto"}
            : {width: "auto", height: "250px"};

    const image = (
        <Thumbnail
            style={thumbnailStyle}
            imgStyle={{width, height}}
            _id={imageId}
            onClick={() => {
                onOpenGalery();
            }}
        />
    );

    return (
        <ProgressWrapper>
            {image}
            <Progress percent={percent}>{image}</Progress>
        </ProgressWrapper>
    );
});

const iconMap = {
    doc: "wordIcon.svg",
    docx: "wordIcon.svg",
    xls: "excelIcon.svg",
    xlsx: "excelIcon.svg",
    ppt: "pptIcon.svg",
    pptx: "pptIcon.svg",
    pdf: "pdfIcon.svg",
    rar: "rarIcon.svg",
    zip: "rarIcon.svg",
    psd: "psdIcon.svg",
    txt: "txtIcon.svg",
};

export const getFileIcon = name => {
    const iconType = typeof name === "string" && Object.keys(iconMap).find(extension => name.includes(extension));
    return iconMap[iconType] ?? "unknownIcon.svg";
};

export const MessageFile = memo(({fileId, fileName, fileSize, author, percent = 100}) => {
    const videoType =
        "mp4" ||
        "avi" ||
        "mov" ||
        "wmv" ||
        "asf" || 
        "asx" ||
        "rm" ||
        "rmvb" ||
        "mpg" ||
        "mpeg" ||
        "mpe" ||
        "m4v" ||
        "mkv" ||
        "vob" ||
        "3gp";
    const isVideo = fileName?.includes(videoType);

    const content = isVideo ? (
        <video controls={true} src={getDownloadFileLink(fileId)}></video>
    ) : (
        <MessageCode
            codeBorder={author.login !== "client"}
            onClick={() => {
                download(getDownloadFileLink(fileId), fileName);
            }}
        >
            <MessageCodeTitle>
                <MessageCodeName style={{maxWidth: "140px"}}>{fileName}</MessageCodeName>
                {fileSize !== null && getReadableFileSizeString(fileSize)}
            </MessageCodeTitle>
            <MessageCodeIcon>
                <Icon src={`/assets/icons/horizon/${getFileIcon(fileName)}`} />
            </MessageCodeIcon>
        </MessageCode>
    );

    return (
        <ProgressWrapper>
            {content}
            <Progress percent={percent}>{content}</Progress>
        </ProgressWrapper>
    );
});
