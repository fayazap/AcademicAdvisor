// frontend/src/components/CareerChatbot.js
import React, { useState, useEffect } from 'react';
import '../styles/CareerChatbot.css';
import LogoutButton from './LogoutButton';
import ChatHistory from './ChatHistory';
import Navbar from './Navbar';

const CareerChatbot = ({ user_id }) => {
  const [userInput, setUserInput] = useState('');
  const [predictedCareers, setPredictedCareer] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // You can perform any initialization or data fetching based on user_id here
    // For example, fetch chat history for the user
    // fetchChatHistory(user_id);
  }, [user_id]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const apiUrl = 'http://127.0.0.1:5000/predict_career';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id, user_input: userInput }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setPredictedCareer(data);

      setError(null); // Clear any previous errors
    } catch (error) {
      setPredictedCareer('');
      setError(`Error: ${error.message}`);
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="chatbot-container">
        <h1>Career Chatbot</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-section">
            <img src="./Images/user.png" alt="User Logo" className="user-logo" />
            <input
              className="input-box"
              placeholder="Enter your interest..."
              type="text"
              name="user_input"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              required
            />
            <button type="submit" className="predict-button">
              Predict Career
            </button>
          </div>
        </form>
        {userInput && (
          <div className="response-section">
            {error ? (
              <p className="error-message">Error predicting careers: {error}</p>
            ) : (
              <div className="response-container">
                <img src="./Images/Chatbot.png" alt="Chatbot Logo" className="bot-logo" />
                {predictedCareers.message}
                {Array.isArray(predictedCareers.predictedCareers) &&
                predictedCareers.predictedCareers.length > 0 ? (
                  <ul>
                    {predictedCareers.predictedCareers.map((career, index) => (
                      <li key={index}>
                        <p>
                          <span className="course-name">Program:</span> {career.predictedProgram}
                        </p>
                        <p>
                          <span className="course-name">College Name:</span> {career.predictedCollegeName}
                        </p>
                        <p>
                          <span className="course-name">College Type:</span> {career.predictedCollegeType}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No predicted careers available.</p>
                )}
              </div>
            )}
          </div>
        )}
        <ChatHistory user_id={user_id} />
      </div>
    </div>
  );
};

export default CareerChatbot;
