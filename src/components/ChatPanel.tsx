import React, { useRef, useEffect } from 'react';
import { Send, Paperclip, Bot, User } from 'lucide-react';

interface ChatPanelProps {
  messages: { type: string, content: string }[];
  isThinking: boolean;
  onSendMessage: (msg: string) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ messages, isThinking, onSendMessage }) => {
  const [input, setInput] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="right-panel">
      <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={20} color="white" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>AI Assistant</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Log interaction details via chat</p>
          </div>
        </div>

        <div className="chat-messages">
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }} className="animate-fade-in">
              <p>Hi! Describe your interaction with an HCP.</p>
              <p style={{ fontSize: '0.875rem', opacity: 0.7, marginTop: '0.5rem' }}>
                Example: "Met with Dr. House today at 2pm. Discussed Vicodin efficiency. Gave him 3 samples. He seemed positive about it."
              </p>
            </div>
          )}

          {messages.map((msg, idx) => {
            const isUser = msg.type === 'human';

            if (!msg.content) return null;

            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }} className="animate-fade-in">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', alignSelf: isUser ? 'flex-end' : 'flex-start' }}>
                  {!isUser && <Bot size={16} color="var(--text-secondary)" />}
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{isUser ? 'You' : 'Assistant'}</span>
                  {isUser && <User size={16} color="var(--text-secondary)" />}
                </div>
                <div className={`chat-bubble ${isUser ? 'user' : 'ai'}`}>
                  {msg.content}
                </div>
              </div>
            );
          })}

          {isThinking && (
            <div className="chat-bubble ai animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '1rem' }}>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="chat-input-area">
          <button type="button" className="btn-icon">
            <Paperclip size={18} />
          </button>
          <input 
            type="text" 
            className="input-glass chat-input" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe Interaction..."
            disabled={isThinking}
          />
          <button type="submit" className="btn-primary" disabled={isThinking || !input.trim()}>
            <Send size={18} /> Log
          </button>
        </form>

      </div>
    </div>
  );
};
