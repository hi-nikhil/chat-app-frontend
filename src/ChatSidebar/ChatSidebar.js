import React from "react";
import "./ChatSidebar.css";

function ChatSidebar({ chatSessions, setSelectedChatId }) {
  return (
    <div className="chat-sidebar">
      <h3>Chat History</h3>
      <ul>
        {chatSessions.map((session) => (
          <li key={session.sessionId} onClick={() => setSelectedChatId(session.sessionId)}>
            {`${session.messages[0].content.split(" ").slice(0, 4).join(" ")} ...`}{" "}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ChatSidebar;
