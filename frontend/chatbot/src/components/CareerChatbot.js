// import React, { useState } from "react";
// import "../styles/CareerChatbot.css";
// import Navbar from "./Navbar";

// const CareerChatbot = () => {
//   const [userInput, setUserInput] = useState("");
//   const [predictedCareers, setPredictedCareers] = useState([]);
//   const [error, setError] = useState(null);

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     try {
//       const token = localStorage.getItem("accessToken");
//       console.log(`Access token: ${token}`);

//       const apiUrl = "http://127.0.0.1:5000/predict_career";
//       const response = await fetch(apiUrl, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ user_input: userInput }),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }

//       const data = await response.json();
//       setPredictedCareers(data.predictedCareers || []); // Set only the predictedCareers array in state
//       setError(null); // Clear any previous errors
//     } catch (error) {
//       setPredictedCareers([]);
//       setError(`Error: ${error.message}`);
//       console.error("Error:", error);
//     }
//   };

//   return (
//     <div className="career-chatbot-wrapper">
//       <Navbar />

//       <div className="chatbot-container">
//         <h1>Career Chatbot</h1>
//         <form className="chatbot-form" onSubmit={handleSubmit}>
//           <div className="input-section">
            // <img
            //   src="./Images/user.png"
            //   alt="User Logo"
            //   className="user-logo"
            // />
//             <input
//               className="input-box"
//               placeholder="Enter your prompt..."
//               type="text"
//               name="user_input"
//               value={userInput}
//               onChange={(e) => setUserInput(e.target.value)}
//               required
//             />
//             <button type="submit" className="predict-button">
//               Submit
//             </button>
//           </div>
//         </form>
//         {userInput && (
//           <div className="response-section">
//             {error ? (
//               <p className="error-message">Error predicting careers: {error}</p>
//             ) : (
            //   <div className="response-container">
            //     <img
            //       src="./Images/Chatbot.png"
            //       alt="Chatbot Logo"
            //       className="bot-logo"
            //     />
//                 <p>{predictedCareers.message}</p>
//                 <div className="response-details">
//                   {predictedCareers.length > 0 ? (
//                     <ul>
//                       {predictedCareers.map((career, index) => (
//                         <li key={index}>
//                           <p>
//                             <span className="course-name">Program:</span>{" "}
//                             {/* Applying slicing logic */}
//                             {career.predictedCourse.match(/^\d+\./) ? career.predictedCourse.slice(career.predictedCourse.indexOf('.') + 1) : career.predictedCourse}
//                           </p>

//                           <p>
//                             <span className="course-name">College Name:</span>{" "}
//                             {career.predictedInstitute}
//                           </p>
//                           <p>
//                             <span className="course-name">College City:</span>{" "}
//                             {career.predictedCity}
//                           </p>
//                           <p>
//                             <span className="course-name">State:</span>{" "}
//                             {career.predictedState}
//                           </p>
//                           {/* <p>
//                             <span className="course-name">Probability:</span> {career.probability}
//                           </p> */}
//                           <p>
//                             <span className="course-name">Website:</span>{" "}
//                             <a href={career.website} target="_blank">
//                               {career.website}
//                             </a>
//                           </p>
//                         </li>
//                       ))}
//                     </ul>
//                   ) : (
//                     (userInput.toLowerCase() === 'hi' || userInput.toLowerCase() === 'hello') ? (
//                         <p>Hello! Please mention your passion and interests.</p>
//                     ) : null
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CareerChatbot;


import React, { useEffect, useState } from 'react';
import '../styles/CareerPredictor.css'; // Import CSS file for styling
import Navbar from "./Navbar";

const CareerPredictor = () => {
    const [userInput, setUserInput] = useState('');
    const [response, setResponse] = useState('');

    useEffect(() => {
        console.log(localStorage.getItem('accessToken'))
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const token = localStorage.getItem("accessToken");
            console.log(`Access token: ${token}`);

            const apiUrl = "http://127.0.0.1:5000/chatbot";

            const formData = new FormData();
            formData.append('user_input', userInput);

            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();
            if (response.ok) {
                setResponse(data.response);
                setUserInput('');
            } else {
                throw new Error(data.error || 'Failed to get response');
            }
        } catch (error) {
            console.error('Error:', error);
            // Handle error
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSubmit(event);
        }
    };

    return (
        <div className="home-page">
            <Navbar />
        <main className="career-predictor-container">
            <section className="chat-container">
                <div className="chat-box" id="chat-box">
                    {userInput && (
                        <div className="message user">
                            <img
              src="./Images/user.png"
              alt="User Logo"
              className="user-logo"
            />
                            <span className="message-text">{userInput}</span>
                        </div>
                    )}
                    {response && (
                        <div className="message bot">
                            <img
                  src="./Images/Chatbot.png"
                  alt="Chatbot Logo"
                  className="bot-logo"
                />
                            <span className="message-text">{response}</span>
                        </div>
                    )}
                </div>
                <div className="chat-input">
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            id="user-input"
                            className="user-input"
                            placeholder="Type your message..."
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <button className="submit-btn" type="submit">&#10148;</button>
                    </form>
                </div>
            </section>
        </main>
        </div>
    );
};

export default CareerPredictor;



