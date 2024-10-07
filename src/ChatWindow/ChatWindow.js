import React, { useRef, useEffect } from "react";

import "./ChatWindow.css";

function ChatWindow({ messages, messageInput, setMessageInput, handleSendMessage }) {
  const messageEndRef = useRef(null);
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <div className="chat-window">
      <div className="chat-window-message-box">
        <div className="header"> </div>
        <div className="messages">
          {messages.map((message, index) => (
            <div key={index} className={message.sender === "client" ? "client-message" : "server-message"}>
              {message.content}
            </div>
          ))}
          <div ref={messageEndRef} />
        </div>
        <div className="message-input">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type your message..."
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;
