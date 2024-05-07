import React, { useState } from "react";
import "../styles/CareerChatbot.css";
import Navbar from "./Navbar";

const CareerChatbot = () => {
  const [userInput, setUserInput] = useState("");
  const [predictedCareers, setPredictedCareers] = useState([]);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const token = localStorage.getItem("accessToken");
      console.log(`Access token: ${token}`);

      const apiUrl = "http://127.0.0.1:5000/predict_career";
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_input: userInput }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setPredictedCareers(data.predictedCareers || []);
      setError(null); // Clear any previous errors
    } catch (error) {
      setPredictedCareers([]);
      setError(`Error: ${error.message}`);
      console.error("Error:", error);
    }
  };

  return (
    <div className="career-chatbot-wrapper">
      <Navbar />

      <div className="chatbot-container">
        <h1>Career Chatbot</h1>
        <form className="chatbot-form" onSubmit={handleSubmit}>
          <div className="input-section">
            <img
              src="./Images/user.png"
              alt="User Logo"
              className="user-logo"
            />
            <input
              className="input-box"
              placeholder="Enter your prompt..."
              type="text"
              name="user_input"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              required
            />
            <button type="submit" className="predict-button">
              Submit
            </button>
          </div>
        </form>
        {userInput && (
          <div className="response-section">
            {error ? (
              <p className="error-message">Error predicting careers: {error}</p>
            ) : (
              <div className="response-container">
                <img
                  src="./Images/Chatbot.png"
                  alt="Chatbot Logo"
                  className="bot-logo"
                />
                <p>{predictedCareers.message}</p>
                <div className="response-details">
                  {predictedCareers.length > 0 ? (
                    <ul>
                      {predictedCareers.map((career, index) => (
                        <li key={index}>
                          <p>
                            <span className="course-name">Program:</span>{" "}
                            {/* Applying slicing logic */}
                            {career.predictedCourse.match(/^\d+\./) ? career.predictedCourse.slice(career.predictedCourse.indexOf('.') + 1) : career.predictedCourse}
                          </p>

                          <p>
                            <span className="course-name">College Name:</span>{" "}
                            {career.predictedInstitute}
                          </p>
                          <p>
                            <span className="course-name">College City:</span>{" "}
                            {career.predictedCity}
                          </p>
                          <p>
                            <span className="course-name">State:</span>{" "}
                            {career.predictedState}
                          </p>
                          {/* <p>
                            <span className="course-name">Probability:</span> {career.probability}
                          </p> */}
                          <p>
                            <span className="course-name">Website:</span>{" "}
                            <a href={career.website} target="_blank">
                              {career.website}
                            </a>
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No predicted careers</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerChatbot;
