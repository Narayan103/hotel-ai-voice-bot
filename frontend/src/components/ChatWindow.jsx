// ChatWindow.jsx
// Updated to use useAudioRecorder hook.
// Audio blob is sent to Flask backend via chatService (Step 4).
// For now: placeholder sendMessage shows the audio was captured.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import VoiceButton from './VoiceButton';
import useAudioRecorder, { RECORDER_STATES } from '../hooks/useAudioRecorder';

function ChatWindow() {

  const [messages, setMessages] = useState([
    {
      id: crypto.randomUUID(),
      role: 'bot',
      text: "Welcome to Grand Palace Hotel! 🏨 I'm your AI assistant. How can I help you today? Ask me about room bookings, availability, pricing, or any hotel services.",
      timestamp: new Date(),
      intent: 'greeting',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping]   = useState(false);
  const [error, setError]         = useState(null);
  const messagesEndRef            = useRef(null);

  // Auto-scroll when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // addMessage — uses functional update to prevent stale closure bugs
  const addMessage = useCallback((role, text, intent = null) => {
    setMessages(prev => [...prev, {
      id:        crypto.randomUUID(),
      role,
      text,
      timestamp: new Date(),
      intent,
    }]);
  }, []);

  // sendMessage — called with plain text (from voice OR text input)
  // In Step 4, this will call the real Flask API
  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;
    setError(null);
    addMessage('user', text);
    setInputText('');
    setIsTyping(true);

    try {
      // ── PLACEHOLDER ──────────────────────────────────────────────
      // Step 4 replaces this block with a real API call to Flask,
      // which calls Amazon Transcribe + Comprehend + Polly.
      await new Promise(resolve => setTimeout(resolve, 1200));
      addMessage('bot', `Received: "${text}". Full AI pipeline connects in Step 4.`, 'general_query');
      // ── END PLACEHOLDER ──────────────────────────────────────────
    } catch (err) {
      setError('Could not reach the hotel system. Please try again.');
      console.error('sendMessage error:', err);
    } finally {
      setIsTyping(false);
    }
  }, [addMessage]);

  // onAudioReady — called by useAudioRecorder when audio blob is ready.
  // This is the bridge between the recording hook and the send logic.
  // In Step 4, this will send the blob directly to Flask for Transcribe.
  const handleAudioReady = useCallback(async (audioBlob) => {
    try {
      // Log blob details so you can verify audio is being captured
      console.log('Audio captured:', {
        size:  `${(audioBlob.size / 1024).toFixed(1)} KB`,
        type:  audioBlob.type,
      });

      // ── PLACEHOLDER ──────────────────────────────────────────────
      // Step 4 will send this blob to /api/transcribe on Flask.
      // Flask sends it to Amazon Transcribe and returns the text.
      // For now: show a message confirming audio was captured.
      addMessage('bot', `✅ Audio captured (${(audioBlob.size / 1024).toFixed(1)} KB). Amazon Transcribe integration coming in Step 4.`, null);
      // ── END PLACEHOLDER ──────────────────────────────────────────

    } catch (err) {
      setError('Failed to process audio. Please try again.');
      console.error('handleAudioReady error:', err);
    } finally {
      reset();
    }
  }, [addMessage]);

  // Wire up the audio recorder hook
  const {
    recorderState,
    error:             recorderError,
    recordingDuration,
    startRecording,
    stopRecording,
    reset,
    RECORDER_STATES: RS,
  } = useAudioRecorder({ onAudioReady: handleAudioReady });

  // Voice button click — toggle record/stop
  const handleVoiceClick = () => {
    if (recorderState === RS.IDLE || recorderState === RS.ERROR) {
      startRecording();
    } else if (recorderState === RS.RECORDING) {
      stopRecording();
    }
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  // Combine recorder error and chat error for display
  const displayError = recorderError || error;

  return (
    <div className="chat-window">

      <div className="messages-container">
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isTyping && <TypingIndicator />}

        {displayError && (
          <div className="error-banner">
            ⚠️ {displayError}
            <button
              onClick={() => { setError(null); reset(); }}
              className="error-dismiss"
            >✕</button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <VoiceButton
          recorderState={recorderState}
          onClick={handleVoiceClick}
          recordingDuration={recordingDuration}
        />

        <form className="text-input-form" onSubmit={handleTextSubmit}>
          <input
            type="text"
            className="text-input"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Or type your message..."
            disabled={recorderState === RS.PROCESSING}
          />
          <button
            type="submit"
            className="send-btn"
            disabled={!inputText.trim() || recorderState === RS.PROCESSING}
          >
            Send
          </button>
        </form>
      </div>

    </div>
  );
}

export default ChatWindow;