// ChatWindow.jsx
// The central orchestrator of the chat feature.
// Real-world concept: Container vs Presentational components.
//   Container (this file) = owns state, handles logic, passes data down
//   Presentational (MessageBubble etc.) = receives props, renders UI
// This pattern is used across React codebases everywhere.

import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import VoiceButton from './VoiceButton';

function ChatWindow() {
  // --- STATE ---
  // useState stores data that, when changed, causes a re-render.
  // Each piece of state has a single responsibility.

  // The full conversation history — array of message objects
  const [messages, setMessages] = useState([
    {
      id: crypto.randomUUID(),
      role: 'bot',
      text: "Welcome to Grand Palace Hotel! 🏨 I'm your AI assistant. How can I help you today? You can ask me about room bookings, availability, pricing, or any hotel services.",
      timestamp: new Date(),
      intent: 'greeting',
    },
  ]);

  // What the user has typed (text input fallback)
  const [inputText, setInputText] = useState('');

  // Voice button state machine: 'idle' | 'listening' | 'loading'
  const [voiceState, setVoiceState] = useState('idle');

  // Whether the bot is currently generating a response
  const [isTyping, setIsTyping] = useState(false);

  // Error message to show the user
  const [error, setError] = useState(null);

  // --- REFS ---
  // useRef gives you a mutable object that does NOT trigger re-renders.
  // Perfect for: DOM references, timers, previous values.

  // Reference to the bottom of the message list — for auto-scrolling
  const messagesEndRef = useRef(null);

  // --- EFFECTS ---
  // useEffect runs after every render where its dependencies changed.
  // Here: auto-scroll to bottom whenever messages array updates.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // --- HANDLERS ---

  // Adds a message to the conversation history.
  // Using functional update form: prev => [...prev, newMsg]
  // This ensures we always work with the LATEST state,
  // not a stale closure. This is a common React bug if done wrong.
  const addMessage = (role, text, intent = null) => {
    const newMessage = {
      id: crypto.randomUUID(),
      role,
      text,
      timestamp: new Date(),
      intent,
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  // Sends user text to the backend and handles the response.
  // This is a placeholder — in Step 4, this will call the real API.
  const sendMessage = async (text) => {
    if (!text.trim()) return;

    // Clear any previous error
    setError(null);

    // Add user message to UI immediately (optimistic update)
    addMessage('user', text);
    setInputText('');

    // Show typing indicator
    setIsTyping(true);
    setVoiceState('loading');

    try {
      // --- PLACEHOLDER — Step 4 replaces this with real API call ---
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Mock response for now
      const mockResponse = {
        text: `I received your message: "${text}". The full AI response system will be connected in Step 4.`,
        intent: 'general_query',
      };
      // --- END PLACEHOLDER ---

      addMessage('bot', mockResponse.text, mockResponse.intent);

    } catch (err) {
      // Never show raw error objects to users — always human-friendly messages
      setError('Sorry, I could not connect to the hotel system. Please try again.');
      console.error('Chat error:', err);
    } finally {
      // finally block ALWAYS runs — whether success or error.
      // This ensures the UI never gets stuck in a loading state.
      setIsTyping(false);
      setVoiceState('idle');
    }
  };

  // Handle text input form submission
  const handleTextSubmit = (e) => {
    e.preventDefault(); // Prevent page reload (default form behavior)
    sendMessage(inputText);
  };

  // Handle voice button click — placeholder, Step 3 adds real speech
  const handleVoiceClick = () => {
    if (voiceState === 'idle') {
      // Placeholder: just show listening state for 2 seconds
      setVoiceState('listening');
      setTimeout(() => {
        setVoiceState('idle');
        sendMessage('Book a deluxe room for two nights'); // Mock transcript
      }, 2000);
    } else if (voiceState === 'listening') {
      setVoiceState('idle');
    }
  };

  // --- RENDER ---
  return (
    <div className="chat-window">

      {/* Message list — scrollable area */}
      <div className="messages-container">
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Show typing indicator when bot is processing */}
        {isTyping && <TypingIndicator />}

        {/* Error banner */}
        {error && (
          <div className="error-banner">
            ⚠️ {error}
            <button onClick={() => setError(null)} className="error-dismiss">✕</button>
          </div>
        )}

        {/* Invisible element at the bottom — scroll target */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area — fixed at the bottom */}
      <div className="input-area">
        <VoiceButton
          state={voiceState}
          onClick={handleVoiceClick}
        />

        {/* Text input as fallback — real systems ALWAYS offer text + voice */}
        <form className="text-input-form" onSubmit={handleTextSubmit}>
          <input
            type="text"
            className="text-input"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Or type your message..."
            disabled={voiceState === 'loading'}
          />
          <button
            type="submit"
            className="send-btn"
            disabled={!inputText.trim() || voiceState === 'loading'}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatWindow;