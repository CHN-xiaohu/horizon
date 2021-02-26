import {memo} from "react";
import {useDropzone} from "react-dropzone";
import {useTranslation} from "react-i18next";
import styled from "styled-components";
import {useAlert} from "../hooks/useAlert";
import {groupBy} from "ramda";

const MaskHint = styled.div`
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 55px 50px;
    z-index: 999;
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden auto;
    background-color: #fff;
    opacity: 0.8;
    font-size: 1em;
    font-weight: bold;
    &:before {
        content: "";
        height: 100%;
        display: inline-block;
        vertical-align: middle;
    }
`;

const MaskBroder = styled.div`
    border: 3px dashed black;
    border-radius: 10px;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
`;

const byError = groupBy(file => file.errors[0].code);

const FileList = styled.ul`
    list-style-type: initial;
    list-style-position: inside;
`;

export const Dropzone = memo(({onSendImage, onSendFile, children, dropStyle, maskStyle, transferStyle}) => {
    const {t} = useTranslation();
    const {alarm} = useAlert();
    const {getRootProps, getInputProps, isDragActive} = useDropzone({
        accept:
            "application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/zip,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/octet-stream,text/plain,application/rtf,application/octet-stream,image/png,image/jpeg,image/webp,video/mp4,video/mpeg,video/x-m4v,video/x-ms-wmv,video/x-msvideo,video/webm,video/x-flv",
        maxFiles: 20,
        noClick: true,
        noDragEventsBubbling: true,
        noKeyboard: true,
        maxSize: 100 * 1024 * 1024,
        onDrop: files => {
            files.forEach(file => {
                file.type.startsWith("image") ? onSendImage([file]) : onSendFile([file]);
            });
        },
        onDropRejected: files => {
            const filesByError = byError(files);
            const errors = Object.keys(filesByError).reduce((errors, key) => {
                const currentErrors = filesByError[key];
                if (key === "too-many-files") {
                    return [...errors, `${t("error.theNumberOfFilesShouldBeLessThan")} 20`];
                } else if (key === "file-too-large") {
                    return [
                        ...errors,
                        <>
                            <div>
                                {t("error.fileSizeShouldBeLessThan")} 100{t("mb")}
                            </div>
                            <FileList>
                                {currentErrors.map(file => (
                                    <li>{file.file.name}</li>
                                ))}
                            </FileList>
                        </>,
                    ];
                } else if (key === "file-too-small") {
                    return [
                        ...errors,
                        <>
                            <div>
                                {t("error.fileSizeShouldBeMoreThan")} 0${t("mb")}
                            </div>
                            <FileList>
                                {currentErrors.map(file => (
                                    <li>{file.file.name}</li>
                                ))}
                            </FileList>
                        </>,
                    ];
                } else if (key === "file-invalid-type") {
                    return [
                        ...errors,
                        <>
                            <div>{t("error.fileFormatIsIncorrect")}</div>
                            <FileList>
                                {currentErrors.map(file => (
                                    <li>{file.file.name}</li>
                                ))}
                            </FileList>
                        </>,
                    ];
                }
                return errors;
            }, []);
            alarm(errors);
        },
    });
    return (
        <div {...getRootProps({className: "dropzone"})} style={{...dropStyle, position: "relative"}}>
            <input {...getInputProps()} />
            {children}
            {isDragActive && (
                <MaskHint style={maskStyle}>
                    <MaskBroder>
                        <img src="/assets/icons/horizon/fileTransfer.svg" alt="" style={transferStyle} />
                        <div>{t("quotation.dragHereToSend")}</div>
                        {/*<div>*/}
                        {/*    {isDragAccept && t("quotation.allFilesWillBeAccepted")}*/}
                        {/*    {isDragReject && t("quotation.someFilesWillBeRejected")}*/}
                        {/*</div>*/}
                    </MaskBroder>
                </MaskHint>
            )}
        </div>
    );
});
