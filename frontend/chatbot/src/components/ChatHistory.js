// ChatHistory.js

import React, { useEffect, useState } from 'react';
//import '../styles/ChatHistory.css'; // Add your CSS file if needed

const ChatHistory = ({ user_id }) => {
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    // Fetch chat history using user_id when the component mounts
    const fetchChatHistory = async () => {
      try {
        const response = await fetch('http://localhost:5000/fetch_chat_history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id }),
        });

        const data = await response.json();

        if (response.ok) {
          setChatHistory(data.chat_history);
        } else {
          console.error('Error fetching chat history:', data.error);
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };

    if (user_id) {
      fetchChatHistory();
    }
  }, [user_id]);

  return (
    <div className="chat-history-container">
      <h2>Chat History</h2>
      {chatHistory.length === 0 ? (
        <p>No chat history available.</p>
      ) : (
        <ul>
          {chatHistory.map((entry) => (
            <li key={entry.timestamp} className="chat-entry">
              <div className="entry-details">
                <p className="user-input">User Input: {entry.user_input}</p>
                <p className="chatbot-response">
                  Chatbot Response:
                  <br />
                  {entry.chatbot_response.split(', ').map((college, index) => (
                    <span key={index}>{college}</span>
                  ))}
                </p>
              </div>
              <p className="timestamp">Timestamp: {entry.timestamp}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ChatHistory;
