import React, { useEffect, useState } from 'react';
import '../styles/ChatHistory.css'; 

const ChatHistory = () => {
  const [chatHistory, setChatHistory] = useState([]);

  const formatTimestamp = (timestamp) => {
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false, // Use 24-hour format
    };

    return new Intl.DateTimeFormat('en-US', options).format(new Date(timestamp));
  };

  useEffect(() => {
    // Fetch chat history using user_id when the component mounts
    const fetchChatHistory = async () => {
      try {
        const token = localStorage.getItem('accessToken');

        const response = await fetch('http://localhost:5000/fetch_chat_history', {
          method: 'GET', // Use GET method for fetching chat history
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
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

    fetchChatHistory();
  }, []);

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
              <p className="timestamp">{formatTimestamp(entry.timestamp)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ChatHistory;
