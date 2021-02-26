import {useEffect, useState} from "react";
import {newLine2Br} from "../Helper";

export const DynamicTextArea = ({value, onChange}) => {
    const [editing, setEditing] = useState(false);
    const [text, setText] = useState(value);
    const valueEmpty = value == null || (typeof value === "string" && value.length === 0);
    const fieldEmpty = text == null || (typeof text === "string" && text.length === 0);
    useEffect(() => {
        setText(value);
    }, [value]);
    return editing ? (
        <>
            <textarea
                rows="4"
                autoFocus
                style={{
                    border: "1px solid #007bf1",
                    borderRadius: "3px",
                    width: "100%",
                }}
                onChange={e => setText(e.target.value)}
                value={text}
            />
            <div>
                <button
                    className="btn btn_outline-color"
                    onClick={() => {
                        onChange(text);
                        setEditing(false);
                    }}
                    style={{
                        height: "inherit",
                        padding: "5px 10px",
                    }}
                >
                    {fieldEmpty ? "❌ Отменить" : "💾 Сохранить"}
                </button>
            </div>
        </>
    ) : (
        <>
            {newLine2Br(value)}
            <button className="btn btn_outline-color" onClick={() => setEditing(true)}>
                {valueEmpty ? "📄 Прокомментировать" : "📄 Изменить"}
            </button>
        </>
    );
};
