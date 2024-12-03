import React, { useState } from 'react';

const AIStudyAssistant = () => {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');

  const handleQuestionSubmit = async () => {
    const apiKey = 'AIzaSyAHRX0xW3SpuzVYbZesaQOeR8VxHVOOpXw';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: question
            }]
          }]
        })
      });
      const data = await res.json();
      setResponse(data.contents[0].parts[0].text);
    } catch (error) {
      console.error('Error fetching AI response:', error);
      setResponse('Error fetching AI response. Please try again later.');
    }
  };

  return (
    <div>
      <h1>AI Study Assistant</h1>
      <textarea
        placeholder="Ask a question related to JEE topics..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <button onClick={handleQuestionSubmit}>Submit</button>
      <div>
        <h2>Response:</h2>
        <p>{response}</p>
      </div>
    </div>
  );
};

export default AIStudyAssistant;
