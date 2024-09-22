import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    // Fetch the config.json file
    fetch('/config.json')
      .then(response => response.json())
      .then(data => setApiUrl(data.REACT_APP_API_URL))
      .catch(error => console.error('Error loading config:', error));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          API URL: <code>{apiUrl}</code>
        </p>
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
