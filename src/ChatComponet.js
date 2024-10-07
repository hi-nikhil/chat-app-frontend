import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import ChatSidebar from "./ChatSidebar/ChatSidebar";
import ChatWindow from "./ChatWindow/ChatWindow";
import { SERVER_PROD_API, WEBSOCKET_PROD_API } from "./common-constants";
import { useNavigate } from "react-router-dom";

// Connect to the server
const socket = io(WEBSOCKET_PROD_API);

function ChatComponent() {
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState({});
  const [selectedChatId, setSelectedChatId] = useState();
  const [userData, setUserData] = useState({});
  const [chatSessions, setChatSessions] = useState([]);

  const navigate = useNavigate();

  const handleLogout = () => {
    if (socket) {
      socket.disconnect();
    }

    navigate("/login");
  };

  const fetchChatHistory = async (userDetails) => {
    try {
      const response = await fetch(
        `${SERVER_PROD_API}/api/messages?filters[sender_id][$eq]=${userDetails.userId}&pagination[pageSize]=100`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userDetails.token}`,
          },
        }
      );

      const data = await response.json();

      const chatDetails = data.data;
      let chatHistory = {};
      for (let i = 0; i < chatDetails.length; i++) {
        if (chatHistory[chatDetails[i].chat_session_id] == undefined) {
          chatHistory[chatDetails[i].chat_session_id] = [
            {
              messageId: chatDetails[i].id,
              sender: chatDetails[i].sender_type,
              content: chatDetails[i].message_content,
            },
          ];
        } else {
          chatHistory[chatDetails[i].chat_session_id].push({
            messageId: chatDetails[i].id,
            sender: chatDetails[i].sender_type,
            content: chatDetails[i].message_content,
          });
        }
      }

      let history = [];
      for (let key in chatHistory) {
        history.push({ sessionId: key, messages: chatHistory[key] });
      }
      history.reverse();
      setChatSessions(history);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const addMessageToChatHistory = (sessionId, message) => {
    setChatSessions((prevChatSessions) => {
      // Make a copy of the previous chat sessions array
      let updatedChatSessions = [...prevChatSessions];
      let sessionIdPresent = false;

      // Update the chat session if it exists
      for (let i = 0; i < updatedChatSessions.length; i++) {
        if (updatedChatSessions[i]["sessionId"] === sessionId) {
          sessionIdPresent = true;
          updatedChatSessions[i]["messages"] = [...updatedChatSessions[i]["messages"], message];
          break;
        }
      }

      // If the session ID is not present, create a new session
      if (!sessionIdPresent) {
        updatedChatSessions = [{ sessionId: sessionId, messages: [message] }, ...updatedChatSessions];
      }

      return updatedChatSessions;
    });
  };

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      const message = messageInput.trim();
      // Add message to the client-side state
      setMessages((prevMessages) => ({
        ...prevMessages,
        [selectedChatId]: [
          ...(prevMessages[selectedChatId] || []),
          { messageId: selectedChatId + 1, content: message, sender: "client" },
        ],
      }));

      addMessageToChatHistory(selectedChatId, { messageId: selectedChatId + 1, content: message, sender: "client" });

      // Emit message to the server
      socket.emit("message", { ...userData, message: message });

      // Clear the input field
      setMessageInput("");
    }
  };

  const setCurrentSession = (sessionId) => {
    for (let i = 0; i < chatSessions.length; i++) {
      if (chatSessions[i]["sessionId"] == sessionId) {
        setSelectedChatId(sessionId);
        setMessages({ [sessionId]: chatSessions[i]["messages"] });
        let userDetails = JSON.parse(localStorage.getItem("user"));
        let token = localStorage.getItem("token");
        userDetails.sessionId = sessionId;
        setUserData({ ...userDetails, token: token });
        localStorage.setItem("user", JSON.stringify(userDetails));
        break;
      }
    }
  };

  useEffect(() => {
    let userDetails = JSON.parse(localStorage.getItem("user"));
    let token = localStorage.getItem("token");

    let data = {
      userName: userDetails.userName,
      userId: userDetails.userId,
      sessionId: userDetails.sessionId,
      token: token,
    };

    setUserData(data);
    setSelectedChatId(data.sessionId);

    // Fetch chat history from the backend
    fetchChatHistory(data);

    // Ensure no duplicate listeners
    socket.off("message");

    // Set up socket listener for messages
    socket.on("message", (message) => {
      let userDetails = JSON.parse(localStorage.getItem("user"));
      setMessages((prevMessages) => ({
        ...prevMessages,
        [userDetails.sessionId]: [
          ...(prevMessages[userDetails.sessionId] || []),
          { messageId: userDetails.sessionId + 1, content: message, sender: "server" },
        ],
      }));
      addMessageToChatHistory(userDetails.sessionId, {
        messageId: userDetails.sessionId + 1,
        content: message,
        sender: "server",
      });
    });

    return () => {
      socket.off("message");
    };
  }, []);

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <ChatSidebar chatSessions={chatSessions} setSelectedChatId={setCurrentSession} />

      {/* Chat Window */}
      <ChatWindow
        messages={messages[selectedChatId] || []}
        messageInput={messageInput}
        setMessageInput={setMessageInput}
        handleSendMessage={handleSendMessage}
      />
      <button onClick={handleLogout} className="logout-button">
        Logout
      </button>
    </div>
  );
}

export default ChatComponent;
