import React, { useState, useEffect, useRef } from "react";
import "./Chatbox.scss";

const Chatbox = (props) => {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const messagesEl = useRef(null);

    const handleSubmit = (event) => {
        event.preventDefault();
        setMessages([...messages, input]);
        setInput("");
    };

    useEffect(() => {    
        console.log(messagesEl.current);
        messagesEl.current?.scrollTo(0, messagesEl.current?.scrollHeight)
    });

    return (
        <div className="chatbox">
            <div className="chatbox-messages" ref={messagesEl}>
                {props.messages.map((message, index) => (
                    <div key={index} className="message-container">
                        <div dangerouslySetInnerHTML={{__html: message.text.replaceAll('\\n', '<br/>')}} key={index} className={"chatbox-message "+message.from}>
                        </div>
                    </div>
                ))}
            </div>
            <form className="chatbox-input-form" onSubmit={handleSubmit}>
            <input
                name="question"
                className="messageinput"
                type="text"
                value={props.value} 
                onChange={e => props.onChange(e)}
                />
                <button className="sendbutton" onClick={props.sendHandler} type="submit">Send</button>
            </form>
        </div>
    );
};

export default Chatbox;
