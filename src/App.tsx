import React, { useState } from 'react';
import type { InteractionState } from './types';
import { initialState } from './types';
import { FormPanel } from './components/FormPanel';
import { ChatPanel } from './components/ChatPanel';

function App() {
  const [formState, setFormState] = useState<InteractionState>(initialState);
  const [messages, setMessages] = useState<{type: string, content: string}[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = async (msg: string) => {
    const newMessages = [...messages, { type: 'human', content: msg }];
    setMessages(newMessages);
    setIsThinking(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages,
          form_state: formState
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to connect to backend server. Make sure FastAPI is running on port 8000.');
      }

      const data = await response.json();
      setMessages(data.messages);
      setFormState(data.form_state);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred");
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="layout-container">
      {error && (
        <div style={{ position: 'absolute', top: '1rem', left: '50%', transform: 'translateX(-50%)', background: 'var(--danger-color)', color: 'white', padding: '1rem 2rem', borderRadius: '8px', zIndex: 100, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
          {error}
        </div>
      )}
      <FormPanel state={formState} />
      <ChatPanel 
        messages={messages} 
        isThinking={isThinking} 
        onSendMessage={handleSendMessage} 
      />
    </div>
  );
}

export default App;
