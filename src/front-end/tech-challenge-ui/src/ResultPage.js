import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResultPage.css';

function ResultPage() {
  const navigate = useNavigate();  // Use useNavigate for navigation

  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    // Fetch the config.json file
    fetch('/config.json')
      .then((response) => response.json())
      .then((data) => setApiUrl(data.REACT_APP_API_URL))
      .catch((error) => console.error('Error loading config:', error));
  }, []);

    // Retrieve cached data from localStorage
    const initialPreviousQuestion = localStorage.getItem('question');
    const initialPreviousAnswer = localStorage.getItem('responseText');
    const focus = localStorage.getItem('focus');
  
    const [previousQuestion, setPreviousQuestion] = useState(initialPreviousQuestion);
    const [previousAnswer, setPreviousAnswer] = useState(initialPreviousAnswer);
    const [followUpQuestion, setFollowUpQuestion] = useState('');

  const handleFollowUpSubmit = () => {
    // const apiUrl = localStorage.getItem('apiUrl');  // Assuming it's stored globally
    
    const postData = {
      previousQuestion: previousQuestion,
      previousAnswer: previousAnswer,
      focus: focus,
      question: followUpQuestion
    };

    fetch(`${apiUrl}/infer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Success:', data);
        
        // Update with new follow-up response
        const newAnswer = data.response_text;
        
        // Set the follow-up question as the previousQuestion for the next interaction
        setPreviousQuestion(followUpQuestion);
        setPreviousAnswer(newAnswer);  // Update the previousAnswer with the new response

        // Cache the new values in localStorage
        localStorage.setItem('question', followUpQuestion);
        localStorage.setItem('responseText', newAnswer);

        // Clear the input box for the follow-up question
        setFollowUpQuestion('');
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  useEffect(() => {
    // Update localStorage with the current state of previousQuestion and previousAnswer on component load
    localStorage.setItem('question', previousQuestion);
    localStorage.setItem('responseText', previousAnswer);
  }, [previousQuestion, previousAnswer]);

  return (
    <div className="ResultPage">
      <header className="ResultPage-header">
        <h2>Response</h2>
        <p><strong>Previous Question:</strong> {previousQuestion}</p>
        <p><strong>Filter:</strong> {focus}</p>
        <p><strong>Response:</strong> {previousAnswer}</p>

        {/* Input for follow-up question */}
        <input
          type="text"
          placeholder="Ask a follow-up question"
          value={followUpQuestion}
          onChange={(e) => setFollowUpQuestion(e.target.value)}
        />
        <button onClick={handleFollowUpSubmit}>Ask Follow-Up Question</button>

        {/* Back to main button */}
        <button onClick={() => navigate('/')}>Back to Main</button>
      </header>
    </div>
  );
}

export default ResultPage;
