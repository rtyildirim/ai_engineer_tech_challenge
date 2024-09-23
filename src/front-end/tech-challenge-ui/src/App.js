import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';
import ResultPage from './ResultPage';

function App() {
  const [apiUrl, setApiUrl] = useState('');
  const [question, setQuestion] = useState('');
  const [focus, setFocus] = useState('');
  const [file, setFile] = useState(null); // State for the uploaded file
  const [randomFile, setRandomFile] = useState(null); // State for the uploaded file
  const [errorMessage, setErrorMessage] = useState(''); // State for error messages
  const navigate = useNavigate();  // Use useNavigate for navigation

  useEffect(() => {
    // Fetch the config.json file
    fetch('/config.json')
      .then((response) => response.json())
      .then((data) => setApiUrl(data.REACT_APP_API_URL))
      .catch((error) => console.error('Error loading config:', error));
  }, []);

  const handleSubmit = () => {
    const postData = {
      question: question,
      ...(focus && { focus: focus }), // Only include focus if selected
      ...(randomFile && { attachment: randomFile }) // Only include attachment if file is uploaded
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
        // Store question, focus, and response in localStorage
        localStorage.setItem('question', question);
        localStorage.setItem('focus', focus);
        localStorage.setItem('responseText', data.response_text);

        // Navigate to result page
        navigate('/result');  // Use navigate instead of history.push
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (selectedFile && selectedFile.type === "text/plain") {
      setFile(selectedFile);
      setErrorMessage('');
    } else {
      setErrorMessage('Please select a .txt file.');
      setFile(null);
    }
  };

  const generateRandomFileName = (length) => {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return `${result}.txt`;
  };

  const handleFileUpload = async () => {
    if (file) {
      const reader = new FileReader();

      const formData = new FormData();
      formData.append('file', file);

      reader.onload = async (e) => {
        const fileContent = e.target.result;

        try {
          const response = await fetch(`${apiUrl}/file`, {
            method: 'POST',
            body: fileContent,
          });

          if (!response.ok) {
            throw new Error('Network response was not ok');
          }

          const data = await response.json();

          const randomFile = data.fileName;
          setRandomFile(randomFile);

          console.log('File upload response:', randomFile);
        } catch (error) {
          console.error('Error uploading file:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="title">Ask Your Question</h1>
        <div className="form-container">
          <input
            className="input-box"
            type="text"
            placeholder="Enter your question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />

          <select className="dropdown" value={focus} onChange={(e) => setFocus(e.target.value)}>
            <option value="">Select Focus</option>
            <option value="Web">Web</option>
            <option value="Academic">Academic</option>
            <option value="Math">Math</option>
            <option value="Writing">Writing</option>
            <option value="Video">Video</option>
            <option value="Social">Social</option>
          </select>

          <h1>Upload a .txt File</h1>
          <input
            className="file-input" // Add the class here
            type="file"
            accept=".txt"
            onChange={handleFileChange}
          />
          <button className="upload-button" onClick={handleFileUpload}>Upload File</button>
          {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Use class for error message */}


          <button className="submit-button" onClick={handleSubmit}>Submit</button>
        </div>
      </header>
    </div>
  );
}

export default function AppWithRouter() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<App />} />
        <Route path="/result" element={<ResultPage />} />
      </Routes>
    </Router>
  );
}
